import { NextRequest, NextResponse } from 'next/server'

const webhooks: Map<string, any> = new Map()

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const webhook = webhooks.get(id)
  if (!webhook) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updates = await req.json()
  const updated = { ...webhook, ...updates }
  webhooks.set(id, updated)

  return NextResponse.json({ webhook: updated })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  webhooks.delete(id)
  return NextResponse.json({ success: true })
}
