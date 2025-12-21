export interface Webhook {
  id: string
  userId: string
  url: string
  events: WebhookEvent[]
  secret: string
  active: boolean
  createdAt: Date
  lastTriggered?: Date
  failureCount: number
}

export type WebhookEvent =
  | 'score.submitted'
  | 'achievement.unlocked'
  | 'level.up'
  | 'reward.claimed'
  | 'friend.added'
  | 'tournament.joined'

export const WEBHOOK_EVENTS: { value: WebhookEvent; label: string }[] = [
  { value: 'score.submitted', label: 'Score Submitted' },
  { value: 'achievement.unlocked', label: 'Achievement Unlocked' },
  { value: 'level.up', label: 'Level Up' },
  { value: 'reward.claimed', label: 'Reward Claimed' },
  { value: 'friend.added', label: 'Friend Added' },
  { value: 'tournament.joined', label: 'Tournament Joined' },
]

export function generateWebhookSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let secret = 'whsec_'
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return secret
}

export async function signPayload(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
