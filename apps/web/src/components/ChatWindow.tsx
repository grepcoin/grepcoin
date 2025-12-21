'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/hooks/useChat'
import { ChatMessage } from './ChatMessage'
import { MAX_MESSAGE_LENGTH } from '@/lib/chat'

interface Props {
  roomId: string
  roomName: string
  onClose?: () => void
}

export function ChatWindow({ roomId, roomName, onClose }: Props) {
  const { messages, isConnected, isLoading, sendMessage } = useChat(roomId)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSending) return

    setIsSending(true)
    const success = await sendMessage(input.trim())
    if (success) {
      setInput('')
    }
    setIsSending(false)
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <h3 className="font-semibold">{roomName}</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <p className="text-center text-gray-400">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-400">No messages yet</p>
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {input.length}/{MAX_MESSAGE_LENGTH}
        </p>
      </form>
    </div>
  )
}
