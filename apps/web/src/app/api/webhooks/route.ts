import { NextRequest, NextResponse } from 'next/server'
import { generateWebhookSecret } from '@/lib/webhooks'

// In-memory store (would use database in production)
const webhooks: Map<string, any> = new Map()

export async function GET() {
  const all = Array.from(webhooks.values())
  return NextResponse.json({ webhooks: all })
}

export async function POST(req: NextRequest) {
  const { url, events } = await req.json()

  if (!url || !events?.length) {
    return NextResponse.json({ error: 'URL and events required' }, { status: 400 })
  }

  const webhook = {
    id: crypto.randomUUID(),
    userId: 'user1', // Would come from auth
    url,
    events,
    secret: generateWebhookSecret(),
    active: true,
    createdAt: new Date(),
    failureCount: 0,
  }

  webhooks.set(webhook.id, webhook)
  return NextResponse.json({ webhook })
}
