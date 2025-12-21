'use client'

import { useState } from 'react'
import { useWebhooks } from '@/hooks/useWebhooks'
import { WEBHOOK_EVENTS, WebhookEvent } from '@/lib/webhooks'

export function WebhookManager() {
  const { webhooks, isLoading, createWebhook, deleteWebhook, toggleWebhook, testWebhook } = useWebhooks()
  const [showCreate, setShowCreate] = useState(false)
  const [url, setUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<WebhookEvent[]>([])
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error' | 'pending'>>({})

  const handleCreate = async () => {
    if (!url || selectedEvents.length === 0) return
    await createWebhook(url, selectedEvents)
    setUrl('')
    setSelectedEvents([])
    setShowCreate(false)
  }

  const handleTest = async (id: string) => {
    setTestResults(prev => ({ ...prev, [id]: 'pending' }))
    const result = await testWebhook(id)
    setTestResults(prev => ({ ...prev, [id]: result.success ? 'success' : 'error' }))
  }

  const toggleEvent = (event: WebhookEvent) => {
    setSelectedEvents(prev =>
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
    )
  }

  if (isLoading) {
    return <div className="animate-pulse bg-gray-800 rounded-lg h-64" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Webhooks</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg"
        >
          + Add Webhook
        </button>
      </div>

      {showCreate && (
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Endpoint URL</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://your-server.com/webhook"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Events</label>
            <div className="flex flex-wrap gap-2">
              {WEBHOOK_EVENTS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => toggleEvent(value)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedEvents.includes(value)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={!url || selectedEvents.length === 0}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg"
          >
            Create Webhook
          </button>
        </div>
      )}

      <div className="space-y-4">
        {webhooks.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No webhooks configured</p>
        ) : (
          webhooks.map(webhook => (
            <div key={webhook.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm truncate">{webhook.url}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {webhook.events.map(event => (
                      <span key={event} className="px-2 py-0.5 bg-gray-700 rounded text-xs">
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTest(webhook.id)}
                    className={`px-3 py-1 rounded text-sm ${
                      testResults[webhook.id] === 'success' ? 'bg-emerald-600' :
                      testResults[webhook.id] === 'error' ? 'bg-red-600' :
                      testResults[webhook.id] === 'pending' ? 'bg-yellow-600' :
                      'bg-gray-700'
                    }`}
                  >
                    {testResults[webhook.id] === 'pending' ? '...' : 'Test'}
                  </button>
                  <button
                    onClick={() => toggleWebhook(webhook.id, !webhook.active)}
                    className={`px-3 py-1 rounded text-sm ${
                      webhook.active ? 'bg-emerald-600' : 'bg-gray-600'
                    }`}
                  >
                    {webhook.active ? 'Active' : 'Paused'}
                  </button>
                  <button
                    onClick={() => deleteWebhook(webhook.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {webhook.secret && (
                <p className="mt-2 text-xs text-gray-500 font-mono">
                  Secret: {webhook.secret.slice(0, 12)}...
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
