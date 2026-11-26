import { useLayoutEffect } from 'react'
import { LanguageContext } from './language.js'

const english = { language: 'en', t: text => text }

export default function LanguageProvider({ children }) {
  useLayoutEffect(() => {
    const previous = document.documentElement.lang
    document.documentElement.lang = 'en'
    return () => { document.documentElement.lang = previous }
  }, [])

  return <LanguageContext.Provider value={english}>{children}</LanguageContext.Provider>
}
