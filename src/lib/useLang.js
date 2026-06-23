import { useState, useEffect } from 'react'

export function useLang() {
  const [lang, setLang] = useState(() =>
    typeof window !== 'undefined'
      ? (document.documentElement.getAttribute('data-lang') || 'en')
      : 'en'
  )
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setLang(document.documentElement.getAttribute('data-lang') || 'en')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] })
    return () => observer.disconnect()
  }, [])
  return lang
}
