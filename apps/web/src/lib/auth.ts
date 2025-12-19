import { SiweMessage } from 'siwe'
import { createHmac } from 'crypto'

const SESSION_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production'

export function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

function signData(data: string): string {
  return createHmac('sha256', SESSION_SECRET).update(data).digest('hex')
}

export function createSiweMessage(
  address: string,
  nonce: string,
  chainId: number,
  domain: string = typeof window !== 'undefined' ? window.location.host : 'localhost:3000'
): string {
  const message = new SiweMessage({
    domain,
    address,
    statement: 'Sign in to GrepCoin Arcade',
    uri: `https://${domain}`,
    version: '1',
    chainId,
    nonce,
  })
  return message.prepareMessage()
}

export async function verifySiweMessage(
  message: string,
  signature: string
): Promise<{ success: boolean; address?: string; error?: string }> {
  try {
    const siweMessage = new SiweMessage(message)
    const result = await siweMessage.verify({ signature })

    if (result.success) {
      return { success: true, address: siweMessage.address }
    }
    return { success: false, error: 'Verification failed' }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// HMAC-signed session token
export function createSessionToken(address: string): string {
  const timestamp = Date.now()
  const data = `${address.toLowerCase()}:${timestamp}`
  const signature = signData(data)
  return Buffer.from(`${data}:${signature}`).toString('base64')
}

export function parseSessionToken(token: string): { address: string; timestamp: number } | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString()
    const parts = decoded.split(':')

    if (parts.length !== 3) {
      return null
    }

    const [address, timestampStr, signature] = parts
    const timestamp = parseInt(timestampStr, 10)

    if (isNaN(timestamp)) {
      return null
    }

    // Verify HMAC signature
    const data = `${address}:${timestampStr}`
    const expectedSignature = signData(data)

    if (signature !== expectedSignature) {
      return null // Invalid signature - token was forged
    }

    // Session valid for 7 days
    const maxAge = 7 * 24 * 60 * 60 * 1000
    if (Date.now() - timestamp > maxAge) {
      return null
    }

    return { address, timestamp }
  } catch {
    return null
  }
}
