'use client'

import { useState } from 'react'
import { ChatWindow } from './ChatWindow'

export function ChatToggle() {
  const [isOpen, setIsOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          setUnread(0)
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-lg flex items-center justify-center text-2xl z-40"
      >
        💬
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] z-50 shadow-2xl">
          <ChatWindow
            roomId="global"
            roomName="Global Chat"
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}
    </>
  )
}
