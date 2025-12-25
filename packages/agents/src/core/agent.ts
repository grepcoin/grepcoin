import { EventEmitter } from 'events'
import type { AgentConfig, AgentState, AIProvider, Message, Tool, Task, AgentMetrics, AgentEvent } from './types'

export abstract class Agent extends EventEmitter {
  protected config: AgentConfig
  protected provider: AIProvider
  protected state: AgentState
  protected metrics: AgentMetrics
  protected taskQueue: Task[] = []
  protected isRunning = false

  constructor(config: AgentConfig, provider: AIProvider) {
    super()
    this.config = config
    this.provider = provider
    this.state = {
      messages: [],
      memory: {},
      lastRun: null,
      runCount: 0
    }
    this.metrics = {
      tasksCompleted: 0,
      tasksErrored: 0,
      averageResponseTime: 0,
      tokensUsed: 0
    }
  }

  get name(): string {
    return this.config.name
  }

  get description(): string {
    return this.config.description
  }

  // Initialize the agent with system prompt
  protected async initialize(): Promise<void> {
    this.state.messages = [
      { role: 'system', content: this.config.systemPrompt }
    ]
  }

  // Main chat method
  async chat(userMessage: string): Promise<string> {
    const startTime = Date.now()

    try {
      this.state.messages.push({ role: 'user', content: userMessage })
      this.emit('event', { type: 'message', data: { role: 'user', content: userMessage } } as AgentEvent)

      const response = await this.provider.chat(this.state.messages, this.config.tools)

      this.state.messages.push({ role: 'assistant', content: response })
      this.emit('event', { type: 'complete', data: { response } } as AgentEvent)

      // Update metrics
      const responseTime = Date.now() - startTime
      this.metrics.averageResponseTime =
        (this.metrics.averageResponseTime * this.metrics.tasksCompleted + responseTime) /
        (this.metrics.tasksCompleted + 1)
      this.metrics.tasksCompleted++

      return response
    } catch (error) {
      this.metrics.tasksErrored++
      this.metrics.lastError = String(error)
      this.emit('event', { type: 'error', data: { message: 'Chat failed', error } } as AgentEvent)
      throw error
    }
  }

  // Process a task
  async processTask(task: Task): Promise<any> {
    const startTime = Date.now()

    try {
      const result = await this.handleTask(task)
      task.completedAt = new Date()
      task.result = result
      this.metrics.tasksCompleted++
      return result
    } catch (error) {
      task.error = String(error)
      this.metrics.tasksErrored++
      throw error
    }
  }

  // Abstract method for subclasses to implement task handling
  protected abstract handleTask(task: Task): Promise<any>

  // Add task to queue
  addTask(task: Omit<Task, 'id' | 'createdAt'>): string {
    const id = `${this.name}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    const fullTask: Task = {
      ...task,
      id,
      createdAt: new Date()
    }
    this.taskQueue.push(fullTask)
    return id
  }

  // Run the agent continuously
  async run(intervalMs = 60000): Promise<void> {
    if (this.isRunning) return

    this.isRunning = true
    await this.initialize()

    console.log(`[${this.name}] Agent started`)

    while (this.isRunning) {
      try {
        // Process any queued tasks
        while (this.taskQueue.length > 0) {
          const task = this.taskQueue.shift()!
          await this.processTask(task)
        }

        // Run periodic check
        await this.periodicCheck()

        this.state.lastRun = new Date()
        this.state.runCount++

      } catch (error) {
        console.error(`[${this.name}] Error:`, error)
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs))
    }
  }

  // Abstract method for periodic checks
  protected abstract periodicCheck(): Promise<void>

  // Stop the agent
  stop(): void {
    this.isRunning = false
    console.log(`[${this.name}] Agent stopped`)
  }

  // Get current metrics
  getMetrics(): AgentMetrics {
    return { ...this.metrics }
  }

  // Get state (for persistence)
  getState(): AgentState {
    return { ...this.state }
  }

  // Restore state (from persistence)
  restoreState(state: Partial<AgentState>): void {
    this.state = { ...this.state, ...state }
  }

  // Clear conversation history (keep system prompt)
  clearHistory(): void {
    this.state.messages = this.state.messages.slice(0, 1)
  }

  // Remember something
  remember(key: string, value: any): void {
    this.state.memory[key] = value
  }

  // Recall something
  recall(key: string): any {
    return this.state.memory[key]
  }
}
