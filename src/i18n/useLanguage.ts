import { useState, useEffect } from 'react'
import { locales, type Locale, type Translations } from './locales'

const DEFAULT_LOCALE: Locale = 'zh-CN'

export const useLanguage = () => {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE)
  
  useEffect(() => {
    // 从 localStorage 读取保存的语言设置
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && locales[savedLocale]) {
      setLocale(savedLocale)
    } else {
      // 根据浏览器语言自动设置
      const browserLang = navigator.language
      if (browserLang.startsWith('zh')) {
        if (browserLang.includes('TW') || browserLang.includes('HK') || browserLang.includes('MO')) {
          setLocale('zh-TW')
        } else {
          setLocale('zh-CN')
        }
      } else if (browserLang.startsWith('vi')) {
        setLocale('vi')
      } else {
        setLocale('en')
      }
    }
  }, [])
  
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
