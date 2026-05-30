import { useState, useEffect, useCallback } from 'react'

const ADS = [
  {
    href: '/sponsor/luxehome',
    eyebrow: '◆ Premium Partner',
    brandGold: 'LUXE',
    brandPlain: 'home',
    tagline: 'Premium Bathroom Construction & Renovation',
    headline: 'Transform Your Bathroom',
    subline: 'Full bathroom renovation from concept to completion — tiling, waterproofing, fixtures & fitting. Free site visit islandwide.',
    cta: 'Get Free Consultation →',
    badge: 'Construction & Renovation',
    bg: 'linear-gradient(135deg, #0b0d14 0%, #141a2e 55%, #0b0d14 100%)',
    accent: '#D4AF37',
    glow: 'rgba(212,175,55,0.20)',
    type: 'bathroom-hero',
    tiles: ['#F5F3F0', '#D4AF37', '#E8E5E0', '#C9952A', '#F0EDE8', '#B8870A'],
  },
  {
    href: '/sponsor/luxehome',
    eyebrow: '◆ Premium Partner',
    brandGold: 'LUXE',
    brandPlain: 'home',
    tagline: 'Premium Bathroom Construction & Renovation',
    headline: 'Luxury Wall & Floor Tiling',
    subline: 'Anti-slip certified premium tiles. Large format, herringbone & bespoke patterns. Seamless grout finish.',
    cta: 'Explore Tile Collections →',
    badge: 'Certified Installers',
    bg: 'linear-gradient(135deg, #140d04 0%, #241508 60%, #140d04 100%)',
    accent: '#D4AF37',
    glow: 'rgba(212,175,55,0.18)',
    type: 'tiles',
    tiles: ['#F5F3F0', '#D4AF37', '#E8E5E0', '#C9952A', '#F0EDE8', '#B8870A'],
  },
  {
    href: '/sponsor/luxehome',
    eyebrow: '◆ Premium Partner',
    brandGold: 'LUXE',
    brandPlain: 'home',
    tagline: 'Premium Bathroom Construction & Renovation',
    headline: 'Waterproofing & Fitting',
    subline: 'Complete bathroom fit-out — waterproofing membrane, shower enclosures, vanities, sanitary ware installation.',
    cta: 'See Our Projects →',
    badge: 'Full Fit-Out Service',
    bg: 'linear-gradient(135deg, #0d1218 0%, #162030 60%, #0d1218 100%)',
    accent: '#D4AF37',
    glow: 'rgba(212,175,55,0.15)',
    type: 'fitting',
    tiles: ['#8AB8D4', '#5A90B8', '#A0C8E0', '#3878A8', '#C0D8F0', '#2060A0'],
  },
]

/* ── Premium Bathroom Hero scene (bathtub + shower + luxury tiles) ── */
function BathroomHeroScene({ tiles, accent }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden', background: '#0a0a0f' }}>

      {/* Back wall — luxury tile grid */}
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: 3 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{
            background: `linear-gradient(135deg, ${tiles[i % tiles.length]}, ${tiles[(i + 2) % tiles.length]})`,
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            opacity: 0.85,
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 50%)' }} />
          </div>
        ))}
      </div>

      {/* Dark overlay for depth */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)' }} />

      {/* Bathtub silhouette */}
      <div style={{
        position: 'absolute',
        bottom: '8%', left: '10%', right: '8%',
        height: '38%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)',
        borderRadius: '50% 50% 12px 12px / 30% 30% 12px 12px',
        border: `1px solid rgba(255,255,255,0.18)`,
        boxShadow: `0 0 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)`,
      }}>
        {/* Water shimmer */}
        <div style={{ position: 'absolute', top: '20%', left: '15%', right: '15%', height: '30%', background: `linear-gradient(90deg, transparent, ${accent}18, transparent)`, borderRadius: 8 }} />
        {/* Tap */}
        <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', width: 16, height: 14, background: `${accent}`, borderRadius: '4px 4px 0 0', opacity: 0.85 }} />
      </div>

      {/* Shower head (top right) */}
      <div style={{ position: 'absolute', top: '8%', right: '12%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <div style={{ width: 2, height: 18, background: `${accent}60` }} />
        <div style={{ width: 22, height: 6, borderRadius: 3, background: `${accent}80`, boxShadow: `0 0 8px ${accent}40` }} />
        {/* Water drops */}
        {[0, 1, 2, 3].map(j => (
          <div key={j} style={{ width: 1.5, height: 6, background: `${accent}50`, marginLeft: j * 5 - 8, marginTop: -3, borderRadius: 1, position: 'absolute', top: 28, left: `${20 + j * 16}%` }} />
        ))}
      </div>

      {/* Gold accent line at bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, opacity: 0.7 }} />

      {/* LUXURY text watermark */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 9, fontWeight: 800, color: `${accent}22`, letterSpacing: 8, whiteSpace: 'nowrap', userSelect: 'none' }}>PREMIUM</div>
    </div>
  )
}

/* ── Tile wall scene ── */
function TileScene({ tiles, accent }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gridTemplateRows: 'repeat(4, 1fr)', gap: 4, width: '100%', height: '100%' }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{
            background: `linear-gradient(135deg, ${tiles[i % tiles.length]}, ${tiles[(i + 2) % tiles.length]})`,
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 55%)' }} />
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', top: '18%', left: '22%', right: '6%', bottom: '18%', background: 'rgba(0,0,0,0.5)', borderRadius: 6, border: `2px solid ${accent}50`, boxShadow: 'inset 0 0 24px rgba(0,0,0,0.5)' }}>
        <div style={{ position: 'absolute', top: '33%', left: 8, right: 8, height: 1, background: `${accent}45` }} />
        <div style={{ position: 'absolute', top: '66%', left: 8, right: 8, height: 1, background: `${accent}45` }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: accent, opacity: 0.5, borderRadius: '0 0 4px 4px' }} />
      </div>
    </div>
  )
}

/* ── Fitting / waterproofing scene ── */
function FittingScene({ tiles, accent }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden', background: '#0d1520' }}>
      {/* Floor grid */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3, padding: 4 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ background: `linear-gradient(135deg, ${tiles[i % tiles.length]}, ${tiles[(i+1)%tiles.length]})`, borderRadius: 3, opacity: 0.9 }}>
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)', borderRadius: 3 }} />
          </div>
        ))}
      </div>
      {/* Shower enclosure lines */}
      <div style={{ position: 'absolute', top: '8%', left: '15%', right: '15%', bottom: '44%', border: `1.5px solid ${accent}55`, borderRadius: 6 }}>
        <div style={{ position: 'absolute', top: '30%', left: 0, right: 0, height: 1, background: `${accent}30` }} />
        <div style={{ position: 'absolute', top: '60%', left: 0, right: 0, height: 1, background: `${accent}30` }} />
        <div style={{ position: 'absolute', top: '10%', right: 8, width: 18, height: 6, borderRadius: 3, background: `${accent}70` }} />
      </div>
      {/* Vanity unit */}
      <div style={{ position: 'absolute', bottom: '44%', left: '60%', right: '5%', height: '16%', background: `rgba(255,255,255,0.07)`, borderRadius: '6px 6px 0 0', border: `1px solid rgba(255,255,255,0.12)` }}>
        <div style={{ position: 'absolute', top: '30%', left: '40%', width: 12, height: 12, borderRadius: '50%', border: `1.5px solid ${accent}80` }} />
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, opacity: 0.6 }} />
    </div>
  )
}

function AdVisual({ ad }) {
  if (ad.type === 'bathroom-hero') return <BathroomHeroScene tiles={ad.tiles} accent={ad.accent} />
  if (ad.type === 'tiles') return <TileScene tiles={ad.tiles} accent={ad.accent} />
  if (ad.type === 'fitting') return <FittingScene tiles={ad.tiles} accent={ad.accent} />
  return null
}

export default function AdSlider() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setCurrent(c => (c + 1) % ADS.length), [])
  const prev = useCallback(() => setCurrent(c => (c - 1 + ADS.length) % ADS.length), [])

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [paused, next])

  const ad = ADS[current]

  return (
    <div
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        background: ad.bg,
        transition: 'background 0.6s ease',
        position: 'relative',
        boxShadow: '0 16px 56px rgba(0,0,0,0.4)',
        border: `1px solid rgba(212,175,55,0.12)`,
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Ambient glow */}
      <div style={{ position: 'absolute', top: -80, left: -80, width: 320, height: 320, borderRadius: '50%', background: ad.glow, filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -40, right: 60, width: 200, height: 200, borderRadius: '50%', background: ad.glow, filter: 'blur(40px)', opacity: 0.5, pointerEvents: 'none' }} />

      {/* Top badge strip */}
      <div style={{ padding: '12px 32px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: `${ad.accent}`, letterSpacing: 3, textTransform: 'uppercase' }}>{ad.eyebrow}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: 1, textTransform: 'uppercase', padding: '2px 8px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20 }}>{ad.badge}</span>
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', minHeight: 210, position: 'relative' }}>

        {/* Left: text */}
        <div style={{ flex: '1 1 58%', padding: '16px 32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>

          {/* Brand name */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 1, marginBottom: 4 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: ad.accent }}>{ad.brandGold}</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 400, color: 'rgba(255,255,255,0.82)' }}>{ad.brandPlain}</span>
          </div>

          {/* Tagline */}
          <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.38)', letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase' }}>
            {ad.tagline}
          </div>

          {/* Headline */}
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(18px, 2.2vw, 26px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 10 }}>
            {ad.headline}
          </div>

          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.42)', lineHeight: 1.75, marginBottom: 22, maxWidth: 340 }}>
            {ad.subline}
          </p>

          <a
            href={ad.href}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: ad.accent, color: '#0c0804',
              borderRadius: 10, padding: '10px 20px',
              fontSize: 12, fontWeight: 800, letterSpacing: 0.3,
              textDecoration: 'none', alignSelf: 'flex-start',
              boxShadow: `0 4px 20px ${ad.glow}`,
              transition: 'opacity 0.2s, transform 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseOut={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none' }}
          >
            {ad.cta}
          </a>
        </div>

        {/* Right: scene illustration */}
        <div className="ad-mosaic" style={{ flex: '0 0 38%', padding: '20px 24px 20px 0', display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '100%', height: 170, borderRadius: 12, overflow: 'hidden' }}>
            <AdVisual ad={ad} />
          </div>
        </div>
      </div>

      {/* Bottom: dots + arrows */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px 20px' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {ADS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? 28 : 6,
                height: 6,
                borderRadius: 3,
                background: i === current ? ad.accent : 'rgba(255,255,255,0.15)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'all 0.35s ease',
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {[['‹', prev], ['›', next]].map(([label, fn]) => (
            <button
              key={label}
              onClick={fn}
              style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label={label === '‹' ? 'Previous' : 'Next'}
            >{label}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
