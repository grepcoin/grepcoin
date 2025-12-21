'use client'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Package, Sparkles, Download } from 'lucide-react'
import { useInventory } from '@/hooks/useInventory'
import { useOwnedNFTs, useMintAsNFT, useImportNFT, useNFTBalance } from '@/hooks/useNFTItems'
import { NFTItemCard } from '@/components/NFTItemCard'
import { ITEM_TO_TOKEN_ID, TOKEN_ID_TO_ITEM } from '@/lib/nft-items'

type ViewMode = 'in-game' | 'on-chain'

export default function InventoryPage() {
  const { address } = useAccount()
  const [viewMode, setViewMode] = useState<ViewMode>('in-game')
  const { items, isLoading: isLoadingInventory, consumeItem, equipItem } = useInventory()
  const { nfts, isLoading: isLoadingNFTs, refetch: refetchNFTs } = useOwnedNFTs()
  const { mintAsNFT, isMinting } = useMintAsNFT()
  const { importNFT, isImporting } = useImportNFT()

  useEffect(() => {
    if (address && viewMode === 'on-chain') {
      refetchNFTs()
    }
  }, [address, viewMode, refetchNFTs])

  const handleMintAsNFT = async (itemId: string) => {
    const result = await mintAsNFT(itemId)
    if (result.success) {
      alert('NFT mint prepared! The item will be minted by our backend.')
      // Optionally refetch inventory to update UI
      window.location.reload()
    } else {
      alert(`Failed to mint NFT: ${result.error}`)
    }
  }

  const handleImportNFT = async (tokenId: number, balance: number) => {
    const result = await importNFT(tokenId, balance)
    if (result.success) {
      alert('NFT imported successfully!')
      // Switch to in-game view to see the imported item
      setViewMode('in-game')
      window.location.reload()
    } else {
      alert(`Failed to import NFT: ${result.error}`)
    }
  }

  const handleConsumeItem = async (itemId: string) => {
    const result = await consumeItem(itemId)
    if (result.success) {
      alert(`Used ${result.item?.name}!`)
    }
  }

  const handleEquipItem = async (itemId: string) => {
    await equipItem(itemId)
  }

  if (!address) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h1 className="text-4xl font-bold mb-4">Inventory</h1>
            <p className="text-gray-400 mb-8">
              Connect your wallet to view your items
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Package className="w-10 h-10" />
            Inventory
          </h1>
          <p className="text-gray-400">
            Manage your items and NFTs
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-4 mb-8 bg-gray-800/50 rounded-xl p-1 max-w-md">
          <button
            onClick={() => setViewMode('in-game')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              viewMode === 'in-game'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Package className="w-4 h-4" />
              In-Game Items
            </div>
          </button>
          <button
            onClick={() => setViewMode('on-chain')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              viewMode === 'on-chain'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              On-Chain NFTs
            </div>
          </button>
        </div>

        {/* Content */}
        {viewMode === 'in-game' ? (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Items</h2>
              <p className="text-gray-400">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </p>
            </div>

            {isLoadingInventory ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
                <p className="text-gray-400 mt-4">Loading inventory...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 text-lg mb-2">No items yet</p>
                <p className="text-gray-500 text-sm">
                  Play games to earn items and rewards
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {items.map((inv) => {
                  const tokenId = ITEM_TO_TOKEN_ID[inv.itemId]
                  return (
                    <NFTItemCard
                      key={inv.itemId}
                      item={inv.item}
                      quantity={inv.quantity}
                      equipped={inv.equipped}
                      tokenId={tokenId}
                      isMinted={false} // Would come from database
                      onUse={
                        inv.item.type === 'booster' || inv.item.type === 'consumable'
                          ? () => handleConsumeItem(inv.itemId)
                          : undefined
                      }
                      onEquip={
                        inv.item.type === 'cosmetic'
                          ? () => handleEquipItem(inv.itemId)
                          : undefined
                      }
                      onMint={
                        inv.item.tradeable
                          ? () => handleMintAsNFT(inv.itemId)
                          : undefined
                      }
                    />
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your NFTs</h2>
              <button
                onClick={refetchNFTs}
                disabled={isLoadingNFTs}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 rounded-lg font-semibold text-sm transition-colors"
              >
                {isLoadingNFTs ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {isLoadingNFTs ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
                <p className="text-gray-400 mt-4">Loading NFTs...</p>
              </div>
            ) : nfts.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 text-lg mb-2">No NFTs found</p>
                <p className="text-gray-500 text-sm mb-4">
                  Mint your in-game items as NFTs to see them here
                </p>
                <button
                  onClick={() => setViewMode('in-game')}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold transition-colors"
                >
                  View In-Game Items
                </button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {nfts.map((nft) => {
                    const itemId = TOKEN_ID_TO_ITEM[nft.tokenId]
                    const item = items.find((i) => i.itemId === itemId)?.item

                    if (!item) return null

                    return (
                      <NFTItemCard
                        key={nft.tokenId}
                        item={item}
                        quantity={nft.balance}
                        tokenId={nft.tokenId}
                        isMinted={true}
                        onImport={() => handleImportNFT(nft.tokenId, nft.balance)}
                      />
                    )
                  })}
                </div>

                <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Download className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-blue-400 mb-1">Import NFTs</h3>
                      <p className="text-sm text-gray-300">
                        Click the "Import NFT" button on any NFT to add it to your in-game
                        inventory. This will sync your on-chain assets with your game account.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 p-6 bg-purple-900/20 border border-purple-500/30 rounded-xl">
          <h3 className="font-bold text-purple-400 mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            About NFT Items
          </h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p>
              • <strong>Mint as NFT:</strong> Convert tradeable in-game items into ERC-1155
              NFTs on the blockchain
            </p>
            <p>
              • <strong>Import NFT:</strong> Bring your on-chain NFTs into your in-game
              inventory
            </p>
            <p>
              • <strong>Trade:</strong> Once minted, you can trade your items on OpenSea and
              other marketplaces
            </p>
            <p>
              • <strong>True Ownership:</strong> NFTs are stored on the blockchain and fully
              owned by you
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
