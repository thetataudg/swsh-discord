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
npm start
```

## Production Deployment (Linux with systemd)

1. **Install dependencies on the server:**
   ```bash
   npm install
   ```

2. **Edit the systemd service file** (`swsh-discord.service`):
   - Replace `swshbot` with your Linux username (or keep it if you create a dedicated user)
   - Replace `/opt/swsh-bot` with the full path to this project
   - Ensure npx path is correct (check with `which npx`)

3. **Copy the service file to systemd:**
   - Replace `YOUR_USERNAME` with your Linux username
   - Replace `/path/to/swsh-discord` with the full path to this project
   - Ensure Node.js path is correct (check with `which node`)

3. **Copy the service file to systemd:**
   ```bash
   sudo cp swsh-discord.service /etc/systemd/system/
   ```

4. **Enable and start the service:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable swsh-discord
   sudo systemctl start swsh-discord
   ```

5. **Check status and logs:**
   ```bash
   sudo systemctl status swsh-discord
   sudo journalctl -u swsh-discord -f
   ```

**Managing the service:**
```bash
sudo systemctl stop swsh-discord      # Stop the bot
sudo systemctl restart swsh-discord   # Restart the bot
sudo systemctl status swsh-discord    # Check status
```

## How it works

- The bot polls the SWSH API at the interval specified in `POLL_INTERVAL_MS`
- For each album, it checks if there's a new photo (first photo in the album)
- If a new photo is detected, it posts an embed to the Discord channel
- Photo IDs are tracked in `state.json` to avoid re-posting
