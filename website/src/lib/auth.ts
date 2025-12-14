import { SiweMessage } from 'siwe'

export function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
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

// Simple session token using signed timestamp
export function createSessionToken(address: string): string {
  const timestamp = Date.now()
  const data = `${address}:${timestamp}`
  // In production, use proper JWT or encrypted tokens
  return Buffer.from(data).toString('base64')
}

export function parseSessionToken(token: string): { address: string; timestamp: number } | null {
  try {
    const data = Buffer.from(token, 'base64').toString()
    const [address, timestampStr] = data.split(':')
    const timestamp = parseInt(timestampStr, 10)

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
