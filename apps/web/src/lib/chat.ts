export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  createdAt: Date
  type: 'text' | 'system' | 'achievement'
}

export interface ChatRoom {
  id: string
  type: 'global' | 'game' | 'direct'
  name: string
  participants?: string[]
}

export const MAX_MESSAGE_LENGTH = 500
export const RATE_LIMIT_MESSAGES = 5
export const RATE_LIMIT_WINDOW = 10000 // 10 seconds
