'use client'

export function SearchButton() {
  const openSearch = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
  }

  return (
    <button
      onClick={openSearch}
      className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400"
    >
      <span>🔍</span>
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden sm:inline px-1.5 py-0.5 bg-gray-700 rounded text-xs">⌘K</kbd>
    </button>
  )
}
