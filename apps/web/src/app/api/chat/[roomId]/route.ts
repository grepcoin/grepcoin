import { NextRequest, NextResponse } from 'next/server'

// In-memory store (would use Redis/database in production)
const chatRooms: Map<string, Array<{
  id: string
  senderId: string
  senderName: string
  content: string
  createdAt: Date
  type: 'text' | 'system' | 'achievement'
}>> = new Map()

export async function GET(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const { roomId } = params
  const messages = chatRooms.get(roomId) || []

  return NextResponse.json({ messages: messages.slice(-50) })
}

export async function POST(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const { roomId } = params
  const body = await req.json()
  const { content, senderId = 'anonymous', senderName = 'Anonymous' } = body

  if (!content || content.length > 500) {
    return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
  }

  const message = {
    id: crypto.randomUUID(),
    senderId,
    senderName,
    content,
    createdAt: new Date(),
    type: 'text' as const,
  }

  const messages = chatRooms.get(roomId) || []
  messages.push(message)
  chatRooms.set(roomId, messages.slice(-100)) // Keep last 100

  return NextResponse.json({ message })
}
