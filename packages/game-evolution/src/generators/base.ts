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
      let jsonStr = text.trim()

      // Remove markdown code blocks if present
      const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim()
      }

      // Find the first [ or { and last ] or }
      const arrayStart = jsonStr.indexOf('[')
      const objectStart = jsonStr.indexOf('{')
      const start = arrayStart >= 0 && (objectStart < 0 || arrayStart < objectStart)
        ? arrayStart
        : objectStart

      if (start < 0) {
        console.error('No JSON found in response')
        return null
      }

      const isArray = jsonStr[start] === '['
      const endChar = isArray ? ']' : '}'
      const end = jsonStr.lastIndexOf(endChar)

      if (end < start) {
        console.error('Malformed JSON - no closing bracket')
        return null
      }

      jsonStr = jsonStr.substring(start, end + 1)
      return JSON.parse(jsonStr)
    } catch (e) {
      console.error('Failed to parse JSON:', (e as Error).message)
      return null
    }
  }

  getProviderName(): string {
    return this.provider?.getName() || 'not initialized'
  }
}
