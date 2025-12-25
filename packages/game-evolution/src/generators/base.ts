import { AIProvider, createProvider, ProviderType } from '../providers'

export abstract class ContentGenerator {
  protected provider: AIProvider | null = null
  protected providerType: ProviderType

  constructor(providerType: ProviderType = 'auto') {
    this.providerType = providerType
  }

  protected async ensureProvider(): Promise<AIProvider> {
    if (!this.provider) {
      this.provider = await createProvider(this.providerType)
    }
    return this.provider
  }

  protected async generate(systemPrompt: string, userPrompt: string): Promise<string> {
    const provider = await this.ensureProvider()
    return provider.generate(systemPrompt, userPrompt)
  }

  protected parseJSON<T>(text: string): T | null {
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
      const jsonStr = jsonMatch ? jsonMatch[1] : text
      return JSON.parse(jsonStr.trim())
    } catch {
      console.error('Failed to parse JSON:', text.substring(0, 200))
      return null
    }
  }

  getProviderName(): string {
    return this.provider?.getName() || 'not initialized'
  }
}
