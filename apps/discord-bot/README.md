# @grepcoin/discord-bot

AI-powered Discord bot for GrepCoin community management. Built with Discord.js and the GrepCoin AI agent system.

## Features

### Slash Commands

**GrepCoin Commands:**
- `/ask <question>` - Ask about GrepCoin (AI-powered)
- `/games [game]` - Get game information
- `/staking [tier]` - Learn about staking tiers
- `/status` - Check contract health
- `/alerts [severity]` - View security alerts
- `/stats` - Platform statistics
- `/links` - Useful links
- `/help` - Command help

**AI Developer Commands:**
- `/analyze <code>` - Analyze code for issues
- `/explain <concept>` - Explain programming concepts
- `/debug <error>` - Help debug errors
- `/optimize <code>` - Suggest optimizations

### Live Updates

The bot provides real-time updates to designated channels:

- **Activity Channel** - Live game activity feed
- **Highlights Channel** - Achievement unlocks and milestones
- **Monitoring Channel** - Contract health and security alerts

### Auto-Response

The bot automatically responds to questions in designated support channels:
- `#support`
- `#help`
- `#questions`
- `#ask-grepbot`

## Quick Start

### Prerequisites

- Node.js 18+
- Discord Bot Token
- Discord Application Client ID
- (Optional) Ollama or OpenAI API key

### Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Environment Variables

```env
# Discord (Required)
DISCORD_TOKEN=your-bot-token
DISCORD_CLIENT_ID=your-client-id
DISCORD_GUILD_ID=your-server-id  # Optional: for dev

# Channels (Optional)
DISCORD_ACTIVITY_CHANNEL_ID=...
DISCORD_HIGHLIGHTS_CHANNEL_ID=...
DISCORD_MONITORING_CHANNEL_ID=...

# Web App
WEB_APP_URL=http://localhost:3000

# AI Provider
AI_PROVIDER=ollama  # or 'openai'
AI_MODEL=llama3.2

# OpenAI (if using)
OPENAI_API_KEY=sk-...

# Intervals
ACTIVITY_POLL_INTERVAL=30000
HEALTH_CHECK_INTERVAL=300000
```

### Running

```bash
# Development (with hot reload)
npm run dev

# Production
npm run build
npm start
```

## Discord Setup

### 1. Create Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Note the `CLIENT_ID`

### 2. Create Bot

1. Go to "Bot" section
2. Click "Add Bot"
3. Copy the `TOKEN`
4. Enable required intents:
   - Server Members Intent (for welcomes)
   - Message Content Intent (for auto-response)

### 3. Invite Bot

Generate an invite URL with these permissions:
- Read Messages/View Channels
- Send Messages
- Embed Links
- Use Slash Commands
- Add Reactions

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=274877958144&scope=bot%20applications.commands
```

## Architecture

```
apps/discord-bot/
├── src/
│   ├── index.ts           # Main entry point
│   ├── embeds/            # Discord embed builders
│   │   ├── stats.ts
│   │   ├── health.ts
│   │   └── alerts.ts
│   └── services/
│       ├── activity-poller.ts   # Live activity feed
│       └── guardian-monitor.ts  # Contract monitoring
├── dist/                  # Compiled output
├── package.json
└── tsconfig.json
```

## Commands Reference

### `/ask`
Ask the AI assistant anything about GrepCoin.

```
/ask question: How do I stake GREP tokens?
```

### `/games`
Get information about GrepCoin games.

```
/games              # List all games
/games game:grep-rails  # Specific game info
```

### `/staking`
Learn about staking tiers and rewards.

```
/staking            # Overview of all tiers
/staking tier:gold  # Specific tier details
```

### `/status`
Check current contract health and metrics.

### `/alerts`
View security alerts from the Guardian agent.

```
/alerts             # All alerts
/alerts severity:high   # Filter by severity
```

### `/analyze`
Analyze code for issues and vulnerabilities.

```
/analyze code: function transfer(to, amount) { ... }
```

## AI Integration

The bot uses `@grepcoin/agents` for AI-powered responses:

```typescript
import { quickAgent, CommunityAgent } from '@grepcoin/agents'

// Initialize with Ollama (local)
const agent = quickAgent('community', {
  provider: 'ollama',
  model: 'llama3.2'
})

// Or with OpenAI
const agent = quickAgent('community', {
  provider: 'openai',
  model: 'gpt-4-turbo-preview'
})
```

## Extending

### Add a New Command

```typescript
// In commands array
new SlashCommandBuilder()
  .setName('mycommand')
  .setDescription('My custom command')
  .addStringOption(option =>
    option.setName('input')
      .setDescription('Input value')
      .setRequired(true)
  )

// In handleCommand switch
case 'mycommand': {
  const input = interaction.options.getString('input', true)
  const response = await agent.chat(`Handle: ${input}`)
  await interaction.editReply(response)
  break
}
```

### Add a Service

```typescript
// services/my-service.ts
export class MyService {
  private interval: NodeJS.Timeout | null = null

  async start() {
    this.interval = setInterval(() => {
      this.check()
    }, 60000)
  }

  stop() {
    if (this.interval) clearInterval(this.interval)
  }

  private async check() {
    // Your logic
  }
}
```

## License

MIT - GrepLabs LLC
