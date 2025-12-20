import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { events } = await request.json()

    // Store events in database
    await prisma.analyticsEvent.createMany({
      data: events.map((event: any) => ({
        name: event.name,
        properties: event.properties,
        userId: event.properties.userId || null,
        createdAt: new Date(event.timestamp),
      })),
      skipDuplicates: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to store events' }, { status: 500 })
  }
}
