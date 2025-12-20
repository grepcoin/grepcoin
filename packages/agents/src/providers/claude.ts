import Anthropic from '@anthropic-ai/sdk'
import type { AIProvider, Message, Tool } from '../core/types'

export class ClaudeProvider implements AIProvider {
  name = 'claude'
  private client: Anthropic
  private model: string

  constructor(options: { apiKey?: string; model?: string } = {}) {
    this.client = new Anthropic({
      apiKey: options.apiKey || process.env.ANTHROPIC_API_KEY
    })
    this.model = options.model || 'claude-3-5-sonnet-20241022'
  }

  async chat(messages: Message[], tools?: Tool[]): Promise<string> {
    // Extract system message if present
    const systemMessage = messages.find(m => m.role === 'system')?.content
    const conversationMessages = messages.filter(m => m.role !== 'system')

    // Convert tools to Anthropic format
    const toolDefs = tools?.map(t => ({
      name: t.name,
      description: t.description,
      input_schema: this.zodToJsonSchema(t.parameters)
    }))

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        system: systemMessage,
        messages: conversationMessages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        })),
        tools: toolDefs && toolDefs.length > 0 ? toolDefs : undefined
      })

      // Handle tool use
      if (response.stop_reason === 'tool_use') {
        const toolResults: any[] = []
        const toolUseBlocks = response.content.filter(
          (block): block is Anthropic.Messages.ToolUseBlock => block.type === 'tool_use'
        )

        for (const toolUseBlock of toolUseBlocks) {
          const tool = tools?.find(t => t.name === toolUseBlock.name)
          if (tool) {
            try {
              const result = await tool.execute(toolUseBlock.input)
              toolResults.push({
                type: 'tool_result' as const,
                tool_use_id: toolUseBlock.id,
                content: JSON.stringify(result)
              })
            } catch (e) {
              toolResults.push({
                type: 'tool_result' as const,
                tool_use_id: toolUseBlock.id,
                content: `Error executing tool: ${e}`,
                is_error: true
              })
            }
          }
        }

        // Continue conversation with tool results
        const followUpResponse = await this.client.messages.create({
          model: this.model,
          max_tokens: 4096,
          system: systemMessage,
          messages: [
            ...conversationMessages.map(m => ({
              role: m.role as 'user' | 'assistant',
              content: m.content
            })),
            {
              role: 'assistant' as const,
              content: response.content
            },
            {
              role: 'user' as const,
              content: toolResults
            }
          ]
        })

        return this.extractTextContent(followUpResponse.content)
      }

      return this.extractTextContent(response.content)
    } catch (error) {
      console.error('Claude API error:', error)
      if (error instanceof Anthropic.APIError) {
        throw new Error(`Claude API error: ${error.message}`)
      }
      throw error
    }
  }

  async *stream(messages: Message[], tools?: Tool[]): AsyncGenerator<string> {
    // Extract system message if present
    const systemMessage = messages.find(m => m.role === 'system')?.content
    const conversationMessages = messages.filter(m => m.role !== 'system')

    // Convert tools to Anthropic format
    const toolDefs = tools?.map(t => ({
      name: t.name,
      description: t.description,
      input_schema: this.zodToJsonSchema(t.parameters)
    }))

    try {
      const stream = await this.client.messages.stream({
        model: this.model,
        max_tokens: 4096,
        system: systemMessage,
        messages: conversationMessages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        })),
        tools: toolDefs && toolDefs.length > 0 ? toolDefs : undefined
      })

      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          yield chunk.delta.text
        }
      }
    } catch (error) {
      console.error('Claude streaming error:', error)
      if (error instanceof Anthropic.APIError) {
        throw new Error(`Claude API error: ${error.message}`)
      }
      throw error
    }
  }

  private extractTextContent(content: Anthropic.Messages.ContentBlock[]): string {
    return content
      .filter((block): block is Anthropic.Messages.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('\n')
  }

  private zodToJsonSchema(schema: any): any {
    try {
      const shape = schema._def?.shape?.()
      if (!shape) {
        return { type: 'object', properties: {}, required: [] }
      }

      const properties: Record<string, any> = {}
      const required: string[] = []

      for (const [key, value] of Object.entries(shape)) {
        const def = (value as any)._def
        const typeName = def?.typeName?.replace('Zod', '').toLowerCase() || 'string'

        // Handle optional types
        const isOptional = typeName === 'optional'
        const actualType = isOptional
          ? (def.innerType?._def?.typeName?.replace('Zod', '').toLowerCase() || 'string')
          : typeName

        // Map Zod types to JSON Schema types
        let jsonType = actualType
        if (actualType === 'zodstring') jsonType = 'string'
        else if (actualType === 'zodnumber') jsonType = 'number'
        else if (actualType === 'zodboolean') jsonType = 'boolean'
        else if (actualType === 'zodarray') jsonType = 'array'
        else if (actualType === 'zodobject') jsonType = 'object'

        properties[key] = {
          type: jsonType,
          description: def?.description || ''
        }

        if (!isOptional) {
          required.push(key)
        }
      }

      return { type: 'object', properties, required }
    } catch (error) {
      console.warn('Failed to convert Zod schema to JSON Schema:', error)
      return { type: 'object', properties: {}, required: [] }
    }
  }
}
