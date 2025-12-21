export interface MiniGame {
  id: string
  name: string
  description: string
  icon: string
  duration: number // seconds
  rewards: { min: number; max: number }
}

export const MINI_GAMES: MiniGame[] = [
  { id: 'coin-flip', name: 'Coin Flip', description: 'Guess heads or tails', icon: '🪙', duration: 5, rewards: { min: 5, max: 20 } },
  { id: 'dice-roll', name: 'Dice Roll', description: 'Predict high or low', icon: '🎲', duration: 5, rewards: { min: 5, max: 25 } },
  { id: 'quick-math', name: 'Quick Math', description: 'Solve 5 equations', icon: '🧮', duration: 15, rewards: { min: 10, max: 50 } },
  { id: 'color-match', name: 'Color Match', description: 'Match the color fast', icon: '🎨', duration: 10, rewards: { min: 8, max: 35 } },
  { id: 'tap-speed', name: 'Tap Speed', description: 'Tap as fast as you can', icon: '👆', duration: 10, rewards: { min: 10, max: 40 } },
]

export function calculateReward(game: MiniGame, score: number, maxScore: number): number {
  const ratio = score / maxScore
  return Math.floor(game.rewards.min + (game.rewards.max - game.rewards.min) * ratio)
}
