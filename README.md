# Bill Bot (Volvox Discord Bot)

AI-powered Discord bot for the Volvox community.

## Features

- **AI Chat** - Powered by Claude, responds when mentioned
- **Welcome Messages** - Greets new members in a configurable channel
- **Moderation** - Detects spam/scam patterns and alerts mods

## Setup

1. Copy `.env.example` to `.env` and fill in:
   - `DISCORD_TOKEN` - Your Discord bot token
   - `ANTHROPIC_API_KEY` - Your Anthropic API key

2. Edit `config.json` for your server:
   - Channel IDs for welcome messages and mod alerts
   - AI system prompt and model settings
   - Enable/disable features

3. Install and run:
   ```bash
   pnpm install
   pnpm start
   ```

## Discord Bot Setup

1. Create app at https://discord.com/developers/applications
2. Bot → Add Bot → Copy token
3. Enable intents:
   - Message Content Intent ✅
   - Server Members Intent ✅
4. OAuth2 → URL Generator:
   - Scopes: `bot`
   - Permissions: View Channels, Send Messages, Read History, Manage Messages
5. Invite bot to server with generated URL

## Config

```json
{
  "ai": {
    "enabled": true,
    "model": "claude-sonnet-4-20250514",
    "maxTokens": 1024,
    "systemPrompt": "...",
    "channels": []  // empty = all channels, or list specific channel IDs
  },
  "welcome": {
    "enabled": true,
    "channelId": "...",
    "message": "Welcome, {user}!"  // placeholders: {user}, {username}, {server}, {memberCount}
  },
  "moderation": {
    "enabled": true,
    "alertChannelId": "...",
    "autoDelete": false
  }
}
```

## License

MIT
