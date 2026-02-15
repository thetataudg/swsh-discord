# SWSH Discord Bot

A Discord bot that monitors SWSH albums and posts new photos to a Discord channel.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create a `.env` file** with your credentials (see `.env.example`):
   ```env
   DISCORD_TOKEN=your_discord_bot_token_here
   DISCORD_CHANNEL_ID=your_channel_id_here
   SWSH_API_KEY=your_swsh_api_key_here
   POLL_INTERVAL_MS=60000
   ```

3. **Set up Discord Bot:**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Enable bot capabilities and get your bot token
   - Invite the bot to your server with proper permissions (Send Messages, Embed Links)
   - Get the channel ID where you want photos posted

## Running

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

## How it works

- The bot polls the SWSH API at the interval specified in `POLL_INTERVAL_MS`
- For each album, it checks if there's a new photo (first photo in the album)
- If a new photo is detected, it posts an embed to the Discord channel
- Photo IDs are tracked in `state.json` to avoid re-posting
