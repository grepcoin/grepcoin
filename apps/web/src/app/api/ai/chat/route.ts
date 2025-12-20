import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { parseSessionToken } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import Anthropic from '@anthropic-ai/sdk'

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const AI_MODEL = process.env.AI_MODEL || 'claude-3-5-sonnet-20241022'
const AI_MAX_TOKENS = parseInt(process.env.AI_MAX_TOKENS || '4096')
const AI_TEMPERATURE = parseFloat(process.env.AI_TEMPERATURE || '0.7')

interface ChatRequest {
  message: string
  context?: string
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const session = parseSessionToken(sessionToken)
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    // 2. Rate limiting - 10 requests per minute per user
    const rateCheck = rateLimit(
      session.address,
      { interval: 60_000, limit: 10 },
      'ai-chat'
    )

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many AI chat requests. Please slow down.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Remaining': String(rateCheck.remaining),
            'X-RateLimit-Reset': String(rateCheck.resetAt),
          },
        }
      )
    }

    // 3. Validate request
    const body: ChatRequest = await request.json()

    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      )
    }

    if (body.message.length > 4000) {
      return NextResponse.json(
        { error: 'Message too long (max 4000 characters)' },
        { status: 400 }
      )
    }

    // 4. Prepare system prompt with GrepCoin context
    const systemPrompt = `You are an AI assistant for GrepCoin, an AI-built crypto arcade where users play games to earn GREP tokens.

Key features of GrepCoin:
- Play 10 different games: Regex Rush, Memory Match, Speed Type, Code Breaker, Bug Hunter, Quantum Grep, Regex Crossword, Merge Miners, Syntax Sprint, and Grep Rails
- Earn GREP tokens by playing games and completing daily challenges
- Stake GREP tokens for earning multipliers (Bronze 1.2x, Silver 1.5x, Gold 2x, Diamond 3x)
- Unlock achievements and climb leaderboards
- Refer friends to earn bonus rewards
- Participate in fundraising campaigns

Your role:
- Help users understand how to play games and earn tokens
- Explain staking tiers and multipliers
- Answer questions about achievements and challenges
- Provide tips for maximizing earnings
- Be friendly, concise, and helpful
- If you don't know something specific about the platform, be honest

Current user wallet: ${session.address}
${body.context ? `\nAdditional context: ${body.context}` : ''}`

    // 5. Create streaming response using ReadableStream
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Create Claude streaming request
          const messageStream = await anthropic.messages.stream({
            model: AI_MODEL,
            max_tokens: AI_MAX_TOKENS,
            temperature: AI_TEMPERATURE,
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: body.message,
              },
            ],
          })

          // Stream chunks to client
          for await (const chunk of messageStream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              const text = chunk.delta.text
              controller.enqueue(encoder.encode(text))
            }
          }

          // Close the stream
          controller.close()
        } catch (error) {
          console.error('Claude streaming error:', error)

          // Send error to client
          const errorMessage = error instanceof Anthropic.APIError
            ? `AI Error: ${error.message}`
            : 'An error occurred while processing your request.'

          controller.enqueue(encoder.encode(`\n\n[Error: ${errorMessage}]`))
          controller.close()
        }
      },
    })

    // 6. Return streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Content-Type-Options': 'nosniff',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('AI chat endpoint error:', error)

    // Handle different error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    if (error instanceof Anthropic.APIError) {
      // Handle Anthropic-specific errors
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'AI service authentication failed' },
          { status: 503 }
        )
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'AI service rate limit exceeded' },
          { status: 503 }
        )
      }
      return NextResponse.json(
        { error: 'AI service error' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process AI chat request' },
      { status: 500 }
    )
  }
}
