'use client'

import { useState } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { themes, Theme } from '@/lib/theme'

const themeIcons: Record<Theme, string> = {
  dark: '🌙',
  light: '☀️',
  system: '💻',
}

const themeLabels: Record<Theme, string> = {
  dark: 'Dark Mode',
  light: 'Light Mode',
  system: 'System Default',
}

export function ThemeSelect() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{themeIcons[theme]}</span>
          <span>{themeLabels[theme]}</span>
        </div>
        <span className="text-gray-400">▼</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 py-2 bg-gray-800 rounded-lg shadow-xl z-50">
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTheme(t)
                setIsOpen(false)
              }}
              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700 ${
                theme === t ? 'text-emerald-400' : 'text-white'
              }`}
            >
              <span className="text-xl">{themeIcons[t]}</span>
              <span>{themeLabels[t]}</span>
              {theme === t && <span className="ml-auto">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
