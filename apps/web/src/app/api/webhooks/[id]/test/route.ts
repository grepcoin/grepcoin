import { NextRequest, NextResponse } from 'next/server'
import { signPayload } from '@/lib/webhooks'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // Would fetch webhook from database
  const testPayload = {
    event: 'test',
    timestamp: new Date().toISOString(),
    data: { message: 'This is a test webhook' },
  }

  try {
    // In production, would actually send to the webhook URL
    // const signature = await signPayload(JSON.stringify(testPayload), webhook.secret)
    // await fetch(webhook.url, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'X-GrepCoin-Signature': signature,
    //   },
    //   body: JSON.stringify(testPayload),
    // })

    return NextResponse.json({ success: true, payload: testPayload })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to send' }, { status: 500 })
  }
}
