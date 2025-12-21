'use client'

import type { ChatMessage as ChatMessageType } from '@/lib/chat'

interface Props {
  message: ChatMessageType
}

export function ChatMessage({ message }: Props) {
  const isSystem = message.type === 'system'
  const isAchievement = message.type === 'achievement'

  if (isSystem) {
    return (
      <div className="text-center text-gray-500 text-sm py-1">
        {message.content}
      </div>
    )
  }

  if (isAchievement) {
    return (
      <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg p-3 text-center">
        <span className="text-yellow-400">🏆 {message.senderName}</span>
        <span className="text-gray-300"> {message.content}</span>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-sm font-bold">
        {message.senderName.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-emerald-400">{message.senderName}</span>
          <span className="text-xs text-gray-500">
            {new Date(message.createdAt).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-gray-200 mt-1">{message.content}</p>
      </div>
    </div>
  )
}
