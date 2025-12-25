// Core
export { Agent } from './core/agent'
export * from './core/types'

// Providers
export { OllamaProvider } from './providers/ollama'
export { OpenAIProvider } from './providers/openai'

// Services
export {
  BlockchainService,
  getBlockchainService,
  type TokenMetrics,
  type StakingMetrics,
  type Transfer,
  type StakeEvent,
  type NetworkType
} from './services/blockchain'

// Agents
export { CommunityAgent } from './agents/community-agent'
export { SocialAgent } from './agents/social-agent'
export { GuardianAgent } from './agents/guardian-agent'
export { AnalyticsAgent } from './agents/analytics-agent'

// Factory function to create agents with default provider
import { OllamaProvider } from './providers/ollama'
import { OpenAIProvider } from './providers/openai'
import { CommunityAgent } from './agents/community-agent'
import { SocialAgent } from './agents/social-agent'
import { GuardianAgent } from './agents/guardian-agent'
import { AnalyticsAgent } from './agents/analytics-agent'
import type { AIProvider } from './core/types'

export type AgentType = 'community' | 'social' | 'guardian' | 'analytics'

export interface AgentFactoryOptions {
  provider?: 'ollama' | 'openai'
  model?: string
  apiKey?: string
  baseURL?: string
}

export function createProvider(options: AgentFactoryOptions = {}): AIProvider {
  const { provider = 'ollama', model, apiKey, baseURL } = options

  switch (provider) {
    case 'openai':
      return new OpenAIProvider({ apiKey, baseURL, model })
    case 'ollama':
    default:
      return new OllamaProvider({ model })
  }
}

export function createAgent(type: AgentType, provider: AIProvider) {
  switch (type) {
    case 'community':
      return new CommunityAgent(provider)
    case 'social':
      return new SocialAgent(provider)
    case 'guardian':
      return new GuardianAgent(provider)
    case 'analytics':
      return new AnalyticsAgent(provider)
    default:
      throw new Error(`Unknown agent type: ${type}`)
  }
}

// Convenience function to create an agent with default settings
// Function overloads for proper type inference
export function quickAgent(type: 'community', options?: AgentFactoryOptions): CommunityAgent
export function quickAgent(type: 'social', options?: AgentFactoryOptions): SocialAgent
export function quickAgent(type: 'guardian', options?: AgentFactoryOptions): GuardianAgent
export function quickAgent(type: 'analytics', options?: AgentFactoryOptions): AnalyticsAgent
export function quickAgent(type: AgentType, options?: AgentFactoryOptions): CommunityAgent | SocialAgent | GuardianAgent | AnalyticsAgent
export function quickAgent(type: AgentType, options: AgentFactoryOptions = {}): CommunityAgent | SocialAgent | GuardianAgent | AnalyticsAgent {
  const provider = createProvider(options)
  return createAgent(type, provider)
}
