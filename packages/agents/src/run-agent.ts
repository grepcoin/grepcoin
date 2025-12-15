#!/usr/bin/env node
import 'dotenv/config'
import { quickAgent, AgentType } from './index'

const AGENT_TYPES = ['community', 'social', 'guardian', 'analytics'] as const

async function main() {
  const args = process.argv.slice(2)
  const agentType = args[0] as AgentType

  if (!agentType || !AGENT_TYPES.includes(agentType)) {
    console.log(`
GrepCoin AI Agent Runner

Usage: npm run agent:<type>
       tsx src/run-agent.ts <type>

Available agents:
  community  - Discord community management, Q&A, moderation
  social     - Twitter/X content creation and engagement
  guardian   - Smart contract monitoring and security
  analytics  - Metrics tracking and reporting

Options:
  --provider=ollama|openai  AI provider to use (default: ollama)
  --model=<model>           Model name (default: llama3.2 for ollama)
  --interactive             Run in interactive chat mode

Environment variables:
  OPENAI_API_KEY    Required for OpenAI provider
  OLLAMA_HOST       Ollama server URL (default: http://localhost:11434)

Examples:
  npm run agent:community
  tsx src/run-agent.ts social --provider=openai
  tsx src/run-agent.ts guardian --interactive
`)
    process.exit(1)
  }

  // Parse options
  const options: Record<string, string> = {}
  for (const arg of args.slice(1)) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=')
      options[key] = value || 'true'
    }
  }

  const provider = (options.provider as 'ollama' | 'openai') || 'ollama'
  const model = options.model

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                   GrepCoin AI Agents                      ║
╠═══════════════════════════════════════════════════════════╣
║  Agent: ${agentType.padEnd(48)}║
║  Provider: ${provider.padEnd(45)}║
║  Model: ${(model || 'default').padEnd(47)}║
╚═══════════════════════════════════════════════════════════╝
`)

  try {
    const agent = quickAgent(agentType, { provider, model })

    if (options.interactive) {
      // Interactive mode
      await runInteractive(agent)
    } else {
      // Continuous mode
      console.log(`Starting ${agentType} agent in continuous mode...`)
      console.log('Press Ctrl+C to stop\n')

      agent.on('event', (event) => {
        if (event.type === 'error') {
          console.error('[ERROR]', event.data.message)
        }
      })

      await agent.run(60000) // Run with 1 minute intervals
    }
  } catch (error) {
    console.error('Failed to start agent:', error)
    process.exit(1)
  }
}

async function runInteractive(agent: any) {
  const readline = await import('readline')

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  console.log('Interactive mode. Type your message or "quit" to exit.\n')

  rl.on('close', () => {
    console.log('\nGoodbye!')
    process.exit(0)
  })

  const prompt = () => {
    rl.question('You: ', async (input) => {
      if (!input || input.toLowerCase() === 'quit' || input.toLowerCase() === 'exit') {
        rl.close()
        return
      }

      try {
        const response = await agent.chat(input)
        console.log(`\nAgent: ${response}\n`)
      } catch (error) {
        console.error('Error:', error)
      }

      prompt()
    })
  }

  prompt()
}

main().catch(console.error)
