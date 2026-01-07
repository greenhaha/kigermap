'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Locale, locales, defaultLocale, getBrowserLocale, t as translate, localeNames } from '@/lib/i18n'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

const LOCALE_STORAGE_KEY = 'kigurumi-map-locale'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // 优先使用本地存储的语言设置
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null
    if (stored && locales.includes(stored)) {
      setLocaleState(stored)
    } else {
      // 否则使用浏览器语言
      setLocaleState(getBrowserLocale())
    }
    setMounted(true)
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
  }

  const t = (key: string) => translate(key, locale)

  // 避免 hydration 不匹配
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}

// 语言切换组件
export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white outline-none cursor-pointer hover:bg-white/20 transition"
    >
      {locales.map((l) => (
        <option key={l} value={l} className="bg-dark text-white">
          {localeNames[l]}
        </option>
      ))}
    </select>
  )
}
