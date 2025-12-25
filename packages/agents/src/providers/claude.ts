import Anthropic from '@anthropic-ai/sdk'
import type { AIProvider, Message, Tool } from '../core/types'

// Type definitions for Anthropic SDK compatibility
interface ToolUseBlock {
  type: 'tool_use'
  id: string
  name: string
  input: Record<string, unknown>
}

interface TextBlock {
  type: 'text'
  text: string
}

type ContentBlock = TextBlock | ToolUseBlock | { type: string }

interface MessageResponse {
  stop_reason: string | null
  content: ContentBlock[]
}

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
      const createParams = {
        model: this.model,
        max_tokens: 4096,
        system: systemMessage,
        messages: conversationMessages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        })),
        ...(toolDefs && toolDefs.length > 0 ? { tools: toolDefs } : {})
      }

      const rawResponse = await this.client.messages.create(createParams as unknown as Parameters<typeof this.client.messages.create>[0])
      const response = rawResponse as unknown as MessageResponse

      // Handle tool use
      if (response.stop_reason === 'tool_use') {
        const toolResults: { type: 'tool_result'; tool_use_id: string; content: string; is_error?: boolean }[] = []
        const toolUseBlocks = response.content.filter(
          (block): block is ToolUseBlock => block.type === 'tool_use'
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
        const followUpParams = {
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
        }

        const rawFollowUp = await this.client.messages.create(followUpParams as unknown as Parameters<typeof this.client.messages.create>[0])
        const followUpResponse = rawFollowUp as unknown as MessageResponse

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
      const streamParams = {
        model: this.model,
        max_tokens: 4096,
        system: systemMessage,
        messages: conversationMessages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        })),
        ...(toolDefs && toolDefs.length > 0 ? { tools: toolDefs } : {})
      }

      const stream = await this.client.messages.stream(streamParams as unknown as Parameters<typeof this.client.messages.stream>[0])

      for await (const chunk of stream) {
        const chunkAny = chunk as { type?: string; delta?: { type?: string; text?: string } }
        if (
          chunkAny.type === 'content_block_delta' &&
          chunkAny.delta?.type === 'text_delta' &&
          chunkAny.delta?.text
        ) {
          yield chunkAny.delta.text
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

  private extractTextContent(content: ContentBlock[]): string {
    return content
      .filter((block): block is TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('\n')
  }

  private zodToJsonSchema(schema: unknown): Record<string, unknown> {
    try {
      const schemaAny = schema as { _def?: { shape?: () => Record<string, unknown> } }
      const shape = schemaAny._def?.shape?.()
      if (!shape) {
        return { type: 'object', properties: {}, required: [] }
      }

      const properties: Record<string, unknown> = {}
      const required: string[] = []

      for (const [key, value] of Object.entries(shape)) {
        const def = (value as { _def?: { typeName?: string; description?: string; innerType?: { _def?: { typeName?: string } } } })._def
        const typeName = def?.typeName?.replace('Zod', '').toLowerCase() || 'string'

        // Handle optional types
        const isOptional = typeName === 'optional'
        const actualType = isOptional
          ? (def?.innerType?._def?.typeName?.replace('Zod', '').toLowerCase() || 'string')
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
