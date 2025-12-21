import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({
    quests: [
      { questId: 'd1', progress: 2, status: 'active' },
      { questId: 'd2', progress: 3500, status: 'active' },
      { questId: 'w1', progress: 15, status: 'active' },
      { questId: 'w2', progress: 50000, status: 'completed' },
    ]
  })
}
