# @grepcoin/game-evolution

AI-powered game content evolution system for GrepCoin arcade. Uses Claude to analyze gameplay data and generate new content.

## Overview

This package provides tools for:
- **Gameplay Analysis** - Analyze player behavior and game balance
- **Content Generation** - Create new levels, challenges, and patterns
- **Balance Tuning** - Adjust difficulty based on player performance
- **Evolution Planning** - Strategic roadmap for game improvements

## Features

- **Analyzers** - Examine gameplay data for insights
- **Generators** - Create new game content with AI
- **Planners** - Design content evolution strategies
- **Multiple AI Providers** - Claude, OpenAI, Ollama support

## Installation

```bash
npm install @grepcoin/game-evolution
```

## Quick Start

### Analyze Gameplay

```typescript
import { PlaytimeAnalyzer, DifficultyAnalyzer } from '@grepcoin/game-evolution'

// Analyze playtime patterns
const playtimeAnalyzer = new PlaytimeAnalyzer()
const playtimeInsights = await playtimeAnalyzer.analyze('grep-rails')

console.log(playtimeInsights)
// {
//   averageSession: 180,  // seconds
//   dropoffPoints: [{ level: 5, percentage: 45 }],
//   peakHours: [14, 20, 21],
//   recommendations: ['Add checkpoint at level 5', ...]
// }

// Analyze difficulty curve
const difficultyAnalyzer = new DifficultyAnalyzer()
const balance = await difficultyAnalyzer.analyze('stack-panic')

console.log(balance)
// {
//   difficultySpikes: [{ level: 3, severity: 'high' }],
//   easyLevels: [1, 2, 7],
//   suggestions: ['Smooth transition between levels 2-4']
// }
```

### Generate Content

```typescript
import { LevelGenerator, PatternGenerator } from '@grepcoin/game-evolution'

// Generate new levels
const levelGen = new LevelGenerator({ provider: 'claude' })
const newLevel = await levelGen.generate('grep-rails', {
  difficulty: 'medium',
  theme: 'database queries',
  constraints: {
    minPatterns: 5,
    maxPatterns: 10,
    includeWildcards: true
  }
})

console.log(newLevel)
// {
//   name: 'SQL Junction',
//   patterns: ['SELECT.*FROM', 'WHERE id = \\d+', ...],
//   tracks: [...],
//   estimatedTime: 120
// }

// Generate regex patterns
const patternGen = new PatternGenerator({ provider: 'claude' })
const patterns = await patternGen.generate({
  theme: 'git commands',
  count: 10,
  difficulty: 'hard'
})
```

### Plan Evolution

```typescript
import { EvolutionPlanner } from '@grepcoin/game-evolution'

const planner = new EvolutionPlanner({ provider: 'claude' })

const plan = await planner.createPlan('grep-rails', {
  analysisData: {
    playerCount: 1500,
    completionRate: 0.65,
    averageScore: 2500,
    feedback: ['needs more variety', 'level 5 too hard']
  },
  goals: ['increase retention', 'add seasonal content'],
  constraints: ['maintain current difficulty ceiling']
})

console.log(plan)
// {
//   phases: [
//     { name: 'Balancing', changes: [...], priority: 'high' },
//     { name: 'New Content', changes: [...], priority: 'medium' },
//     { name: 'Seasonal Event', changes: [...], priority: 'low' }
//   ],
//   timeline: { phase1: 'week 1', phase2: 'week 3', ... },
//   expectedImpact: { retention: '+15%', engagement: '+20%' }
// }
```

## CLI Usage

```bash
# Analyze a game
npm run analyze -- --game grep-rails

# Generate new content
npm run evolve -- --game stack-panic --type levels --count 5

# Create evolution plan
npm run evolve -- --game merge-miners --plan
```

## Configuration

### Environment Variables

```env
# AI Provider
ANTHROPIC_API_KEY=sk-ant-...

# Or OpenAI
OPENAI_API_KEY=sk-...

# Or Ollama (local)
OLLAMA_HOST=http://localhost:11434
```

### Provider Setup

```typescript
import { ClaudeProvider, OpenAIProvider, OllamaProvider } from '@grepcoin/game-evolution'

// Claude (recommended)
const claude = new ClaudeProvider({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-opus-20240229'
})

// OpenAI
const openai = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4-turbo-preview'
})

// Ollama (local)
const ollama = new OllamaProvider({
  host: 'http://localhost:11434',
  model: 'llama3.2'
})
```

## Analyzers

### PlaytimeAnalyzer

Analyzes session lengths, drop-off points, and engagement patterns.

```typescript
const analyzer = new PlaytimeAnalyzer()
const insights = await analyzer.analyze('game-slug', {
  dateRange: { from: '2024-01-01', to: '2024-12-31' },
  segment: 'new-users'  // or 'returning', 'all'
})
```

### DifficultyAnalyzer

Analyzes difficulty curves and balance issues.

```typescript
const analyzer = new DifficultyAnalyzer()
const balance = await analyzer.analyze('game-slug', {
  includeUserFeedback: true,
  compareToBaseline: true
})
```

### RetentionAnalyzer

Analyzes player retention and churn patterns.

```typescript
const analyzer = new RetentionAnalyzer()
const retention = await analyzer.analyze('game-slug', {
  cohortSize: 'weekly',
  lookbackDays: 30
})
```

## Generators

### LevelGenerator

Creates complete game levels with AI.

```typescript
const generator = new LevelGenerator({ provider: 'claude' })
const level = await generator.generate('grep-rails', {
  difficulty: 'medium',
  theme: 'web APIs',
  constraints: { minPatterns: 5, maxPatterns: 10 }
})
```

### PatternGenerator

Generates regex patterns and challenges.

```typescript
const generator = new PatternGenerator({ provider: 'claude' })
const patterns = await generator.generate({
  theme: 'Linux commands',
  count: 20,
  difficulty: 'easy'
})
```

### ChallengeGenerator

Creates daily/weekly challenges.

```typescript
const generator = new ChallengeGenerator({ provider: 'claude' })
const challenge = await generator.generate({
  type: 'daily',
  games: ['grep-rails', 'stack-panic'],
  targetDuration: 300  // 5 minutes
})
```

## Architecture

```
packages/game-evolution/
├── src/
│   ├── index.ts              # Main exports
│   ├── types.ts              # Type definitions
│   ├── cli.ts                # CLI entry point
│   ├── evolution-planner.ts  # Strategic planning
│   ├── analyzers/
│   │   ├── index.ts
│   │   ├── playtime-analyzer.ts
│   │   ├── difficulty-analyzer.ts
│   │   └── retention-analyzer.ts
│   ├── generators/
│   │   ├── index.ts
│   │   ├── level-generator.ts
│   │   ├── pattern-generator.ts
│   │   └── challenge-generator.ts
│   └── providers/
│       ├── index.ts
│       ├── claude.ts
│       ├── openai.ts
│       └── ollama.ts
├── evolution-plans/          # Generated plans
├── dist/                     # Compiled output
├── package.json
└── tsconfig.json
```

## Evolution Plans

Generated plans are stored in `evolution-plans/`:

```
evolution-plans/
├── grep-rails/
│   ├── 2024-12-analysis.json
│   ├── 2024-12-plan.json
│   └── generated-levels/
│       ├── level-10.json
│       └── level-11.json
├── stack-panic/
│   └── ...
```

## Best Practices

1. **Analyze First** - Always analyze gameplay data before generating content
2. **Validate Output** - AI-generated content should be reviewed before deployment
3. **A/B Test** - Test new content with a subset of players
4. **Monitor Impact** - Track metrics after deploying changes
5. **Iterate** - Use feedback to improve generation prompts

## License

MIT - GrepLabs LLC
