import { createPublicClient, http, parseAbi } from 'viem'
import { base, baseSepolia } from 'viem/chains'

// GREP Token ABI (only the functions we need)
const GREP_TOKEN_ABI = parseAbi([
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
])

// Contract addresses
const GREP_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_GREP_TOKEN_ADDRESS as `0x${string}` | undefined
const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '84532') // Default to Base Sepolia

// Create public client for reading chain data
function getPublicClient() {
  const chain = CHAIN_ID === 8453 ? base : baseSepolia
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || chain.rpcUrls.default.http[0]

  return createPublicClient({
    chain,
    transport: http(rpcUrl),
  })
}

/**
 * Get GREP token balance for a wallet address
 * Returns balance in human-readable format (not wei)
 */
export async function getGrepBalance(walletAddress: string): Promise<number> {
  if (!GREP_TOKEN_ADDRESS) {
    console.warn('GREP_TOKEN_ADDRESS not configured, returning 0 balance')
    return 0
  }

  try {
    const client = getPublicClient()

    const balance = await client.readContract({
      address: GREP_TOKEN_ADDRESS,
      abi: GREP_TOKEN_ABI,
      functionName: 'balanceOf',
      args: [walletAddress as `0x${string}`],
    })

    // GREP has 18 decimals
    return Number(balance) / 1e18
  } catch (error) {
    console.error('Error fetching GREP balance:', error)
    return 0
  }
}

/**
 * Get GREP token balance in wei (raw value)
 */
export async function getGrepBalanceRaw(walletAddress: string): Promise<bigint> {
  if (!GREP_TOKEN_ADDRESS) {
    console.warn('GREP_TOKEN_ADDRESS not configured, returning 0 balance')
    return BigInt(0)
  }

  try {
    const client = getPublicClient()

    const balance = await client.readContract({
      address: GREP_TOKEN_ADDRESS,
      abi: GREP_TOKEN_ABI,
      functionName: 'balanceOf',
      args: [walletAddress as `0x${string}`],
    })

    return balance
  } catch (error) {
    console.error('Error fetching GREP balance:', error)
    return BigInt(0)
  }
}

/**
 * Check if wallet has sufficient GREP balance
 */
export async function hasEnoughGrep(
  walletAddress: string,
  requiredAmount: number
): Promise<{ hasEnough: boolean; balance: number; required: number }> {
  const balance = await getGrepBalance(walletAddress)

  return {
    hasEnough: balance >= requiredAmount,
    balance,
    required: requiredAmount,
  }
}

/**
 * Format GREP amount for display
 */
export function formatGrepAmount(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M`
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(2)}K`
  }
  return amount.toFixed(2)
}
