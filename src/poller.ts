import { SwshApiClient } from "@somewhere-somehow/swsh-public-api";
import { Client, TextChannel, EmbedBuilder } from "discord.js";
import { loadState, saveState } from "./state";

let swsh: SwshApiClient;

function getSwshClient() {
  if (!swsh) {
    if (!process.env.SWSH_API_KEY) {
      throw new Error("SWSH_API_KEY environment variable is not set");
    }
    console.log(`[Init] SWSH API Key loaded: ${process.env.SWSH_API_KEY.substring(0, 8)}...`);
    swsh = new SwshApiClient({
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

    const newest = photosResponse.data[0];
    if (!newest) continue;

    if (state[album.albumId] !== newest.photoId) {
      console.log(`[Poller] New photo detected in album "${album.name || "Unnamed"}"`);
      console.log(`[Poller] - Photo ID: ${newest.photoId}`);
      console.log(`[Poller] - Album ID: ${album.albumId}`);
      console.log(`[Poller] - Album Owner ID: ${album.ownerId || "Unknown"}`);
      
      state[album.albumId] = newest.photoId;

      const embedFields = [
        { name: "Album", value: album.name || "Unnamed Album", inline: true }
      ];
      
      if (album.ownerId) {
        embedFields.push({ name: "Album Owner ID", value: album.ownerId, inline: true });
      }

      const embed = new EmbedBuilder()
        .setTitle("📸 New Photo Uploaded")
        .addFields(embedFields)
        .setImage(newest.originalUrl)
        .setTimestamp(new Date());

      console.log(`[Poller] Posting photo to Discord channel...`);
      await channel.send({ embeds: [embed] });
      console.log(`[Poller] Successfully posted photo!`);

      saveState(state);
    }
  }
  
  console.log(`[Poller] Poll complete.`);
}
