'use client'
import { useState } from 'react'
import { MINI_GAMES, MiniGame } from '@/lib/mini-games'
import { CoinFlip } from './mini-games/CoinFlip'
import { TapSpeed } from './mini-games/TapSpeed'

const GAME_COMPONENTS: Record<string, React.ComponentType> = {
  'coin-flip': CoinFlip,
  'tap-speed': TapSpeed,
}

export function MiniGameList() {
  const [selected, setSelected] = useState<MiniGame | null>(null)
  const GameComponent = selected ? GAME_COMPONENTS[selected.id] : null

  return (
    <div className="space-y-6">
      {!selected ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {MINI_GAMES.map(game => (
            <button key={game.id} onClick={() => GAME_COMPONENTS[game.id] && setSelected(game)}
              className={`p-4 bg-gray-800 rounded-xl text-center hover:bg-gray-700 ${!GAME_COMPONENTS[game.id] && 'opacity-50'}`}>
              <span className="text-4xl">{game.icon}</span>
              <p className="font-bold mt-2">{game.name}</p>
              <p className="text-sm text-gray-400">{game.rewards.min}-{game.rewards.max} GREP</p>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelected(null)} className="mb-4 text-gray-400 hover:text-white">← Back</button>
          {GameComponent && <GameComponent />}
        </div>
      )}
    </div>
  )
}
