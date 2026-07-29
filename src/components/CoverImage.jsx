import { useState } from 'react'

/**
 * An image that gets out of the way when it 404s.
 *
 * Provider cover URLs point at uploads that can disappear, and a bare <img>
 * then renders the browser's broken-image glyph with the alt text spilled
 * across the card. This swaps in the card's own placeholder instead.
 */
export default function CoverImage({ src, alt, fallback, ...rest }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return fallback
  return <img src={src} alt={alt} onError={() => setFailed(true)} {...rest} />
}
