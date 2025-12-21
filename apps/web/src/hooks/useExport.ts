'use client'

import { useState, useCallback } from 'react'
import { ExportOptions, ExportFormat, convertToCSV, downloadFile, formatExportFilename } from '@/lib/export'

interface ExportProgress {
  status: 'idle' | 'preparing' | 'downloading' | 'complete' | 'error'
  progress: number
  message: string
}

export function useExport() {
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    status: 'idle',
    progress: 0,
    message: '',
  })

  const exportData = useCallback(async (options: ExportOptions) => {
    setExportProgress({ status: 'preparing', progress: 10, message: 'Preparing export...' })

    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      })

      setExportProgress({ status: 'downloading', progress: 50, message: 'Processing data...' })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setExportProgress({ status: 'downloading', progress: 80, message: 'Creating file...' })

      let content: string
      let mimeType: string

      if (options.format === 'csv') {
        // Flatten data for CSV
        const flatData = flattenExportData(data)
        content = convertToCSV(flatData)
        mimeType = 'text/csv'
      } else {
        content = JSON.stringify(data, null, 2)
        mimeType = 'application/json'
      }

      const filename = formatExportFilename(data.userId || 'user', options.format)
      downloadFile(content, filename, mimeType)

      setExportProgress({ status: 'complete', progress: 100, message: 'Export complete!' })

      setTimeout(() => {
        setExportProgress({ status: 'idle', progress: 0, message: '' })
      }, 3000)

    } catch (error) {
      setExportProgress({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Export failed',
      })
    }
  }, [])

  return { exportData, exportProgress }
}

function flattenExportData(data: Record<string, unknown>): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = []

  // Flatten games
  if (data.games && Array.isArray(data.games)) {
    data.games.forEach((game: Record<string, unknown>) => {
      rows.push({ type: 'game', ...game })
    })
  }

  // Flatten achievements
  if (data.achievements && Array.isArray(data.achievements)) {
    data.achievements.forEach((ach: Record<string, unknown>) => {
      rows.push({ type: 'achievement', ...ach })
    })
  }

  // Flatten transactions
  if (data.transactions && Array.isArray(data.transactions)) {
    data.transactions.forEach((tx: Record<string, unknown>) => {
      rows.push({ type: 'transaction', ...tx })
    })
  }

  return rows
}
