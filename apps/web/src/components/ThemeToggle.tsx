'use client'

import { useTheme } from '@/hooks/useTheme'
import { themes, Theme } from '@/lib/theme'

const themeIcons: Record<Theme, string> = {
  dark: '🌙',
  light: '☀️',
  system: '💻',
}

const themeLabels: Record<Theme, string> = {
  dark: 'Dark',
  light: 'Light',
  system: 'System',
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 dark:bg-gray-800 light:bg-gray-200 hover:bg-gray-700 dark:hover:bg-gray-700 light:hover:bg-gray-300 text-sm transition-colors"
      title={`Theme: ${themeLabels[theme]}`}
    >
      <span>{themeIcons[theme]}</span>
      <span className="hidden sm:inline">{themeLabels[theme]}</span>
    </button>
  )
}
