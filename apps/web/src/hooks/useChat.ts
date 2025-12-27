'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { ChatMessage } from '@/lib/chat'
import { MAX_MESSAGE_LENGTH, RATE_LIMIT_MESSAGES, RATE_LIMIT_WINDOW } from '@/lib/chat'

export function useChat(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const messageTimestamps = useRef<number[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // Create abort controller for cleanup
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    // Load initial messages
    fetch(`/api/chat/${roomId}`, { signal: abortController.signal })
      .then((res) => res.json())
      .then((data) => {
        if (!abortController.signal.aborted) {
          setMessages(data.messages || [])
          setIsConnected(true)
          setIsLoading(false)
        }
      })
      .catch((e) => {
        if (e.name !== 'AbortError') {
          setIsLoading(false)
        }
      })

    // Poll for new messages (would use WebSocket in production)
    const interval = setInterval(() => {
      if (abortController.signal.aborted) return
      fetch(`/api/chat/${roomId}`, { signal: abortController.signal })
        .then((res) => res.json())
        .then((data) => {
          if (!abortController.signal.aborted) {
            setMessages(data.messages || [])
          }
        })
        .catch(() => {})  // Ignore errors during polling
    }, 3000)

    return () => {
      clearInterval(interval)
      abortController.abort()
    }
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
