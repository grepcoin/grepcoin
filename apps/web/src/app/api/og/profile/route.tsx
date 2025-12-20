import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getTierColor } from '@/lib/og-utils';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const username = searchParams.get('username') || 'Player';
  const totalGrep = searchParams.get('totalGrep') || '0';
  const tier = searchParams.get('tier') || 'Bronze';
  const gamesPlayed = searchParams.get('gamesPlayed') || '0';
  const achievements = searchParams.get('achievements') || '0';
  const winRate = searchParams.get('winRate') || '0';

  const tierColor = getTierColor(tier);

  return new ImageResponse(
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      width: '100%',
      height: '100%',
      padding: '60px',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
      }}>
        <div style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 64,
          fontWeight: 'bold',
          color: '#ffffff',
        }}>
          {username.charAt(0).toUpperCase()}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ color: '#ffffff', fontSize: 64, fontWeight: 'bold' }}>
            {username}
          </div>
          <div style={{
            color: tierColor,
            fontSize: 32,
            fontWeight: 'bold',
            padding: '8px 20px',
            background: `${tierColor}20`,
            borderRadius: '8px',
            display: 'flex',
          }}>
            {tier} Tier
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'flex',
        gap: 40,
        marginTop: 60,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#9ca3af', fontSize: 24 }}>Total GREP</div>
          <div style={{ color: '#10b981', fontSize: 56, fontWeight: 'bold' }}>
            {totalGrep}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#9ca3af', fontSize: 24 }}>Games Played</div>
          <div style={{ color: '#3b82f6', fontSize: 56, fontWeight: 'bold' }}>
            {gamesPlayed}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#9ca3af', fontSize: 24 }}>Achievements</div>
          <div style={{ color: '#a855f7', fontSize: 56, fontWeight: 'bold' }}>
            {achievements}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#9ca3af', fontSize: 24 }}>Win Rate</div>
          <div style={{ color: '#fbbf24', fontSize: 56, fontWeight: 'bold' }}>
            {winRate}%
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: 60,
        left: 60,
        color: '#10b981',
        fontSize: 32,
        fontWeight: 'bold',
      }}>
        GrepCoin
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
