'use client'

import { useState, useCallback, useRef } from 'react'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface UseAIChatReturn {
  messages: Message[]
  sendMessage: (message: string, context?: string) => Promise<void>
  isLoading: boolean
  error: string | null
  clearMessages: () => void
  clearError: () => void
}

export function useAIChat(): UseAIChatReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const sendMessage = useCallback(async (message: string, context?: string) => {
    if (!message.trim()) {
      setError('Message cannot be empty')
      return
    }

    if (isLoading) {
      setError('Already processing a message')
      return
    }

    setIsLoading(true)
    setError(null)

    // Add user message to chat
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Create assistant message placeholder
    const assistantMessageId = `assistant-${Date.now()}`
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMessage])

    try {
      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController()

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, context }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        // Handle non-streaming error responses
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Request failed with status ${response.status}`)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Response body is not readable')
      }

      const decoder = new TextDecoder()
      let accumulatedContent = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        accumulatedContent += chunk

        // Update assistant message with accumulated content
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: accumulatedContent }
              : msg
          )
        )
      }

      // Check if the response contains an error
      if (accumulatedContent.includes('[Error:')) {
        const errorMatch = accumulatedContent.match(/\[Error: (.+?)\]/)
        if (errorMatch) {
          throw new Error(errorMatch[1])
        }
      }
    } catch (err) {
      console.error('AI chat error:', err)

      // Remove failed assistant message
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId))

      // Set error message
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Request was cancelled')
        } else {
          setError(err.message)
        }
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [isLoading])

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    clearMessages,
    clearError,
  }
}
