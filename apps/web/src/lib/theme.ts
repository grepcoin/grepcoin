export type Theme = 'dark' | 'light' | 'system'

export const themes: Theme[] = ['dark', 'light', 'system']

export const themeColors = {
  dark: {
    background: '#0a0a0a',
    foreground: '#fafafa',
    card: '#1a1a1a',
    cardForeground: '#fafafa',
    primary: '#10b981',
    primaryForeground: '#ffffff',
    secondary: '#27272a',
    secondaryForeground: '#fafafa',
    muted: '#27272a',
    mutedForeground: '#a1a1aa',
    border: '#27272a',
  },
  light: {
    background: '#ffffff',
    foreground: '#0a0a0a',
    card: '#f4f4f5',
    cardForeground: '#0a0a0a',
    primary: '#059669',
    primaryForeground: '#ffffff',
    secondary: '#e4e4e7',
    secondaryForeground: '#0a0a0a',
    muted: '#f4f4f5',
    mutedForeground: '#71717a',
    border: '#e4e4e7',
  },
}
