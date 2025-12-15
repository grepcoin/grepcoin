# @grepcoin/agents

AI Agents for autonomous GrepCoin operations. Run on open-source AI models (Ollama, Llama) or cloud providers (OpenAI).

## Agents

| Agent | Purpose | Key Features |
|-------|---------|--------------|
| **CommunityAgent** | Discord community management | Q&A, moderation, welcomes |
| **SocialAgent** | Twitter/X engagement | Content creation, replies, scheduling |
| **GuardianAgent** | Smart contract monitoring | Health checks, alerts, security |
| **AnalyticsAgent** | Metrics and reporting | Daily/weekly reports, insights |

## Quick Start

```bash
# Install dependencies
npm install

# Run an agent interactively with Ollama
npm run agent:community -- --interactive

# Run with OpenAI
npm run agent:social -- --provider=openai --interactive
```

## Usage

### Programmatic Usage

```typescript
import { quickAgent, CommunityAgent } from '@grepcoin/agents'

// Quick setup with defaults (uses Ollama)
const agent = quickAgent('community')

// Ask a question
const response = await agent.chat('How do I stake GREP tokens?')
console.log(response)

// Run continuously
await agent.run(60000) // Check every minute
```

### Custom Provider

```typescript
import { OpenAIProvider, CommunityAgent } from '@grepcoin/agents'

const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4-turbo-preview'
})

const agent = new CommunityAgent(provider)
```

### Using Ollama (Local AI)

```bash
# Install Ollama: https://ollama.ai
# Pull a model
ollama pull llama3.2

# Run agent
npm run agent:community -- --interactive
```

## Agent Details

### CommunityAgent

Manages Discord community interactions.

**Tools:**
- `get_token_info` - GREP token details
- `get_game_info` - Game information
- `get_staking_info` - Staking tier details
- `flag_message` - Flag for moderation

**Example:**
```typescript
const agent = quickAgent('community')

// Answer questions
await agent.answerQuestion('What games can I play?')

// Welcome new members
await agent.welcomeMember('alice')

// Moderate content
const result = await agent.moderateMessage('some message')
// { safe: true } or { safe: false, reason: '...' }
```

### SocialAgent

Creates and manages social media content.

**Tools:**
- `generate_tweet` - Create tweets
- `generate_thread` - Create Twitter threads
- `analyze_mention` - Analyze replies
- `schedule_content` - Schedule posts

**Example:**
```typescript
const agent = quickAgent('social')

// Generate a tweet
const tweet = await agent.generateTweet('new game launch', 'announcement')

// Generate a thread
const thread = await agent.generateThread('How staking works', 5)

// Respond to a mention
const reply = await agent.respondToMention('@grepcoin is cool!', 'user123')
```

### GuardianAgent

Monitors smart contract health and security.

**Tools:**
- `get_token_metrics` - Token supply, holders
- `get_staking_metrics` - TVL, stakers
- `get_recent_transactions` - Recent activity
- `check_anomalies` - Detect issues
- `send_alert` - Send notifications
- `generate_report` - Security reports

**Example:**
```typescript
const agent = quickAgent('guardian')

// Check contract health
const health = await agent.checkContractHealth()

// Generate security report
const report = await agent.generateSecurityReport('daily')

// Get alerts
const alerts = agent.getAlerts('high')
```

### AnalyticsAgent

Tracks metrics and generates insights.

**Tools:**
- `get_website_metrics` - Traffic data
- `get_game_metrics` - Gameplay stats
- `get_community_metrics` - Social growth
- `get_fundraising_metrics` - Campaign data
- `compare_periods` - Period comparison
- `generate_chart_data` - Visualization data

**Example:**
```typescript
const agent = quickAgent('analytics')

// Generate reports
const daily = await agent.generateDailyReport()
const weekly = await agent.generateWeeklyReport()

// Analyze specific metrics
const analysis = await agent.analyzeMetric('user retention')

// Ask questions
const answer = await agent.askQuestion('How are games performing?')
```

## Configuration

### Environment Variables

```env
# AI Provider
AI_PROVIDER=ollama              # or 'openai'
AI_MODEL=llama3.2              # model name

# OpenAI (if using)
OPENAI_API_KEY=sk-...

# Ollama (if using)
OLLAMA_HOST=http://localhost:11434
```

### Supported Models

**Ollama (Local):**
- `llama3.2` (recommended)
- `mistral`
- `codellama`
- `mixtral`

**OpenAI:**
- `gpt-4-turbo-preview`
- `gpt-4`
- `gpt-3.5-turbo`

**Compatible APIs:**
- Together AI
- Groq
- Fireworks
- Any OpenAI-compatible endpoint

## Architecture

```
packages/agents/
├── src/
│   ├── core/
│   │   ├── agent.ts      # Base Agent class
│   │   └── types.ts      # Type definitions
│   ├── providers/
│   │   ├── ollama.ts     # Ollama provider
│   │   └── openai.ts     # OpenAI provider
│   ├── agents/
│   │   ├── community-agent.ts
│   │   ├── social-agent.ts
│   │   ├── guardian-agent.ts
│   │   └── analytics-agent.ts
│   ├── tools/            # Shared tools
│   ├── index.ts          # Exports
│   └── run-agent.ts      # CLI runner
```

## Extending

### Create a Custom Agent

```typescript
import { Agent, AgentConfig, AIProvider, Task } from '@grepcoin/agents'

class MyAgent extends Agent {
  constructor(provider: AIProvider) {
    const config: AgentConfig = {
      name: 'MyAgent',
      description: 'Does something cool',
      systemPrompt: 'You are a helpful assistant...',
      tools: [],
      temperature: 0.7
    }
    super(config, provider)
  }

  protected async handleTask(task: Task): Promise<any> {
    // Handle custom task types
    switch (task.type) {
      case 'my_task':
        return this.chat(task.data.prompt)
      default:
        throw new Error(`Unknown task: ${task.type}`)
    }
  }

  protected async periodicCheck(): Promise<void> {
    // Run on each interval
    console.log('Checking...')
  }
}
```

### Add Custom Tools

```typescript
import { z } from 'zod'
import { Tool } from '@grepcoin/agents'

const myTool: Tool = {
  name: 'my_tool',
  description: 'Does something useful',
  parameters: z.object({
    input: z.string().describe('The input')
  }),
  execute: async ({ input }) => {
    // Do something
    return { result: input.toUpperCase() }
  }
}
```

## License

MIT - GrepLabs LLC
