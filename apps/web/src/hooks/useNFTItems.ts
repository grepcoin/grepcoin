'use client'
import { useState, useCallback } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { getContractAddress, GREP_ITEMS_ABI } from '@/lib/contracts'
import { ITEM_TO_TOKEN_ID } from '@/lib/nft-items'

interface NFTBalance {
  tokenId: number
  balance: number
  itemId: string
}

/**
 * Hook to fetch user's owned NFTs from the contract
 */
export function useOwnedNFTs() {
  const { address, chainId } = useAccount()
  const [nfts, setNfts] = useState<NFTBalance[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const contractAddress = getContractAddress(chainId || 8453, 'GREP_ITEMS')

  const fetchNFTs = useCallback(async () => {
    if (!address || !contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      setNfts([])
      return
    }

    setIsLoading(true)

    try {
      // Get all token IDs
      const tokenIds = Object.values(ITEM_TO_TOKEN_ID)

      // In production, use wagmi's multicall or the contract's getUserItems function
      // For now, we'll simulate fetching balances
      const balances: NFTBalance[] = []

      // This would be replaced with actual contract calls:
      // const result = await readContract({
      //   address: contractAddress,
      //   abi: GREP_ITEMS_ABI,
      //   functionName: 'getUserItems',
      //   args: [address, tokenIds],
      // })

      // For demo purposes, mock some data
      // In production, loop through result and create NFTBalance objects
      for (const [itemId, tokenId] of Object.entries(ITEM_TO_TOKEN_ID)) {
        // Mock: assume user has no NFTs for now
        // In production: const balance = result[index]
        const balance = 0

        if (balance > 0) {
          balances.push({ tokenId, balance: Number(balance), itemId })
        }
      }

      setNfts(balances)
    } catch (error) {
      console.error('Error fetching NFTs:', error)
      setNfts([])
    } finally {
      setIsLoading(false)
    }
  }, [address, contractAddress])

  return { nfts, isLoading, refetch: fetchNFTs }
}

/**
 * Hook to check balance of a specific NFT token
 */
export function useNFTBalance(tokenId: number) {
  const { address, chainId } = useAccount()
  const contractAddress = getContractAddress(chainId || 8453, 'GREP_ITEMS')

  const { data, isLoading, refetch } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: GREP_ITEMS_ABI,
    functionName: 'balanceOf',
    args: address && contractAddress !== '0x0000000000000000000000000000000000000000'
      ? [address, BigInt(tokenId)]
      : undefined,
  })

  return {
    balance: data ? Number(data) : 0,
    isLoading,
    refetch,
  }
}

/**
 * Hook to mint an inventory item as NFT
 */
export function useMintAsNFT() {
  const { address, chainId } = useAccount()
  const [isMinting, setIsMinting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const mintAsNFT = useCallback(
    async (itemId: string) => {
      if (!address) {
        setError('Wallet not connected')
        return { success: false, error: 'Wallet not connected' }
      }

      setIsMinting(true)
      setError(null)

      try {
        // Step 1: Call API to prepare mint (generate metadata, etc.)
        const prepareResponse = await fetch('/api/inventory/mint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, walletAddress: address }),
        })

        const prepareData = await prepareResponse.json()

        if (!prepareResponse.ok) {
          throw new Error(prepareData.error || 'Failed to prepare mint')
        }

        const { tokenId, contractAddress } = prepareData.mint

        // Step 2: Call contract to mint NFT
        // Note: This requires the backend to be a minter, or the user's wallet to have minter role
        // In production, the backend would mint on behalf of the user
        // For now, we'll return the prepared data for manual minting

        // writeContract({
        //   address: contractAddress,
        //   abi: GREP_ITEMS_ABI,
        //   functionName: 'mint',
        //   args: [address, BigInt(tokenId), BigInt(1), '0x'],
        // })

        setIsMinting(false)
        return {
          success: true,
          data: prepareData,
          message: 'NFT minting prepared. Contact support to complete the mint.',
        }
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to mint NFT'
        setError(errorMsg)
        setIsMinting(false)
        return { success: false, error: errorMsg }
      }
    },
    [address]
  )

  return {
    mintAsNFT,
    isMinting: isMinting || isConfirming,
    isSuccess,
    error,
    hash,
  }
}

/**
 * Hook to import an NFT from on-chain to inventory
 */
export function useImportNFT() {
  const { address } = useAccount()
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const importNFT = useCallback(
    async (tokenId: number, balance: number) => {
      if (!address) {
        setError('Wallet not connected')
        return { success: false, error: 'Wallet not connected' }
      }

      setIsImporting(true)
      setError(null)

      try {
        const response = await fetch('/api/inventory/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokenId,
            walletAddress: address,
            balance,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to import NFT')
        }

        setIsImporting(false)
        return { success: true, data }
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to import NFT'
        setError(errorMsg)
        setIsImporting(false)
        return { success: false, error: errorMsg }
      }
    },
    [address]
  )

  return {
    importNFT,
    isImporting,
    error,
  }
}

/**
 * Hook to get NFT metadata URI
 */
export function useNFTMetadata(tokenId: number) {
  const { chainId } = useAccount()
  const contractAddress = getContractAddress(chainId || 8453, 'GREP_ITEMS')

  const { data: uri, isLoading } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: GREP_ITEMS_ABI,
    functionName: 'uri',
    args: contractAddress !== '0x0000000000000000000000000000000000000000'
      ? [BigInt(tokenId)]
      : undefined,
  })

  return {
    uri: uri as string | undefined,
    isLoading,
  }
}

/**
 * Hook to get detailed item info from contract
 */
export function useItemInfo(tokenId: number) {
  const { chainId } = useAccount()
  const contractAddress = getContractAddress(chainId || 8453, 'GREP_ITEMS')

  const { data, isLoading } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: GREP_ITEMS_ABI,
    functionName: 'getItemInfo',
    args: contractAddress !== '0x0000000000000000000000000000000000000000'
      ? [BigInt(tokenId)]
      : undefined,
  })

  if (!data) {
    return { itemInfo: null, isLoading }
  }

  const [rarity, isTradeable, totalSupply, tokenURI] = data as [number, boolean, bigint, string]

  return {
    itemInfo: {
      rarity,
      isTradeable,
      totalSupply: Number(totalSupply),
      tokenURI,
    },
    isLoading,
  }
}
