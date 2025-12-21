'use client'
import { Item, RARITY_COLORS } from '@/lib/inventory'
import {
  getOpenSeaURL,
  getExplorerURL,
  getRarityBadge,
  formatTokenId,
} from '@/lib/nft-items'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ExternalLink, Sparkles, CheckCircle } from 'lucide-react'

interface NFTItemCardProps {
  item: Item
  quantity: number
  equipped?: boolean
  tokenId?: number
  isMinted?: boolean
  onUse?: () => void
  onEquip?: () => void
  onMint?: () => Promise<void>
  onImport?: () => Promise<void>
  showActions?: boolean
}

export function NFTItemCard({
  item,
  quantity,
  equipped,
  tokenId,
  isMinted,
  onUse,
  onEquip,
  onMint,
  onImport,
  showActions = true,
}: NFTItemCardProps) {
  const { chainId } = useAccount()
  const [isProcessing, setIsProcessing] = useState(false)

  const contractAddress = '0x0000000000000000000000000000000000000000' // Will be updated after deployment
  const isContractDeployed = contractAddress !== '0x0000000000000000000000000000000000000000'

  const handleMint = async () => {
    if (!onMint) return
    setIsProcessing(true)
    try {
      await onMint()
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImport = async () => {
    if (!onImport) return
    setIsProcessing(true)
    try {
      await onImport()
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div
      className={`border-2 rounded-xl p-4 ${RARITY_COLORS[item.rarity]} ${
        equipped ? 'ring-2 ring-emerald-400' : ''
      } relative transition-all hover:scale-105`}
    >
      {/* NFT Badge */}
      {isMinted && tokenId !== undefined && (
        <div className="absolute top-2 right-2 bg-purple-600/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          NFT
        </div>
      )}

      {/* Equipped Badge */}
      {equipped && (
        <div className="absolute top-2 left-2 bg-emerald-600/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Equipped
        </div>
      )}

      {/* Item Icon */}
      <div className="text-5xl text-center mb-3 mt-2">{item.icon}</div>

      {/* Item Name */}
      <p className="font-bold text-sm text-center truncate mb-1">{item.name}</p>

      {/* Token ID */}
      {isMinted && tokenId !== undefined && (
        <p className="text-xs text-center text-purple-400 font-mono mb-1">
          {formatTokenId(tokenId)}
        </p>
      )}

      {/* Quantity */}
      <p className="text-xs text-gray-400 text-center mb-2">x{quantity}</p>

      {/* Rarity Badge */}
      <div className="flex justify-center mb-3">
        <span className={`text-xs px-2 py-1 rounded border ${getRarityBadge(item.rarity)}`}>
          {item.rarity.toUpperCase()}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-400 text-center mb-3 line-clamp-2">
        {item.description}
      </p>

      {/* Actions */}
      {showActions && (
        <div className="space-y-2">
          {/* Primary Actions */}
          <div className="flex gap-2">
            {item.type === 'booster' || item.type === 'consumable' ? (
              <button
                onClick={onUse}
                className="flex-1 text-xs py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold transition-colors"
                disabled={quantity === 0}
              >
                Use
              </button>
            ) : item.type === 'cosmetic' ? (
              <button
                onClick={onEquip}
                className="flex-1 text-xs py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
              >
                {equipped ? 'Equipped' : 'Equip'}
              </button>
            ) : null}
          </div>

          {/* NFT Actions */}
          {item.tradeable && (
            <div className="space-y-2">
              {/* Mint as NFT */}
              {!isMinted && onMint && isContractDeployed && (
                <button
                  onClick={handleMint}
                  disabled={isProcessing || quantity === 0}
                  className="w-full text-xs py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  {isProcessing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      Mint as NFT
                    </>
                  )}
                </button>
              )}

              {/* Import NFT */}
              {!isMinted && onImport && isContractDeployed && (
                <button
                  onClick={handleImport}
                  disabled={isProcessing}
                  className="w-full text-xs py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                >
                  {isProcessing ? 'Importing...' : 'Import NFT'}
                </button>
              )}

              {/* External Links */}
              {isMinted && tokenId !== undefined && isContractDeployed && (
                <div className="flex gap-2">
                  <a
                    href={getOpenSeaURL(contractAddress, tokenId, chainId || 8453)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-xs py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    OpenSea
                  </a>
                  <a
                    href={getExplorerURL(contractAddress, tokenId, chainId || 8453)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-xs py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Explorer
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
