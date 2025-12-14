import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Seed Games
  const games = await Promise.all([
    prisma.game.upsert({
      where: { slug: 'grep-rails' },
      update: {},
      create: {
        slug: 'grep-rails',
        name: 'Grep Rails',
        description: 'Guide your train through regex patterns. Match strings to switch tracks and collect tokens!',
        icon: 'Train',
        color: 'from-grep-purple to-grep-pink',
        minReward: 5,
        maxReward: 50,
      },
    }),
    prisma.game.upsert({
      where: { slug: 'stack-panic' },
      update: {},
      create: {
        slug: 'stack-panic',
        name: 'Stack Panic',
        description: 'Functions are stacking up! Return them in the right order before the stack overflows.',
        icon: 'Layers',
        color: 'from-grep-orange to-grep-yellow',
        minReward: 5,
        maxReward: 50,
      },
    }),
    prisma.game.upsert({
      where: { slug: 'merge-miners' },
      update: {},
      create: {
        slug: 'merge-miners',
        name: 'Merge Miners',
        description: 'Mine commits and resolve merge conflicts. Stack miners to increase your hash power!',
        icon: 'GitMerge',
        color: 'from-grep-green to-grep-cyan',
        minReward: 5,
        maxReward: 50,
      },
    }),
    prisma.game.upsert({
      where: { slug: 'quantum-grep' },
      update: {},
      create: {
        slug: 'quantum-grep',
        name: 'Quantum Grep',
        description: 'Patterns exist in superposition! Match quantum regex before the wave function collapses.',
        icon: 'Atom',
        color: 'from-grep-cyan to-grep-blue',
        minReward: 10,
        maxReward: 75,
      },
    }),
  ])

  console.log(`Seeded ${games.length} games`)

  // Seed Achievements
  const achievements = await Promise.all([
    // Common achievements
    prisma.achievement.upsert({
      where: { slug: 'first-steps' },
      update: {},
      create: {
        slug: 'first-steps',
        name: 'First Steps',
        description: 'Complete your first game',
        icon: '🎮',
        rarity: 'common',
        reward: 10,
        type: 'games',
        target: 1,
      },
    }),
    prisma.achievement.upsert({
      where: { slug: 'combo-starter' },
      update: {},
      create: {
        slug: 'combo-starter',
        name: 'Combo Starter',
        description: 'Achieve a 5x combo streak',
        icon: '🔥',
        rarity: 'common',
        reward: 25,
        type: 'streak',
        target: 5,
      },
    }),
    // Uncommon achievements
    prisma.achievement.upsert({
      where: { slug: 'pattern-pro' },
      update: {},
      create: {
        slug: 'pattern-pro',
        name: 'Pattern Pro',
        description: 'Match 50 regex patterns',
        icon: '🎯',
        rarity: 'uncommon',
        reward: 50,
        type: 'score',
        target: 50,
        gameSlug: 'grep-rails',
      },
    }),
    prisma.achievement.upsert({
      where: { slug: 'speed-demon' },
      update: {},
      create: {
        slug: 'speed-demon',
        name: 'Speed Demon',
        description: 'Clear a level in under 30 seconds',
        icon: '⚡',
        rarity: 'uncommon',
        reward: 40,
        type: 'speed',
        target: 30,
      },
    }),
    // Rare achievements
    prisma.achievement.upsert({
      where: { slug: 'stack-master' },
      update: {},
      create: {
        slug: 'stack-master',
        name: 'Stack Master',
        description: 'Return 100 functions in Stack Panic',
        icon: '📚',
        rarity: 'rare',
        reward: 75,
        type: 'score',
        target: 100,
        gameSlug: 'stack-panic',
      },
    }),
    prisma.achievement.upsert({
      where: { slug: 'quantum-mind' },
      update: {},
      create: {
        slug: 'quantum-mind',
        name: 'Quantum Mind',
        description: 'Complete all Quantum Grep levels',
        icon: '⚛️',
        rarity: 'rare',
        reward: 100,
        type: 'games',
        target: 6,
        gameSlug: 'quantum-grep',
      },
    }),
    // Epic achievements
    prisma.achievement.upsert({
      where: { slug: 'git-wizard' },
      update: {},
      create: {
        slug: 'git-wizard',
        name: 'Git Wizard',
        description: 'Resolve 50 merge conflicts',
        icon: '🧙',
        rarity: 'epic',
        reward: 150,
        type: 'score',
        target: 50,
        gameSlug: 'merge-miners',
      },
    }),
    prisma.achievement.upsert({
      where: { slug: 'perfect-run' },
      update: {},
      create: {
        slug: 'perfect-run',
        name: 'Perfect Run',
        description: 'Complete any game without losing a life',
        icon: '💎',
        rarity: 'epic',
        reward: 200,
        type: 'perfect',
        target: 1,
      },
    }),
    // Legendary achievements
    prisma.achievement.upsert({
      where: { slug: 'unstoppable' },
      update: {},
      create: {
        slug: 'unstoppable',
        name: 'Unstoppable',
        description: 'Achieve a 25x combo streak',
        icon: '🌟',
        rarity: 'legendary',
        reward: 300,
        type: 'streak',
        target: 25,
      },
    }),
    prisma.achievement.upsert({
      where: { slug: 'arcade-champion' },
      update: {},
      create: {
        slug: 'arcade-champion',
        name: 'Arcade Champion',
        description: 'Reach #1 on any game leaderboard',
        icon: '👑',
        rarity: 'legendary',
        reward: 500,
        type: 'leaderboard',
        target: 1,
      },
    }),
  ])

  console.log(`Seeded ${achievements.length} achievements`)

  // Initialize global stats
  await prisma.globalStats.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      totalPlayers: 0,
      totalGrepEarned: BigInt(0),
      totalGamesPlayed: BigInt(0),
    },
  })

  console.log('Seeded global stats')

  // Create today's daily challenges
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (const game of games) {
    await prisma.dailyChallenge.upsert({
      where: {
        gameId_date: {
          gameId: game.id,
          date: today,
        },
      },
      update: {},
      create: {
        gameId: game.id,
        type: ['score', 'streak', 'speed'][Math.floor(Math.random() * 3)],
        target: Math.floor(Math.random() * 500) + 100,
        reward: Math.floor(Math.random() * 50) + 25,
        multiplier: [1, 1.5, 2][Math.floor(Math.random() * 3)],
        date: today,
      },
    })
  }

  console.log('Seeded daily challenges')

  console.log('Database seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
