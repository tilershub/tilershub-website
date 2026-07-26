import { useState, useEffect } from 'react'

// Reads the language set by Layout.astro (localStorage 'th_lang' → <html data-lang>)
// and re-renders when the header toggle dispatches a 'th-lang' event.
export function useLang() {
  // Must start as 'en' even in the browser: the server rendered 'en', so
  // reading the real language during the first client render would make
  // React's hydration mismatch and throw away the server HTML. The effect
  // below switches to the actual language immediately after mount.
  const [lang, setLang] = useState('en')
  useEffect(() => {
    setLang(document.documentElement.getAttribute('data-lang') || 'en')
    const onChange = e => setLang(e.detail || 'en')
    window.addEventListener('th-lang', onChange)
    return () => window.removeEventListener('th-lang', onChange)
  }, [])
  return lang
}
