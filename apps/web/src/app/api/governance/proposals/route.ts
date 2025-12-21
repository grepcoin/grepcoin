import { NextResponse } from 'next/server'

export async function GET() {
  // Would fetch from contract/database in production
  const proposals = [
    {
      id: 1,
      title: 'Increase staking rewards by 5%',
      description: 'Proposal to increase the base staking rewards from 10% APY to 15% APY to incentivize long-term holding.',
      proposer: '0x1234567890abcdef1234567890abcdef12345678',
      forVotes: '150000',
      againstVotes: '50000',
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
      state: 'active',
    },
    {
      id: 2,
      title: 'Add new game: Tetris Clone',
      description: 'Community request to add a Tetris-style puzzle game to the platform with GREP rewards.',
      proposer: '0xabcdef1234567890abcdef1234567890abcdef12',
      forVotes: '200000',
      againstVotes: '30000',
      startTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      state: 'succeeded',
    },
  ]

  return NextResponse.json({ proposals })
}
