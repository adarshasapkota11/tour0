import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { toNepaliNumerals } from 'nepali-date-utils'

import { en } from './en'
import { ne } from './ne'

const STORAGE_KEY = 'nt_lang'
const dictionaries = { en, ne }

function getInitialLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'ne') return stored
  } catch {
    // ignore
  }
  return navigator.language?.toLowerCase().startsWith('ne') ? 'ne' : 'en'
}

const noop = () => {}

function fallbackT(key, params) {
  let str = en[key] ?? key
  if (params) {
    str = str.replace(/\{(\w+)\}/g, (_, k) =>
      params[k] !== undefined ? String(params[k]) : `{${k}}`,
    )
  }
  return str
}

const defaultContext = { lang: 'en', setLang: noop, t: fallbackT, isNepali: false }

const I18nContext = createContext(defaultContext)

// oxlint-disable-next-line react/only-export-components
export function I18nProvider({ children }) {
  const [lang, setLang] = useState(getInitialLang)
  const dict = dictionaries[lang] || en

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // ignore
    }
    document.documentElement.lang = lang
  }, [lang])

  const t = useCallback(
    (key, params) => {
      let str = dict[key] ?? en[key] ?? key
      if (params) {
        str = str.replace(/\{(\w+)\}/g, (_, k) =>
          params[k] !== undefined ? String(params[k]) : `{${k}}`,
        )
      }
      return lang === 'ne' ? toNepaliNumerals(str) : str
    },
    [dict, lang],
  )

  const value = useMemo(
    () => ({ lang, setLang, t, isNepali: lang === 'ne' }),
    [lang, setLang, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useI18n() {
  return useContext(I18nContext)
}
