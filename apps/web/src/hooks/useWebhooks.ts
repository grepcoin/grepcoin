'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Webhook, WebhookEvent } from '@/lib/webhooks'

export function useWebhooks() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/webhooks')
      .then(res => res.json())
      .then(data => {
        setWebhooks(data.webhooks || [])
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  const createWebhook = useCallback(async (url: string, events: WebhookEvent[]) => {
    const res = await fetch('/api/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, events }),
    })
    const data = await res.json()
    if (data.webhook) {
      setWebhooks(prev => [...prev, data.webhook])
    }
    return data.webhook
  }, [])

  const deleteWebhook = useCallback(async (id: string) => {
    await fetch(`/api/webhooks/${id}`, { method: 'DELETE' })
    setWebhooks(prev => prev.filter(w => w.id !== id))
  }, [])

  const toggleWebhook = useCallback(async (id: string, active: boolean) => {
    const res = await fetch(`/api/webhooks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    })
    const data = await res.json()
    if (data.webhook) {
      setWebhooks(prev => prev.map(w => w.id === id ? data.webhook : w))
    }
  }, [])

  const testWebhook = useCallback(async (id: string) => {
    const res = await fetch(`/api/webhooks/${id}/test`, { method: 'POST' })
    return res.json()
  }, [])

  return { webhooks, isLoading, createWebhook, deleteWebhook, toggleWebhook, testWebhook }
}
