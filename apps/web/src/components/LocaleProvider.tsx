'use client'

import { useState, useEffect, ReactNode } from 'react'
import { LocaleContext } from '@/hooks/useLocale'
import { Locale, defaultLocale } from '@/lib/i18n'
import type { Translations } from '@/lib/i18n'
import en from '@/lib/translations/en'

const translationModules: Record<Locale, () => Promise<{ default: Translations }>> = {
  en: () => Promise.resolve({ default: en }),
  es: () => import('@/lib/translations/es'),
  zh: () => import('@/lib/translations/zh'),
  ja: () => import('@/lib/translations/ja'),
  ko: () => import('@/lib/translations/ko'),
}

interface Props {
  children: ReactNode
}

export function LocaleProvider({ children }: Props) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [translations, setTranslations] = useState<Translations>(en)

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale | null
    if (saved && translationModules[saved]) {
      setLocaleState(saved)
    }
  }, [])

  useEffect(() => {
    translationModules[locale]().then((mod) => {
      setTranslations(mod.default)
    })
  }, [locale])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, translations }}>
      {children}
    </LocaleContext.Provider>
  )
}
