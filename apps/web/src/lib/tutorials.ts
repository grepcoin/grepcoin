interface TutorialStep {
  title: string
  description: string
  image?: string
}

export const gameTutorials: Record<string, TutorialStep[]> = {
  'crypto-snake': [
    { title: 'Welcome to Crypto Snake!', description: 'Use arrow keys or swipe to control your snake', image: '🐍' },
    { title: 'Collect Tokens', description: 'Eat the green tokens to grow longer and earn points', image: '🪙' },
    { title: 'Avoid Walls', description: 'Don\'t hit the walls or your own tail!', image: '💥' },
    { title: 'Earn GREP', description: 'Your score converts to GREP tokens. Higher scores = more earnings!', image: '💰' },
  ],
  'bug-hunter': [
    { title: 'Bug Hunter', description: 'Find and click on bugs hiding in the code', image: '🐛' },
    { title: 'Be Quick', description: 'You have limited time to find all bugs', image: '⏱️' },
    { title: 'Combo Bonus', description: 'Find bugs quickly for combo multipliers', image: '🔥' },
  ],
  'regex-crossword': [
    { title: 'Regex Crossword', description: 'Fill in letters that match both row and column patterns', image: '📝' },
    { title: 'Use Regex Rules', description: 'Each clue is a regular expression pattern', image: '🔤' },
    { title: 'Think Logically', description: 'Start with cells that have limited options', image: '🧠' },
  ],
  default: [
    { title: 'Welcome!', description: 'Complete the game to earn GREP tokens', image: '🎮' },
    { title: 'Submit Score', description: 'Your score is automatically submitted when you finish', image: '📤' },
    { title: 'Earn Rewards', description: 'Higher scores mean more GREP earnings!', image: '💎' },
  ]
}

export function getTutorial(gameSlug: string) {
  return gameTutorials[gameSlug] || gameTutorials.default
}
