import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'default';
  const title = searchParams.get('title') || 'GrepCoin';
  const description = searchParams.get('description') || 'Play games, earn crypto';

  // Render different OG images based on type
  switch (type) {
    case 'profile':
      return generateProfileOG(searchParams);
    case 'game':
      return generateGameOG(searchParams);
    case 'achievement':
      return generateAchievementOG(searchParams);
    case 'leaderboard':
      return generateLeaderboardOG(searchParams);
    default:
      return generateDefaultOG(title, description);
  }
}

function generateDefaultOG(title: string, description: string) {
  return new ImageResponse(
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      width: '100%',
      height: '100%',
      padding: '60px',
    }}>
      <div style={{ color: '#10b981', fontSize: 80, fontWeight: 'bold' }}>
        {title}
      </div>
      <div style={{ color: '#9ca3af', fontSize: 32, marginTop: 20 }}>
        {description}
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}

function generateProfileOG(searchParams: URLSearchParams) {
  const username = searchParams.get('username') || 'Player';
  const totalGrep = searchParams.get('totalGrep') || '0';
  const tier = searchParams.get('tier') || 'Bronze';

  return new ImageResponse(
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      width: '100%',
      height: '100%',
      padding: '60px',
    }}>
      <div style={{ color: '#10b981', fontSize: 48, fontWeight: 'bold' }}>
        GrepCoin Profile
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        marginTop: 40,
        gap: 20,
      }}>
        <div style={{ color: '#ffffff', fontSize: 64, fontWeight: 'bold' }}>
          {username}
        </div>
        <div style={{
          display: 'flex',
          gap: 40,
          marginTop: 20,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#9ca3af', fontSize: 24 }}>Total GREP</div>
            <div style={{ color: '#10b981', fontSize: 48, fontWeight: 'bold' }}>
              {totalGrep}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#9ca3af', fontSize: 24 }}>Tier</div>
            <div style={{ color: '#fbbf24', fontSize: 48, fontWeight: 'bold' }}>
              {tier}
            </div>
          </div>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}

function generateGameOG(searchParams: URLSearchParams) {
  const gameName = searchParams.get('name') || 'Game';
  const highScore = searchParams.get('highScore') || '0';
  const position = searchParams.get('position') || 'N/A';

  return new ImageResponse(
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      width: '100%',
      height: '100%',
      padding: '60px',
    }}>
      <div style={{ color: '#10b981', fontSize: 48, fontWeight: 'bold' }}>
        GrepCoin Game
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        marginTop: 40,
        gap: 20,
      }}>
        <div style={{ color: '#ffffff', fontSize: 72, fontWeight: 'bold' }}>
          {gameName}
        </div>
        <div style={{
          display: 'flex',
          gap: 40,
          marginTop: 20,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#9ca3af', fontSize: 24 }}>High Score</div>
            <div style={{ color: '#10b981', fontSize: 56, fontWeight: 'bold' }}>
              {highScore}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#9ca3af', fontSize: 24 }}>Rank</div>
            <div style={{ color: '#fbbf24', fontSize: 56, fontWeight: 'bold' }}>
              #{position}
            </div>
          </div>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}

function generateAchievementOG(searchParams: URLSearchParams) {
  const name = searchParams.get('name') || 'Achievement';
  const rarity = searchParams.get('rarity') || 'common';
  const date = searchParams.get('date') || new Date().toLocaleDateString();

  const rarityColors: Record<string, string> = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#eab308',
  };

  return new ImageResponse(
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      width: '100%',
      height: '100%',
      padding: '60px',
    }}>
      <div style={{ color: '#10b981', fontSize: 48, fontWeight: 'bold' }}>
        Achievement Unlocked
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        marginTop: 40,
        gap: 20,
      }}>
        <div style={{ color: '#ffffff', fontSize: 64, fontWeight: 'bold' }}>
          {name}
        </div>
        <div style={{
          display: 'flex',
          gap: 40,
          marginTop: 20,
          alignItems: 'center',
        }}>
          <div style={{
            color: rarityColors[rarity] || rarityColors.common,
            fontSize: 40,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            padding: '10px 30px',
            border: `4px solid ${rarityColors[rarity] || rarityColors.common}`,
            borderRadius: '12px',
          }}>
            {rarity}
          </div>
          <div style={{ color: '#9ca3af', fontSize: 32 }}>
            Unlocked: {date}
          </div>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}

function generateLeaderboardOG(searchParams: URLSearchParams) {
  const title = searchParams.get('title') || 'Leaderboard';
  const topPlayer = searchParams.get('topPlayer') || 'Unknown';
  const topScore = searchParams.get('topScore') || '0';

  return new ImageResponse(
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      width: '100%',
      height: '100%',
      padding: '60px',
    }}>
      <div style={{ color: '#10b981', fontSize: 64, fontWeight: 'bold' }}>
        {title}
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        marginTop: 60,
        gap: 20,
      }}>
        <div style={{ color: '#fbbf24', fontSize: 40 }}>
          Top Player
        </div>
        <div style={{ color: '#ffffff', fontSize: 72, fontWeight: 'bold' }}>
          {topPlayer}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginTop: 20,
        }}>
          <div style={{ color: '#9ca3af', fontSize: 32 }}>Score:</div>
          <div style={{ color: '#10b981', fontSize: 64, fontWeight: 'bold' }}>
            {topScore}
          </div>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
