export type ExportFormat = 'json' | 'csv'

export interface ExportOptions {
  format: ExportFormat
  includeGames: boolean
  includeAchievements: boolean
  includeTransactions: boolean
  includeActivity: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}

export function convertToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return ''

  const headers = Object.keys(data[0])
  const rows = data.map(row =>
    headers.map(h => {
      const value = row[h]
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`
      }
      return String(value ?? '')
    }).join(',')
  )

  return [headers.join(','), ...rows].join('\n')
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function formatExportFilename(userId: string, format: ExportFormat): string {
  const date = new Date().toISOString().split('T')[0]
  return `grepcoin-export-${userId.slice(0, 8)}-${date}.${format}`
}
