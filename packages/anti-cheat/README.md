# @grepcoin/anti-cheat

Server-side game score validation system for GrepCoin arcade games. Prevents cheating and ensures fair play.

## Features

- **Score Validation** - Game-specific score limits and patterns
- **Timing Analysis** - Detect impossible game durations
- **Rate Limiting** - Prevent submission spam
- **Confidence Scoring** - Probabilistic validity assessment
- **Extensible** - Easy to add custom validators

## Installation

```bash
npm install @grepcoin/anti-cheat
```

## Quick Start

```typescript
import { validateGameSubmission } from '@grepcoin/anti-cheat'

const result = validateGameSubmission({
  gameSlug: 'grep-rails',
  score: 1500,
  duration: 45000,  // 45 seconds
  timestamp: Date.now(),
  userId: 'user123',
})

if (result.valid) {
  // Accept the score
  console.log('Score accepted with confidence:', result.confidence)
} else {
  // Reject the score
  console.log('Score rejected:', result.errors)
}
```

## API

### `validateGameSubmission(data: GameSubmissionData): ValidationResult`

Main validation function that runs all validators.

**Input:**
```typescript
interface GameSubmissionData {
  gameSlug: string      // Game identifier
  score: number         // Player's score
  duration: number      // Game duration in ms
  timestamp: number     // Submission timestamp
  userId: string        // Player identifier
  metadata?: {          // Optional game-specific data
    level?: number
    moves?: number
    [key: string]: any
  }
}
```

**Output:**
```typescript
interface ValidationResult {
  valid: boolean        // Overall validity
  errors: string[]      // Rejection reasons
  warnings?: string[]   // Suspicious but allowed
  confidence: number    // 0-1 validity confidence
}
```

## Validators

### Score Validator

Checks if scores are within acceptable limits for each game:

```typescript
import { validateScore } from '@grepcoin/anti-cheat'

const result = validateScore({
  gameSlug: 'grep-rails',
  score: 50000,  // Suspiciously high
  duration: 10000,
})

// result.errors: ['Score exceeds maximum for grep-rails']
```

**Game Limits:**

| Game | Max Score | Max Per Second |
|------|-----------|----------------|
| grep-rails | 10,000 | 200 |
| stack-panic | 15,000 | 150 |
| merge-miners | 20,000 | 100 |
| quantum-grep | 25,000 | 250 |
| bug-hunter | 50,000 | 500 |
| crypto-snake | 10,000 | 50 |
| syntax-sprint | 15,000 | 200 |
| regex-crossword | 10,000 | 100 |

### Timing Validator

Checks game duration is within acceptable bounds:

```typescript
import { validateTiming } from '@grepcoin/anti-cheat'

const result = validateTiming({
  gameSlug: 'grep-rails',
  duration: 500,  // Too fast
  timestamp: Date.now(),
})

// result.errors: ['Game duration too short']
```

**Timing Limits:**

| Game | Min Duration | Max Duration |
|------|--------------|--------------|
| grep-rails | 5s | 10min |
| stack-panic | 3s | 5min |
| merge-miners | 10s | 15min |
| quantum-grep | 5s | 10min |
| bug-hunter | 10s | 20min |
| crypto-snake | 5s | 30min |
| syntax-sprint | 5s | 10min |
| regex-crossword | 30s | 30min |

### Rate Validator

Prevents rapid-fire submissions:

```typescript
import { validateRate } from '@grepcoin/anti-cheat'

const result = validateRate({
  userId: 'user123',
  gameSlug: 'grep-rails',
  timestamp: Date.now(),
})

// result.errors: ['Too many submissions, please wait']
```

**Rate Limits:**
- 6 submissions per minute per game
- 20 submissions per minute total
- 100 submissions per hour total

## Confidence Scoring

Each validator contributes to an overall confidence score:

```typescript
const result = validateGameSubmission(data)

console.log(result.confidence)  // 0.85 = 85% confident it's legitimate

// Confidence factors:
// - Score ratio to max: higher scores = lower confidence
// - Duration ratio: very short/long = lower confidence
// - Submission frequency: rapid submissions = lower confidence
```

**Interpretation:**
- `1.0` - Perfect, no concerns
- `0.8-1.0` - High confidence, accept
- `0.5-0.8` - Medium confidence, accept with logging
- `0.3-0.5` - Low confidence, flag for review
- `<0.3` - Very suspicious, consider rejection

## Integration

### With Next.js API Route

```typescript
// apps/web/src/app/api/games/[slug]/submit/route.ts
import { validateGameSubmission } from '@grepcoin/anti-cheat'

export async function POST(request: Request) {
  const data = await request.json()

  const validation = validateGameSubmission({
    gameSlug: params.slug,
    score: data.score,
    duration: data.duration,
    timestamp: Date.now(),
    userId: session.userId,
  })

  if (!validation.valid) {
    return Response.json({
      error: 'Invalid submission',
      reasons: validation.errors
    }, { status: 400 })
  }

  if (validation.confidence < 0.5) {
    // Log for review but accept
    await logSuspiciousSubmission(data, validation)
  }

  // Process valid submission
  await saveScore(data)
  return Response.json({ success: true })
}
```

## Adding Custom Validators

```typescript
import { GameSubmissionData, ValidationResult } from '@grepcoin/anti-cheat'

function validateCustomRule(data: GameSubmissionData): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  let confidence = 1.0

  // Your custom logic
  if (data.metadata?.moves && data.metadata.moves > 1000) {
    warnings.push('High move count detected')
    confidence *= 0.8
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
    confidence,
  }
}
```

## Architecture

```
packages/anti-cheat/
├── src/
│   ├── index.ts              # Main exports
│   ├── types.ts              # Type definitions
│   └── validators/
│       ├── score-validator.ts    # Score limits
│       ├── timing-validator.ts   # Duration checks
│       └── rate-validator.ts     # Submission frequency
├── dist/                     # Compiled output
├── package.json
└── tsconfig.json
```

## License

MIT - GrepLabs LLC
