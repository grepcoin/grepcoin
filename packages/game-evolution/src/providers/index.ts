import Anthropic from '@anthropic-ai/sdk'
import { OllamaProvider } from './ollama'

export type ProviderType = 'ollama' | 'claude' | 'auto'

export interface AIProvider {
  generate(systemPrompt: string, userPrompt: string): Promise<string>
  getName(): string
}

class ClaudeProvider implements AIProvider {
  private client: Anthropic
  private model: string

  constructor(model = 'claude-3-haiku-20240307') {
    this.client = new Anthropic()
    this.model = model
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })

    const textBlock = response.content.find(block => block.type === 'text')
    return textBlock ? textBlock.text : ''
  }

  getName(): string {
    return `Claude (${this.model})`
  }
}

class OllamaAIProvider implements AIProvider {
  private ollama: OllamaProvider

  constructor() {
    this.ollama = new OllamaProvider()
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<string> {
    return this.ollama.generate(systemPrompt, userPrompt)
  }

  getName(): string {
    return `Ollama (${this.ollama.getModel()})`
  }

  async isAvailable(): Promise<boolean> {
    return this.ollama.isAvailable()
  }
}

export async function createProvider(type: ProviderType = 'auto'): Promise<AIProvider> {
  if (type === 'claude') {
    return new ClaudeProvider()
  }

  if (type === 'ollama') {
    const provider = new OllamaAIProvider()
    const available = await provider.isAvailable()
    if (!available) {
      throw new Error('Ollama is not running. Start it with: ollama serve')
    }
    return provider
  }

  // Auto-detect: prefer Ollama (free), fall back to Claude
  const ollamaProvider = new OllamaAIProvider()
  if (await ollamaProvider.isAvailable()) {
    console.log('🦙 Using Ollama (local, free)')
    return ollamaProvider
  }

  if (process.env.ANTHROPIC_API_KEY) {
    console.log('🤖 Using Claude API')
    return new ClaudeProvider()
  }

  throw new Error(
    'No AI provider available.\n' +
    'Either:\n' +
    '  1. Start Ollama: ollama serve\n' +
    '  2. Set ANTHROPIC_API_KEY environment variable'
  )
}

export { OllamaProvider }
