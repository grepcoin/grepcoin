'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { NotificationToast } from './NotificationToast'

type NotificationType = 'success' | 'error' | 'info' | 'achievement' | 'reward'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
}

interface NotificationContextType {
  notify: (notification: Omit<Notification, 'id'>) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  achievement: (title: string, message?: string) => void
  reward: (title: string, message?: string) => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const notify = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setNotifications(prev => [...prev, { ...notification, id }])

    setTimeout(() => {
      removeNotification(id)
    }, notification.duration || 5000)
  }, [removeNotification])

  const success = useCallback((title: string, message?: string) => {
    notify({ type: 'success', title, message })
  }, [notify])

  const error = useCallback((title: string, message?: string) => {
    notify({ type: 'error', title, message })
  }, [notify])

  const achievement = useCallback((title: string, message?: string) => {
    notify({ type: 'achievement', title, message, duration: 7000 })
  }, [notify])

  const reward = useCallback((title: string, message?: string) => {
    notify({ type: 'reward', title, message })
  }, [notify])

  return (
    <NotificationContext.Provider value={{ notify, success, error, achievement, reward }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <NotificationToast
            key={notification.id}
            {...notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}
