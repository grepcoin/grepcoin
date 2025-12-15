import { Ollama } from 'ollama'
import type { AIProvider, Message, Tool } from '../core/types'

export class OllamaProvider implements AIProvider {
  name = 'ollama'
  private client: Ollama
  private model: string

  constructor(options: { host?: string; model?: string } = {}) {
    this.client = new Ollama({ host: options.host || 'http://localhost:11434' })
    this.model = options.model || 'llama3.2'
  }

  async chat(messages: Message[], tools?: Tool[]): Promise<string> {
    // Format tools for Ollama
    const toolDefs = tools?.map(t => ({
      type: 'function' as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: {
          type: 'object',
          properties: t.parameters._def.shape ?
            Object.fromEntries(
              Object.entries(t.parameters._def.shape()).map(([k, v]: [string, any]) => [
                k,
                { type: v._def.typeName.replace('Zod', '').toLowerCase(), description: v._def.description || '' }
              ])
            ) : {},
          required: Object.keys(t.parameters._def.shape?.() || {})
        }
      }
    }))

    const response = await this.client.chat({
      model: this.model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      tools: toolDefs,
      stream: false
    })

    // Handle tool calls if present
    if (response.message.tool_calls?.length) {
      const toolResults: string[] = []

      for (const toolCall of response.message.tool_calls) {
        const tool = tools?.find(t => t.name === toolCall.function.name)
        if (tool) {
          try {
            const params = JSON.parse(toolCall.function.arguments)
            const result = await tool.execute(params)
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
