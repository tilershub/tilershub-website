import { useState, useEffect } from 'react'

// Reads the language set by Layout.astro (localStorage 'th_lang' → <html data-lang>)
// and re-renders when the header toggle dispatches a 'th-lang' event.
export function useLang() {
  const [lang, setLang] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.getAttribute('data-lang') || 'en'
    }
    return 'en'
  })
  useEffect(() => {
    setLang(document.documentElement.getAttribute('data-lang') || 'en')
    const onChange = e => setLang(e.detail || 'en')
    window.addEventListener('th-lang', onChange)
    return () => window.removeEventListener('th-lang', onChange)
  }, [])
  return lang
}
