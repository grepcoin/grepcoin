'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { ChatMessage, ChatRoom } from '@/lib/chat'
import { MAX_MESSAGE_LENGTH, RATE_LIMIT_MESSAGES, RATE_LIMIT_WINDOW } from '@/lib/chat'

export function useChat(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const messageTimestamps = useRef<number[]>([])

  useEffect(() => {
    // Load initial messages
    fetch(`/api/chat/${roomId}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages || [])
        setIsConnected(true)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))

    // Poll for new messages (would use WebSocket in production)
    const interval = setInterval(() => {
      fetch(`/api/chat/${roomId}`)
        .then((res) => res.json())
        .then((data) => setMessages(data.messages || []))
    }, 3000)

    return () => clearInterval(interval)
  }, [roomId])

  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (content.length > MAX_MESSAGE_LENGTH) return false

    // Rate limiting
    const now = Date.now()
    messageTimestamps.current = messageTimestamps.current.filter(
      (t) => now - t < RATE_LIMIT_WINDOW
    )
    if (messageTimestamps.current.length >= RATE_LIMIT_MESSAGES) {
      return false
    }
    messageTimestamps.current.push(now)

    try {
      const res = await fetch(`/api/chat/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (!res.ok) return false

      const { message } = await res.json()
      setMessages((prev) => [...prev, message])
      return true
    } catch {
      return false
    }
  }, [roomId])

  return { messages, isConnected, isLoading, sendMessage }
}
