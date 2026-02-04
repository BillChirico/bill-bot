# Channel Mode Backwards Compatibility Test

## Purpose
Verify that the bot still works in channel mode for backwards compatibility with the original behavior.

## Pre-Test Setup

### 1. Update config.json
Change the `historyMode` setting to `channel`:

```json
{
  "ai": {
    "enabled": true,
    "model": "claude-sonnet-4-20250514",
    "maxTokens": 1024,
    "historyMode": "channel",  // <- Change from "user" to "channel"
    "systemPrompt": "...",
    "channels": []
  },
  ...
}
```

### 2. Restart the Bot
```bash
pnpm dev
```

Verify the bot starts successfully and connects to Discord.

---

## Test Cases

### Test 1: Per-Channel History (Different Users Share Context)

**Objective:** Verify that when in channel mode, different users in the same channel share conversation history.

**Steps:**
1. **User A** in **Channel #general**: Mention the bot and say: `@BillBot My favorite color is blue`
2. Wait for bot response (should acknowledge the color)
3. **User B** in **Channel #general**: Mention the bot and say: `@BillBot What is User A's favorite color?`
4. Expected: Bot should respond with "blue" (showing shared channel context)

**Expected Result:** ✅ Bot remembers information across different users in the same channel

---

### Test 2: History Isolation Between Channels

**Objective:** Verify that different channels have separate conversation histories.

**Steps:**
1. **User A** in **Channel #general**: `@BillBot Remember that my name is Alice`
2. Wait for bot response
3. **User A** in **Channel #random**: `@BillBot What is my name?`
4. Expected: Bot should NOT know the name (different channel = different history)

**Expected Result:** ✅ Each channel has isolated conversation history

---

### Test 3: /clear Command Clears Channel History

**Objective:** Verify that /clear command clears the channel's history (not just one user's).

**Steps:**
1. **User A** in **Channel #general**: `@BillBot The secret word is banana`
2. Wait for bot response
3. **User B** in **Channel #general**: `/clear`
4. Wait for confirmation message: "✅ This channel's conversation history has been cleared! Starting fresh."
5. **User A** in **Channel #general**: `@BillBot What was the secret word?`
6. Expected: Bot should NOT remember "banana" (history was cleared)

**Expected Result:** ✅ /clear clears the entire channel's history

---

### Test 4: Multiple Users Contributing to Channel Context

**Objective:** Verify complex multi-user channel conversation flow.

**Steps:**
1. **User A** in **Channel #general**: `@BillBot We're planning a party on Friday`
2. Wait for bot response
3. **User B** in **Channel #general**: `@BillBot The party theme is pirates`
4. Wait for bot response
5. **User C** in **Channel #general**: `@BillBot What day is the party and what's the theme?`
6. Expected: Bot responds with "Friday" and "pirates" (combining info from Users A and B)

**Expected Result:** ✅ Bot maintains shared context across multiple users in the channel

---

## Verification Checklist

After completing all tests, verify:

- [ ] Different users in the same channel share conversation context
- [ ] Different channels have isolated histories
- [ ] /clear command message says "This channel's" (not "Your")
- [ ] /clear command clears history for all users in the channel
- [ ] Bot shows no errors in console logs
- [ ] Bot behavior matches the original channel-based mode

---

## Post-Test Cleanup

### 1. Restore User Mode (if desired)
Change config.json back to user mode:

```json
{
  "ai": {
    "historyMode": "user",  // <- Restore to "user" mode
    ...
  }
}
```

### 2. Restart Bot
```bash
pnpm dev
```

---

## Implementation Details

### How Channel Mode Works

When `config.ai.historyMode = "channel"`:
- `getHistoryKey(message)` returns `message.channel.id`
- All users in the same channel share the same conversation history
- `/clear` command clears the channel's history for all users
- Different channels maintain separate histories

### Code Changes

The implementation uses a `getHistoryKey()` function that switches between:
- `message.author.id` (user mode - per-user history)
- `message.channel.id` (channel mode - per-channel history)

This ensures backwards compatibility with the original channel-based behavior.

---

## Expected Test Results

| Test | User Mode | Channel Mode |
|------|-----------|--------------|
| User A sets info, User B queries | ❌ Not shared | ✅ Shared |
| Same user, different channels | ✅ Shared | ❌ Not shared |
| /clear clears | User's history | Channel's history |

---

## Notes

- Requires at least 2 Discord users and 2 channels for complete testing
- All tests should be performed in a test Discord server
- Document any unexpected behavior in TESTING_RESULTS.md
