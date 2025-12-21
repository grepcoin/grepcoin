import { NextResponse} from 'next/server'

export async function POST() {
  // Would process claim in database
  return NextResponse.json({ success: true, claimed: 250 })
}
