'use client'

import { createContext, useContext } from 'react'
import type { Locale, Translations } from '@/lib/i18n'
import en from '@/lib/translations/en'

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  translations: Translations
}

export const LocaleContext = createContext<LocaleContextType>({
  locale: 'en',
  setLocale: () => {},
  translations: en,
})

export function useLocale() {
  return useContext(LocaleContext)
}
