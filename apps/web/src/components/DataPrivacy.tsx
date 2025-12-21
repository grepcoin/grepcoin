'use client'

import { ExportButton } from './ExportButton'

export function DataPrivacy() {
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <span className="text-3xl">🔒</span>
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-2">Your Data, Your Control</h3>
          <p className="text-gray-400 mb-4">
            You can export all your GrepCoin data at any time. This includes your game history,
            achievements, GREP transactions, and activity logs.
          </p>
          <div className="flex flex-wrap gap-4">
            <ExportButton />
            <button className="flex items-center gap-2 px-4 py-2 bg-red-900/50 hover:bg-red-900 text-red-300 rounded-lg">
              <span>🗑️</span>
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
