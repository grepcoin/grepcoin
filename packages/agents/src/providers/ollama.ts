import { Ollama } from 'ollama'
import type { AIProvider, Message, Tool } from '../core/types'

export class OllamaProvider implements AIProvider {
  name = 'ollama'
  private client: Ollama
  private model: string
  private enableTools: boolean

  constructor(options: { host?: string; model?: string; enableTools?: boolean } = {}) {
    this.client = new Ollama({ host: options.host || 'http://localhost:11434' })
    this.model = options.model || 'llama3.2:3b'
    // Disable tools by default for smaller models
    this.enableTools = options.enableTools ?? false
  }

  async chat(messages: Message[], tools?: Tool[]): Promise<string> {
    // Only use tools if enabled and available
    const useTools = this.enableTools && tools && tools.length > 0

    let toolDefs: any[] | undefined
    if (useTools) {
      try {
        toolDefs = tools.map(t => ({
          type: 'function' as const,
          function: {
            name: t.name,
            description: t.description,
            parameters: this.zodToJsonSchema(t.parameters)
          }
        }))
      } catch (e) {
        console.warn('Failed to convert tools, proceeding without:', e)
        toolDefs = undefined
      }
    }

    const response = await this.client.chat({
      model: this.model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      ...(toolDefs ? { tools: toolDefs } : {}),
      stream: false
    })

    // Handle tool calls if present
    if (useTools && response.message.tool_calls?.length) {
      const toolResults: string[] = []

      for (const toolCall of response.message.tool_calls) {
        const tool = tools?.find(t => t.name === toolCall.function.name)
        if (tool) {
          try {
            const args = typeof toolCall.function.arguments === 'string'
              ? JSON.parse(toolCall.function.arguments)
              : toolCall.function.arguments
            const result = await tool.execute(args)
            toolResults.push(`[${tool.name}]: ${JSON.stringify(result)}`)
          } catch (e) {
            toolResults.push(`[${tool.name}]: Error - ${e}`)
          }
        }
      }

      // Continue conversation with tool results
      const newMessages = [
        ...messages,
        { role: 'assistant' as const, content: response.message.content || '' },
        { role: 'user' as const, content: `Tool results:\n${toolResults.join('\n')}` }
      ]

      return this.chat(newMessages, tools)
    }

    return response.message.content || ''
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
        properties[key] = {
          type: typeName === 'optional' ? (def.innerType?._def?.typeName?.replace('Zod', '').toLowerCase() || 'string') : typeName,
          description: def?.description || ''
        }
        if (typeName !== 'optional') {
          required.push(key)
        }
      }

      return { type: 'object', properties, required }
    } catch {
      return { type: 'object', properties: {}, required: [] }
    }
  }

  async *stream(messages: Message[]): AsyncGenerator<string> {
    const response = await this.client.chat({
      model: this.model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      stream: true
    })

    for await (const chunk of response) {
      if (chunk.message?.content) {
        yield chunk.message.content
      }
    }
  }
}
