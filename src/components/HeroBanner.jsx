import { useState, useEffect, useCallback, useRef } from 'react'

const DEFAULT_BANNERS = [
  {
    title: 'Find Verified Tilers Near You',
    description: 'Connect with skilled tiling professionals across Sri Lanka via WhatsApp — free service, no middlemen.',
    cta_text: 'Find Tilers Now',
    cta_link: '/providers',
    accent: '#D97706',
    gradient: 'linear-gradient(135deg, #0F766E 0%, #042F2E 100%)',
    icon: '👷',
    pattern: 'tiles',
  },
  {
    title: 'Post Your Tiling Project',
    description: 'Describe your project, set your budget, and get matched with the right professional in your area.',
    cta_text: 'Post a Project',
    cta_link: '/post-project',
    accent: '#F59E0B',
    gradient: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
    icon: '📋',
    pattern: 'grid',
  },
  {
    title: 'Estimate Your Tiling Cost',
    description: 'Calculate material and labour costs before hiring. Plan smart, spend wisely.',
    cta_text: 'Try the Estimator',
    cta_link: '/estimator',
    accent: '#22c55e',
    gradient: 'linear-gradient(135deg, #042F2E 0%, #0F766E 100%)',
    icon: '📐',
    pattern: 'dots',
  },
  {
    title: 'Explore Tile Workshops',
    description: 'Find granite cutting, tile cutting and routering workshops near you. Islandwide coverage.',
    cta_text: 'Find Workshops',
    cta_link: '/providers?type=workshop',
    accent: '#a78bfa',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #1e1b4b 100%)',
    icon: '🏭',
    pattern: 'tiles',
  },
  {
    title: 'Discover Tile Brands in Sri Lanka',
    description: 'Browse premium tile brands, explore collections, and find authorised dealers near you.',
    cta_text: 'Explore Brands',
    cta_link: '/brands',
    accent: '#D4AF37',
    gradient: 'linear-gradient(135deg, #140d04 0%, #241508 60%, #140d04 100%)',
    icon: '🏷️',
    pattern: 'grid',
  },
]

function PatternBg({ pattern, accent }) {
  if (pattern === 'tiles') {
    const cols = 5
    const rows = 3
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gap: 6, width: '100%', height: '100%' }}>
        {Array.from({ length: cols * rows }).map((_, i) => (
          <div key={i} style={{
            borderRadius: 8,
            background: i % 3 === 0
              ? `${accent}22`
              : i % 3 === 1
              ? 'rgba(255,255,255,0.04)'
              : `${accent}10`,
            border: `1px solid ${accent}18`,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {i % 5 === 0 && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)' }} />}
          </div>
        ))}
      </div>
    )
  }
  if (pattern === 'grid') {
    return (
      <div style={{ width: '100%', height: '100%', backgroundImage: `linear-gradient(${accent}15 1px, transparent 1px), linear-gradient(90deg, ${accent}15 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
    )
  }
  // dots
  return (
    <div style={{ width: '100%', height: '100%', backgroundImage: `radial-gradient(circle, ${accent}30 1.5px, transparent 1.5px)`, backgroundSize: '28px 28px' }} />
  )
}

export default function HeroBanner({ banners: propBanners }) {
  const banners = propBanners?.length ? propBanners : DEFAULT_BANNERS
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  const goTo = useCallback((i) => setCurrent((i + banners.length) % banners.length), [banners.length])
  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, 4000)
    return () => clearInterval(id)
  }, [paused, next])

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
    if (Math.abs(dx) > 40 && dy < 60) {
      dx < 0 ? next() : prev()
    }
    touchStartX.current = null
  }

  const b = banners[current]

  return (
    <div
      style={{ position: 'relative', background: b.gradient || 'var(--navy)', overflow: 'hidden', transition: 'background 0.6s ease', minHeight: 320, userSelect: 'none' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Background pattern */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.6, pointerEvents: 'none' }}>
        <PatternBg pattern={b.pattern} accent={b.accent} />
      </div>
      {/* Glow */}
      <div style={{ position: 'absolute', top: -100, right: -80, width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${b.accent}20 0%, transparent 70%)`, pointerEvents: 'none' }} />

      {/* Content */}
      <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', padding: '64px 20px 56px', display: 'flex', alignItems: 'center', gap: 40 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: `${b.accent}cc`, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>
            TILERSHUB.LK
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(26px, 4.5vw, 46px)', fontWeight: 700, color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
            {b.title}
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, maxWidth: 480, marginBottom: 32 }}>
            {b.description}
          </p>
          <a
            href={b.cta_link}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: b.accent, color: '#fff',
              borderRadius: 12, padding: '13px 28px',
              fontSize: 14, fontWeight: 700, textDecoration: 'none',
              boxShadow: `0 4px 20px ${b.accent}44`,
              transition: 'opacity 0.2s, transform 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseOut={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none' }}
          >
            {b.cta_text} →
          </a>
        </div>

        {/* Right icon (hidden on mobile) */}
        <div className="banner-icon-side" style={{ flexShrink: 0, width: 140, height: 140, borderRadius: 32, background: `${b.accent}18`, border: `2px solid ${b.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>
          {b.icon}
        </div>
      </div>

      {/* Dots + arrows */}
      <div style={{ position: 'absolute', bottom: 18, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === current ? 24 : 6,
              height: 6,
              borderRadius: 3,
              background: i === current ? b.accent : 'rgba(255,255,255,0.25)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.3s ease',
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Prev/next arrows */}
      {[{ dir: -1, label: '‹', side: 'left' }, { dir: 1, label: '›', side: 'right' }].map(({ dir, label, side }) => (
        <button
          key={side}
          onClick={() => goTo(current + dir)}
          style={{
            position: 'absolute', top: '50%', [side]: 14,
            transform: 'translateY(-50%)',
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.7)',
            fontSize: 20, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          aria-label={label}
        >
          {label}
        </button>
      ))}

      <style>{`.banner-icon-side { display: flex; } @media (max-width: 600px) { .banner-icon-side { display: none !important; } }`}</style>
    </div>
  )
}
