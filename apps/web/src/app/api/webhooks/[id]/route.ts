import { NextRequest, NextResponse } from 'next/server'

const webhooks: Map<string, any> = new Map()

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const webhook = webhooks.get(params.id)
  if (!webhook) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updates = await req.json()
  const updated = { ...webhook, ...updates }
  webhooks.set(params.id, updated)

  return NextResponse.json({ webhook: updated })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  webhooks.delete(params.id)
  return NextResponse.json({ success: true })
}
