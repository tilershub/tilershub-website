import { useState, useEffect } from 'react'
import { DISTRICT_INFO } from './locations.js'

// The homeowner's chosen district drives every "near you" section.
// Defaults to Colombo — the biggest market — so nothing is empty on a
// first visit and no permission prompt is ever shown.
export const DEFAULT_DISTRICT = 'Colombo'
const KEY = 'th_district'

export function getDistrict() {
  if (typeof localStorage === 'undefined') return DEFAULT_DISTRICT
  try {
    const saved = localStorage.getItem(KEY)
    return DISTRICT_INFO.some(d => d.name === saved) ? saved : DEFAULT_DISTRICT
  } catch {
    return DEFAULT_DISTRICT
  }
}

export function setDistrict(name) {
  try { localStorage.setItem(KEY, name) } catch {}
  window.dispatchEvent(new CustomEvent('th-district', { detail: name }))
}

// Mirrors useLang: the first client render MUST match what the server sent
// (the default), otherwise React throws away the server HTML. The real
// value is applied after mount.
export function useDistrict() {
  const [district, setLocal] = useState(DEFAULT_DISTRICT)
  useEffect(() => {
    setLocal(getDistrict())
    const onChange = e => setLocal(e.detail || DEFAULT_DISTRICT)
    window.addEventListener('th-district', onChange)
    return () => window.removeEventListener('th-district', onChange)
  }, [])
  return district
}
