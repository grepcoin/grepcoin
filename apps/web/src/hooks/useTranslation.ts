'use client'

import { useCallback } from 'react'
import { useLocale } from './useLocale'
import type { Translations } from '@/lib/i18n'

type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string
      ? T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : K
      : never
    }[keyof T]
  : never

export function useTranslation() {
  const { locale, translations } = useLocale()

  const t = useCallback((key: string): string => {
    const keys = key.split('.')
    let value: unknown = translations

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k]
      } else {
        return key // Return key if translation not found
      }
    }

    return typeof value === 'string' ? value : key
  }, [translations])

  return { t, locale }
}
