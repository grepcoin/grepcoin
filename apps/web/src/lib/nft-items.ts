import { Item, ItemRarity } from './inventory'

// NFT metadata structure (ERC-1155 standard)
export interface NFTMetadata {
  name: string
  description: string
  image: string
  external_url?: string
  attributes: NFTAttribute[]
  properties?: {
    rarity: ItemRarity
    type: string
    tradeable: boolean
  }
}

export interface NFTAttribute {
  trait_type: string
  value: string | number
}

// Mapping item IDs to token IDs
export const ITEM_TO_TOKEN_ID: Record<string, number> = {
  'avatar-crown': 1,
  'avatar-robot': 2,
  'boost-2x': 3,
  'boost-xp': 4,
  'lootbox': 5,
  'badge-og': 6,
}

export const TOKEN_ID_TO_ITEM: Record<number, string> = Object.fromEntries(
  Object.entries(ITEM_TO_TOKEN_ID).map(([k, v]) => [v, k])
)

// IPFS helpers
export interface IPFSUploadResult {
  cid: string
  url: string
}

/**
 * Generate NFT metadata for an item
 */
export function generateItemMetadata(item: Item): NFTMetadata {
  const attributes: NFTAttribute[] = [
    { trait_type: 'Type', value: item.type },
    { trait_type: 'Rarity', value: item.rarity },
  ]

  if (item.effect) {
    attributes.push({ trait_type: 'Effect Type', value: item.effect.type })
    attributes.push({ trait_type: 'Effect Value', value: item.effect.value })
  }

  return {
    name: item.name,
    description: item.description,
    image: getItemImageURL(item.id),
    external_url: `https://grepcoin.io/inventory/${item.id}`,
    attributes,
    properties: {
      rarity: item.rarity,
      type: item.type,
      tradeable: item.tradeable,
    },
  }
}

/**
 * Get item image URL (would be IPFS in production)
 */
export function getItemImageURL(itemId: string): string {
  // In production, this would point to IPFS-hosted images
  // For now, using a placeholder that represents the item icon
  return `https://grepcoin.io/api/items/${itemId}/image`
}

/**
 * Upload metadata to IPFS (mock implementation)
 * In production, this would use a service like Pinata, NFT.Storage, or Web3.Storage
 */
export async function uploadToIPFS(metadata: NFTMetadata): Promise<IPFSUploadResult> {
  // Mock implementation - in production, upload to IPFS
  const mockCID = `Qm${Math.random().toString(36).substring(2, 15)}`

  // In production, you would do something like:
  // const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${process.env.PINATA_JWT}`
  //   },
  //   body: JSON.stringify(metadata)
  // })
  // const data = await response.json()
  // return { cid: data.IpfsHash, url: `ipfs://${data.IpfsHash}` }

  return {
    cid: mockCID,
    url: `ipfs://${mockCID}`,
  }
}

/**
 * Get IPFS gateway URL from IPFS URI
 */
export function getIPFSGatewayURL(ipfsURI: string): string {
  if (!ipfsURI.startsWith('ipfs://')) return ipfsURI
  const cid = ipfsURI.replace('ipfs://', '')
  return `https://ipfs.io/ipfs/${cid}`
}

/**
 * Get OpenSea URL for an NFT
 */
export function getOpenSeaURL(
  contractAddress: string,
  tokenId: number,
  chainId: number = 8453 // Base mainnet
): string {
  const chain = chainId === 8453 ? 'base' : 'base-sepolia'
  return `https://opensea.io/assets/${chain}/${contractAddress}/${tokenId}`
}

/**
 * Get Etherscan/Basescan URL for contract/token
 */
export function getExplorerURL(
  contractAddress: string,
  tokenId?: number,
  chainId: number = 8453
): string {
  const baseURL = chainId === 8453
    ? 'https://basescan.org'
    : 'https://sepolia.basescan.org'

  if (tokenId !== undefined) {
    return `${baseURL}/token/${contractAddress}?a=${tokenId}`
  }
  return `${baseURL}/address/${contractAddress}`
}

/**
 * Parse token URI to get metadata
 */
export async function fetchTokenMetadata(tokenURI: string): Promise<NFTMetadata | null> {
  try {
    const url = getIPFSGatewayURL(tokenURI)
    const response = await fetch(url)
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch token metadata:', error)
    return null
  }
}

/**
 * Get rarity color class
 */
export function getRarityColor(rarity: ItemRarity): string {
  const colors = {
    common: 'text-gray-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-yellow-400',
  }
  return colors[rarity]
}

/**
 * Get rarity badge class
 */
export function getRarityBadge(rarity: ItemRarity): string {
  const badges = {
    common: 'bg-gray-500/20 text-gray-400 border-gray-500',
    rare: 'bg-blue-500/20 text-blue-400 border-blue-500',
    epic: 'bg-purple-500/20 text-purple-400 border-purple-500',
    legendary: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
  }
  return badges[rarity]
}

/**
 * Format token ID for display
 */
export function formatTokenId(tokenId: number): string {
  return `#${tokenId.toString().padStart(4, '0')}`
}

/**
 * Validate NFT ownership on-chain
 */
export interface NFTOwnership {
  owner: string
  balance: number
  tokenId: number
}

/**
 * Batch fetch NFT balances for a user
 */
export async function batchFetchNFTBalances(
  userAddress: string,
  contractAddress: string,
  tokenIds: number[]
): Promise<Map<number, number>> {
  // This would call the getUserItems function on the contract
  // For now, returning a mock implementation
  const balances = new Map<number, number>()

  // In production, use wagmi/viem to call contract:
  // const contract = getContract({
  //   address: contractAddress,
  //   abi: GREP_ITEMS_ABI,
  //   publicClient,
  // })
  // const result = await contract.read.getUserItems([userAddress, tokenIds])
  // result.forEach((balance, index) => {
  //   balances.set(tokenIds[index], Number(balance))
  // })

  return balances
}
