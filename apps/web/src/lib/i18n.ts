export const locales = ['en', 'es', 'zh', 'ja', 'ko'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  zh: '中文',
  ja: '日本語',
  ko: '한국어'
}

// Translation type
export type Translations = typeof import('./translations/en').default
