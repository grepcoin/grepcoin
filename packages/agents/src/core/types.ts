import { z } from 'zod'

// Message types
export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// Tool definition
export interface Tool {
  name: string
  description: string
  parameters: z.ZodObject<any>
  execute: (params: any) => Promise<any>
}

// Agent configuration
export interface AgentConfig {
  name: string
  description: string
  systemPrompt: string
  tools: Tool[]
  model?: string
  provider?: 'openai' | 'anthropic' | 'ollama' | 'local'
  temperature?: number
  maxTokens?: number
}

// Agent state
export interface AgentState {
  messages: Message[]
  memory: Record<string, any>
  lastRun: Date | null
  runCount: number
}

// Task definition
export interface Task {
  id: string
  type: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  data: any
  createdAt: Date
  scheduledFor?: Date
  completedAt?: Date
  result?: any
  error?: string
}

// Event types
export type AgentEvent =
  | { type: 'message'; data: Message }
  | { type: 'tool_call'; data: { tool: string; params: any } }
  | { type: 'tool_result'; data: { tool: string; result: any } }
  | { type: 'error'; data: { message: string; error: any } }
  | { type: 'complete'; data: { response: string } }

// Provider interface
export interface AIProvider {
  name: string
  chat(messages: Message[], tools?: Tool[]): Promise<string>
  stream?(messages: Message[], tools?: Tool[]): AsyncGenerator<string>
}

// Agent metrics
export interface AgentMetrics {
  tasksCompleted: number
  tasksErrored: number
  averageResponseTime: number
  tokensUsed: number
  lastError?: string
}
