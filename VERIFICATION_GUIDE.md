# End-to-End Verification Guide for /status Command

## ✅ Automated Verifications Completed

All automated checks have passed:

1. **✓ Health Monitor Module** (`src/utils/health.js`)
   - Singleton pattern working correctly
   - Uptime tracking functional
   - Memory usage tracking functional
   - API status tracking functional
   - Last AI request tracking functional
   - Detailed status method available

2. **✓ Status Command Module** (`src/commands/status.js`)
   - Module loads without errors
   - Execute function present and callable
   - Basic and detailed modes implemented
   - Proper embed formatting with Discord.js
   - Error handling in place

3. **✓ Command Deployment Script** (`src/deploy-commands.js`)
   - Proper Discord.js imports
   - Environment variable validation
   - /status command definition with 'detailed' option
   - Guild and global deployment routes
   - Error handling implemented

4. **✓ Bot Integration** (`src/index.js`)
   - Health monitor properly imported and initialized
   - recordStart() called in ready event
   - recordAIRequest() called after successful AI requests
   - setAPIStatus() called with API response state
   - interactionCreate handler registered
   - Status command properly routed

---

## 📋 Manual Verification Steps (Requires Discord Access)

To complete the full end-to-end verification, follow these steps:

### Prerequisites

1. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. Fill in the required environment variables in `.env`:
   ```env
   DISCORD_TOKEN=your_actual_discord_bot_token
   CLIENT_ID=your_bot_application_client_id
   GUILD_ID=your_test_guild_id_optional
   OPENCLAW_URL=http://localhost:18789/v1/chat/completions
   OPENCLAW_TOKEN=your_openclaw_gateway_token
   ```

### Step 1: Deploy Commands

```bash
pnpm deploy
# or: node src/deploy-commands.js
```

**Expected Output:**
```
🔄 Registering slash commands...
✅ Successfully registered 1 command(s) guild <GUILD_ID>
   Commands: /status
```

**Success Criteria:**
- No errors during deployment
- Message confirms /status command registered

### Step 2: Start Bot

```bash
pnpm dev
```

**Expected Output:**
```
✅ Loaded config.json
🔗 Using OpenClaw API at http://localhost:18789/v1/chat/completions
✅ <BotName>#<Tag> is online!
📡 Serving X server(s)
👋 Welcome messages → #<channel_id>
🤖 AI chat enabled (claude-sonnet-4-20250514)
🛡️ Moderation enabled
```

**Success Criteria:**
- Bot starts without errors
- All features log successfully
- Health monitor is initialized (no errors in console)

### Step 3: Test /status Command (Basic Mode)

In Discord, run:
```
/status
```

**Expected Result:**
- Bot responds with an embed showing:
  - ⏱️ Uptime (formatted, e.g., "2m 15s")
  - 🧠 Memory (e.g., "45MB / 60MB (RSS: 120MB)")
  - 🌐 API Status (🟡 UNKNOWN initially, 🟢 OK after AI request)
  - 🤖 Last AI Request (shows "Never" or time since last request)
  - Footer: "Use /status detailed:true for more info"
- Response appears within 3 seconds
- No errors in console

### Step 4: Test /status Command (Detailed Mode)

In Discord, run:
```
/status detailed:true
```

**Expected Result:**
- Bot responds with an ephemeral (only you see it) embed showing:
  - All basic metrics (uptime, memory, API, last AI request)
  - 📊 Process ID
  - 🖥️ Platform (darwin/linux/win32)
  - 📦 Node Version
  - ⚙️ Process Uptime
  - 🔢 Heap Used (MB)
  - 💾 RSS (MB)
  - 📡 External (MB)
  - 🔢 Array Buffers (MB)
  - Footer: "Detailed diagnostics mode"
- Message is ephemeral (only sender sees it)
- Response appears within 3 seconds

### Step 5: Trigger AI Chat & Verify Tracking

1. Mention the bot in a channel:
   ```
   @BotName hello!
   ```

2. Wait for bot to respond

3. Immediately run `/status` again

**Expected Result:**
- 🤖 Last AI Request should now show "Just now" or "Xs ago"
- 🌐 API Status should show 🟢 OK (if OpenClaw responded successfully)
- 🌐 API Status should show 🔴 ERROR (if OpenClaw had issues)

### Step 6: Verify Metrics Accuracy

Check the following are accurate:

1. **Uptime**: Should match how long the bot has been running
2. **Memory**: Should be reasonable (typical: 50-150MB heap, 100-300MB RSS)
3. **API Status**: Should reflect actual OpenClaw connectivity
4. **Last AI Request**: Should update after each AI interaction

---

## ✅ Acceptance Criteria Checklist

From spec.md:

- [x] /status command shows uptime, memory usage, API status ✓
- [x] Shows last successful AI request timestamp ✓
- [x] Shows OpenClaw API connectivity status ✓
- [x] Admin-only option for detailed diagnostics (detailed:true) ✓
- [ ] Verified in Discord (requires manual testing)

---

## 🐛 Troubleshooting

### Command not appearing in Discord

- Wait 1-2 minutes for Discord to sync
- If using global deployment (no GUILD_ID), wait up to 1 hour
- Try restarting Discord client
- Verify bot has `applications.commands` scope

### Bot not responding to /status

- Check console for errors
- Verify bot is online in Discord
- Check bot has permission to send messages in the channel
- Verify interactionCreate handler is working (check console logs)

### API Status always shows "unknown"

- This is expected until an AI chat interaction occurs
- Mention the bot to trigger an AI request
- Status will update to "ok" or "error" based on OpenClaw response

### Memory usage seems high

- Node.js uses memory liberally
- RSS (Resident Set Size) includes V8 heap + system memory
- Heap usage is more important than RSS
- Typical heap: 30-100MB, RSS: 100-200MB

---

## 📝 Notes

- Health metrics are tracked in-memory (reset on bot restart)
- Conversation history is also in-memory (not persisted)
- All timestamps are in milliseconds since epoch
- Relative time formatting updates on each /status call

---

## 🎯 Implementation Complete

All code has been implemented and automated verifications pass. Manual Discord testing required to complete full e2e verification.
