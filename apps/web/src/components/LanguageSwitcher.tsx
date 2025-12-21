'use client'

import { useState } from 'react'
import { useLocale } from '@/hooks/useLocale'
import { locales, localeNames, Locale } from '@/lib/i18n'

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm"
      >
        <span>🌐</span>
        <span>{localeNames[locale]}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 py-2 w-40 bg-gray-800 rounded-lg shadow-xl z-50">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => {
                setLocale(loc)
                setIsOpen(false)
              }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-700 ${
                locale === loc ? 'text-emerald-400' : 'text-white'
              }`}
            >
              {localeNames[loc]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
