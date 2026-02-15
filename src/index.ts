import dotenv from "dotenv";

dotenv.config();

import { Client, GatewayIntentBits } from "discord.js";
import { pollAlbums } from "./poller.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);

  // Run immediately on startup
  pollAlbums(client).catch(console.error);

  // Poll on interval
  setInterval(() => {
    pollAlbums(client).catch(console.error);
  }, Number(process.env.POLL_INTERVAL_MS));
});

client.login(process.env.DISCORD_TOKEN);
