import * as SwshApi from "@somewhere-somehow/swsh-public-api";
import { Client, TextChannel, EmbedBuilder, AttachmentBuilder } from "discord.js";
import { loadState, saveState } from "./state";

let swsh: SwshApi.SwshApiClient;

function getSwshClient() {
  if (!swsh) {
    if (!process.env.SWSH_API_KEY) {
      throw new Error("SWSH_API_KEY environment variable is not set");
    }
    console.log(`[Init] SWSH API Key loaded: ${process.env.SWSH_API_KEY.substring(0, 8)}...`);
    swsh = new SwshApi.SwshApiClient({
      apiKey: process.env.SWSH_API_KEY
    });
  }
  return swsh;
}

export async function pollAlbums(discord: Client) {
  const channel = (await discord.channels.fetch(
    process.env.DISCORD_CHANNEL_ID!
  )) as TextChannel;

  if (!channel) return;

  const state = loadState();

  const swsh = getSwshClient();
  const albumsResponse = await swsh.album.getAlbums();
  
  console.log(`[Poller] Checking ${albumsResponse.data.length} albums for new photos...`);

  for (const album of albumsResponse.data) {
    const photosResponse = await swsh.album.getPhotos({ albumId: album.albumId });

    if (!photosResponse.data || photosResponse.data.length === 0) continue;

    // Find all new photos in this album (from newest to oldest until we hit a known photo)
    const newPhotos = [];
    const lastKnownPhotoId = state[album.albumId];
    
    for (const photo of photosResponse.data) {
      if (photo.photoId === lastKnownPhotoId) {
        // We've reached the last photo we posted, stop here
        break;
      }
      newPhotos.push(photo);
    }

    if (newPhotos.length === 0) continue;

    console.log(`[Poller] Found ${newPhotos.length} new photo(s) in album "${album.name || "Unnamed"}"`);

    // Post photos in reverse order (oldest to newest)
    for (let i = newPhotos.length - 1; i >= 0; i--) {
      const photo = newPhotos[i];
      if (!photo) continue;

      console.log(`[Poller] - Posting photo ${newPhotos.length - i}/${newPhotos.length}`);
      console.log(`[Poller] - Photo ID: ${photo.photoId}`);
      console.log(`[Poller] - Album ID: ${album.albumId}`);
      console.log(`[Poller] - Album Owner ID: ${album.ownerId || "Unknown"}`);

      try {
        console.log(`[Poller] Downloading image from ${photo.stableUrl}...`);
        
        // Download the image
        const response = await fetch(photo.stableUrl);
        if (!response.ok) {
          throw new Error(`Failed to download image: ${response.statusText}`);
        }
        const imageBuffer = Buffer.from(await response.arrayBuffer());
        
        // Extract file extension from URL or default to jpg
        const urlPath = new URL(photo.stableUrl).pathname;
        const extension = urlPath.split('.').pop() || 'jpg';
        const filename = `photo-${photo.photoId}.${extension}`;
        
        // Create attachment
        const attachment = new AttachmentBuilder(imageBuffer, { name: filename });
        
        const embed = new EmbedBuilder()
          .setTitle("📸 New Photo Uploaded to SWSH")
          .addFields([
            { name: "Album", value: album.name || "Unnamed Album", inline: true }
          ])
          .setImage(`attachment://${filename}`)
          .setTimestamp(new Date());

        console.log(`[Poller] Posting to Discord channel...`);
        await channel.send({ embeds: [embed], files: [attachment] });
        console.log(`[Poller] Successfully posted!`);
        
        // Update state after each successful post
        state[album.albumId] = photo.photoId;
        saveState(state);
        
        // Add delay between posts to avoid rate limiting (1.5 seconds)
        if (i > 0) {
          console.log(`[Poller] Waiting 1.5s before next post...`);
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      } catch (error) {
        console.error(`[Poller] Error posting photo:`, error);
        // If we hit an error (like rate limit), save progress and stop
        break;
      }
    }

    // Small delay between albums
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`[Poller] Poll complete.`);
}
