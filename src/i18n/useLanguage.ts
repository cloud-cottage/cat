import { useState } from 'react'
import { locales, type Locale, type Translations } from './locales'

const DEFAULT_LOCALE: Locale = 'zh-CN'

const getInitialLocale = (): Locale => {
  const savedLocale = localStorage.getItem('locale') as Locale | null
  if (savedLocale && locales[savedLocale]) {
    return savedLocale
  }

  const browserLang = navigator.language
  if (browserLang.startsWith('zh')) {
    if (browserLang.includes('TW') || browserLang.includes('HK') || browserLang.includes('MO')) {
      return 'zh-TW'
    }
    return 'zh-CN'
  }

  if (browserLang.startsWith('vi')) {
    return 'vi'
  }

  return 'en'
}

export const useLanguage = () => {
  const [locale, setLocale] = useState<Locale>(getInitialLocale)
  
  const changeLanguage = (newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem('locale', newLocale)
  }
  
  const t = (key: keyof Translations): string => {
    return locales[locale][key] || locales[DEFAULT_LOCALE][key] || key
  }
  
  return {
    locale,
    setLocale: changeLanguage,
    t,
    availableLocales: Object.keys(locales) as Locale[]
  }
}
