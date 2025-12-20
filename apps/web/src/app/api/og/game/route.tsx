import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { formatNumber } from '@/lib/og-utils';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const gameName = searchParams.get('name') || 'Game';
  const gameType = searchParams.get('type') || 'Action';
  const highScore = searchParams.get('highScore') || '0';
  const position = searchParams.get('position') || 'N/A';
  const totalPlayers = searchParams.get('totalPlayers') || '0';
  const rewardGrep = searchParams.get('rewardGrep') || '0';

  const formattedScore = formatNumber(parseInt(highScore));
  const formattedReward = formatNumber(parseInt(rewardGrep));

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
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 72,
        }}>
          🎮
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ color: '#ffffff', fontSize: 64, fontWeight: 'bold' }}>
            {gameName}
          </div>
          <div style={{
            color: '#3b82f6',
            fontSize: 28,
            padding: '6px 16px',
            background: '#3b82f620',
            borderRadius: '6px',
            display: 'flex',
          }}>
            {gameType}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{
        display: 'flex',
        marginTop: 60,
        gap: 50,
      }}>
        {/* Left Column - Score */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}>
          <div style={{ color: '#9ca3af', fontSize: 28 }}>Your High Score</div>
          <div style={{
            color: '#10b981',
            fontSize: 80,
            fontWeight: 'bold',
            marginTop: 10,
          }}>
            {formattedScore}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginTop: 30,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: '#9ca3af', fontSize: 24 }}>Leaderboard Rank</div>
              <div style={{ color: '#fbbf24', fontSize: 56, fontWeight: 'bold' }}>
                #{position}
              </div>
            </div>
            <div style={{ color: '#6b7280', fontSize: 32 }}>
              of {totalPlayers}
            </div>
          </div>
        </div>

        {/* Right Column - Rewards */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}>
          <div style={{ color: '#9ca3af', fontSize: 28 }}>Potential Reward</div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 15,
            marginTop: 10,
          }}>
            <div style={{
              color: '#10b981',
              fontSize: 72,
              fontWeight: 'bold',
            }}>
              {formattedReward}
            </div>
            <div style={{ color: '#10b981', fontSize: 40 }}>GREP</div>
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
