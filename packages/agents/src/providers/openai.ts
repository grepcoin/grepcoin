import OpenAI from 'openai'
import type { AIProvider, Message, Tool } from '../core/types'

export class OpenAIProvider implements AIProvider {
  name = 'openai'
  private client: OpenAI
  private model: string

  constructor(options: { apiKey?: string; baseURL?: string; model?: string } = {}) {
    this.client = new OpenAI({
      apiKey: options.apiKey || process.env.OPENAI_API_KEY,
      baseURL: options.baseURL // Allows using compatible APIs (Together, Groq, etc.)
    })
    this.model = options.model || 'gpt-4-turbo-preview'
  }

  async chat(messages: Message[], tools?: Tool[]): Promise<string> {
    const toolDefs = tools?.map(t => ({
      type: 'function' as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: {
          type: 'object' as const,
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

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      tools: toolDefs,
      tool_choice: tools?.length ? 'auto' : undefined
    })

    const message = response.choices[0]?.message

    // Handle tool calls
    if (message?.tool_calls?.length) {
      const toolResults: OpenAI.ChatCompletionToolMessageParam[] = []

      for (const toolCall of message.tool_calls) {
        const tool = tools?.find(t => t.name === toolCall.function.name)
        if (tool) {
          try {
            const params = JSON.parse(toolCall.function.arguments)
            const result = await tool.execute(params)
            toolResults.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(result)
            })
          } catch (e) {
            toolResults.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: `Error: ${e}`
            })
          }
        }
      }

      // Continue conversation with tool results
      const newMessages = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'assistant' as const, content: message.content || '', tool_calls: message.tool_calls },
        ...toolResults
      ]

      const followUp = await this.client.chat.completions.create({
        model: this.model,
        messages: newMessages as any
      })

      return followUp.choices[0]?.message?.content || ''
    }

    return message?.content || ''
  }

  async *stream(messages: Message[]): AsyncGenerator<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      stream: true
    })

    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield content
      }
    }
  }
}
