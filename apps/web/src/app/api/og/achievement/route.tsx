import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getRarityColor } from '@/lib/og-utils';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const name = searchParams.get('name') || 'Achievement';
  const description = searchParams.get('description') || 'You did something amazing!';
  const rarity = (searchParams.get('rarity') || 'common') as 'common' | 'rare' | 'epic' | 'legendary';
  const date = searchParams.get('date') || new Date().toLocaleDateString();
  const category = searchParams.get('category') || 'General';
  const progress = searchParams.get('progress') || '100';

  const rarityColor = getRarityColor(rarity);

  const rarityEmojis = {
    common: '🥉',
    rare: '🥈',
    epic: '🥇',
    legendary: '👑',
  };

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
      {/* Header Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        marginBottom: 40,
      }}>
        <div style={{ color: '#10b981', fontSize: 48, fontWeight: 'bold' }}>
          Achievement Unlocked
        </div>
        <div style={{
          fontSize: 48,
        }}>
          {rarityEmojis[rarity]}
        </div>
      </div>

      {/* Main Achievement Display */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        flex: 1,
      }}>
        {/* Achievement Icon/Badge */}
        <div style={{
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${rarityColor} 0%, ${rarityColor}cc 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 96,
          border: `6px solid ${rarityColor}40`,
          boxShadow: `0 0 40px ${rarityColor}40`,
        }}>
          {rarityEmojis[rarity]}
        </div>

        {/* Achievement Name */}
        <div style={{ color: '#ffffff', fontSize: 72, fontWeight: 'bold', marginTop: 20 }}>
          {name}
        </div>

        {/* Description */}
        <div style={{ color: '#9ca3af', fontSize: 32, maxWidth: '900px' }}>
          {description}
        </div>

        {/* Metadata Row */}
        <div style={{
          display: 'flex',
          gap: 40,
          marginTop: 30,
          alignItems: 'center',
        }}>
          {/* Rarity Badge */}
          <div style={{
            color: rarityColor,
            fontSize: 36,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            padding: '12px 32px',
            border: `4px solid ${rarityColor}`,
            borderRadius: '12px',
            background: `${rarityColor}10`,
            display: 'flex',
          }}>
            {rarity}
          </div>

          {/* Category */}
          <div style={{
            color: '#3b82f6',
            fontSize: 28,
            padding: '10px 24px',
            background: '#3b82f620',
            borderRadius: '8px',
            display: 'flex',
          }}>
            {category}
          </div>

          {/* Date */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
          }}>
            <div style={{ color: '#6b7280', fontSize: 20 }}>Unlocked</div>
            <div style={{ color: '#9ca3af', fontSize: 28 }}>
              {date}
            </div>
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
