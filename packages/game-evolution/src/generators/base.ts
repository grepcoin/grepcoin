import Anthropic from '@anthropic-ai/sdk'
import { GeneratorConfig } from '../types'

export abstract class ContentGenerator {
  protected client: Anthropic
  protected config: GeneratorConfig

  constructor(config?: Partial<GeneratorConfig>) {
    this.client = new Anthropic()
    this.config = {
      model: config?.model || 'claude-3-haiku-20240307',
      maxTokens: config?.maxTokens || 2048,
      temperature: config?.temperature || 0.7
    }
  }

  protected async generate(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.config.model,
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })

    const textBlock = response.content.find(block => block.type === 'text')
    return textBlock ? textBlock.text : ''
  }

  protected parseJSON<T>(text: string): T | null {
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
      const jsonStr = jsonMatch ? jsonMatch[1] : text
      return JSON.parse(jsonStr.trim())
    } catch {
      console.error('Failed to parse JSON:', text)
      return null
    }
  }
}
