'use client'

import { useState } from 'react'
import { useExport } from '@/hooks/useExport'
import { ExportFormat, ExportOptions } from '@/lib/export'

interface Props {
  onClose: () => void
}

export function ExportDataModal({ onClose }: Props) {
  const { exportData, exportProgress } = useExport()
  const [format, setFormat] = useState<ExportFormat>('json')
  const [options, setOptions] = useState({
    includeGames: true,
    includeAchievements: true,
    includeTransactions: true,
    includeActivity: false,
  })

  const handleExport = () => {
    exportData({ format, ...options })
  }

  const isExporting = exportProgress.status !== 'idle' && exportProgress.status !== 'complete'

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Export Your Data</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Format</label>
            <div className="flex gap-2">
              {(['json', 'csv'] as ExportFormat[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`flex-1 py-2 rounded-lg uppercase ${
                    format === f ? 'bg-emerald-600' : 'bg-gray-800'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Include</label>
            <div className="space-y-2">
              {[
                { key: 'includeGames', label: 'Game History', icon: '🎮' },
                { key: 'includeAchievements', label: 'Achievements', icon: '🏆' },
                { key: 'includeTransactions', label: 'GREP Transactions', icon: '💰' },
                { key: 'includeActivity', label: 'Activity Log', icon: '📋' },
              ].map(({ key, label, icon }) => (
                <label key={key} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options[key as keyof typeof options]}
                    onChange={e => setOptions({ ...options, [key]: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <span>{icon}</span>
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {exportProgress.status !== 'idle' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{exportProgress.message}</span>
                <span>{exportProgress.progress}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    exportProgress.status === 'error' ? 'bg-red-500' :
                    exportProgress.status === 'complete' ? 'bg-emerald-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${exportProgress.progress}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleExport}
            disabled={isExporting || !Object.values(options).some(v => v)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg font-bold"
          >
            {isExporting ? 'Exporting...' : 'Download Export'}
          </button>
        </div>
      </div>
    </div>
  )
}
