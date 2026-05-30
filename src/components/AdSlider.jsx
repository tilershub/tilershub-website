import { useState, useEffect, useCallback } from 'react'

const ADS = [
  {
    href: '/sponsor/luxehome',
    eyebrow: '◆ Sponsored Partner',
    brandGold: 'LUXE',
    brandPlain: 'home',
    headline: 'Bathroom Renovation',
    subline: 'Complete wall & floor tile packages. Anti-slip certified · Free islandwide delivery above Rs. 50,000.',
    cta: 'Explore Packages →',
    bg: 'linear-gradient(135deg, #140d04 0%, #241508 60%, #140d04 100%)',
    accent: '#D4AF37',
    glow: 'rgba(212,175,55,0.18)',
    tiles: ['#D4AF37', '#C9952A', '#F0D070', '#B8870A', '#E8C860', '#A07010'],
  },
  {
    href: '/sponsor/luxehome-floor',
    eyebrow: '◆ Sponsored Partner',
    brandGold: 'LUXE',
    brandPlain: 'home',
    headline: 'Floor Tiling',
    subline: 'Large format, herringbone & classic floor tiles. Rectified edges for a seamless minimal finish.',
    cta: 'View Floor Tiles →',
    bg: 'linear-gradient(135deg, #1c1009 0%, #2c1a0e 60%, #1c1009 100%)',
    accent: '#C1603A',
    glow: 'rgba(193,96,58,0.18)',
    tiles: ['#C1603A', '#D4784A', '#E09070', '#B05028', '#F0A880', '#903020'],
  },
  {
    href: '/sponsor/luxehome-staircase',
    eyebrow: '◆ Sponsored Partner',
    brandGold: 'LUXE',
    brandPlain: 'home',
    headline: 'Staircase Tiling',
    subline: 'Anti-slip tread tiles and premium matching risers for a stunning safe staircase.',
    cta: 'View Staircase →',
    bg: 'linear-gradient(135deg, #0d1218 0%, #182030 60%, #0d1218 100%)',
    accent: '#8AB8D4',
    glow: 'rgba(138,184,212,0.18)',
    tiles: ['#8AB8D4', '#5A90B8', '#A0C8E0', '#3878A8', '#C0D8F0', '#2060A0'],
  },
  {
    href: '#',
    eyebrow: '◆ Sponsored Partner',
    brandGold: null,
    brandPlain: 'Lanka Tile',
    headline: '500+ Premium Designs',
    subline: 'ශ්‍රී ලංකාවේ #1 ටයිල් නිෂ්පාදකයා · ශාඛා 20+ · Showrooms islandwide · Free delivery.',
    cta: 'View Collection →',
    bg: 'linear-gradient(135deg, #180a04 0%, #2c1408 60%, #180a04 100%)',
    accent: '#C1603A',
    glow: 'rgba(193,96,58,0.18)',
    tiles: ['#C1603A', '#D4784A', '#E09070', '#B05028', '#F0A880', '#903020'],
  },
  {
    href: '#',
    eyebrow: '◆ Sponsored Partner',
    brandGold: null,
    brandPlain: 'Rocell',
    headline: 'Italian & Local Premium Tiles',
    subline: 'Premium tile collections · දිවයිනේ ශාඛා 30+ · ගෙදරට Sample · Contemporary designs.',
    cta: 'See Designs →',
    bg: 'linear-gradient(135deg, #080c18 0%, #101828 60%, #080c18 100%)',
    accent: '#7AB0D8',
    glow: 'rgba(122,176,216,0.18)',
    tiles: ['#7AB0D8', '#5090C0', '#90C8E8', '#3878A8', '#A8D8F0', '#2060A0'],
  },
  {
    href: '#',
    eyebrow: '◆ Sponsored Partner',
    brandGold: null,
    brandPlain: 'BuildMate LK',
    headline: 'Grout · Adhesive · Waterproofing',
    subline: 'Everything you need for a perfect tile installation. Online order · Fast island delivery.',
    cta: 'Shop Now →',
    bg: 'linear-gradient(135deg, #0c1408 0%, #182010 60%, #0c1408 100%)',
    accent: '#7EAE82',
    glow: 'rgba(126,174,130,0.18)',
    tiles: ['#7EAE82', '#5A9460', '#9EC8A0', '#4A8450', '#B0D8B0', '#3A7448'],
  },
]

function TileMini({ tiles }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: 8, width: '100%', height: '100%' }}>
      {tiles.map((c, i) => (
        <div key={i} style={{
          background: `linear-gradient(135deg, ${c}, ${tiles[(i + 2) % tiles.length]})`,
          borderRadius: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 55%)' }} />
        </div>
      ))}
    </div>
  )
}

export default function AdSlider() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setCurrent(c => (c + 1) % ADS.length), [])
  const prev = useCallback(() => setCurrent(c => (c - 1 + ADS.length) % ADS.length), [])

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, 4500)
    return () => clearInterval(id)
  }, [paused, next])

  const ad = ADS[current]

  return (
    <div
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        background: ad.bg,
        transition: 'background 0.5s ease',
        position: 'relative',
        boxShadow: '0 12px 48px rgba(0,0,0,0.35)',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Glow */}
      <div style={{ position: 'absolute', top: -60, left: -60, width: 280, height: 280, borderRadius: '50%', background: ad.glow, filter: 'blur(50px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -40, right: 80, width: 200, height: 200, borderRadius: '50%', background: ad.glow, filter: 'blur(40px)', opacity: 0.5, pointerEvents: 'none' }} />

      {/* Main content row */}
      <div style={{ display: 'flex', minHeight: 220, position: 'relative' }}>

        {/* Left: text */}
        <div style={{ flex: '1 1 60%', padding: '36px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: `${ad.accent}90`, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
            {ad.eyebrow}
          </div>

          <div style={{ marginBottom: 10 }}>
            {ad.brandGold ? (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 1, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: ad.accent }}>{ad.brandGold}</span>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 400, color: 'rgba(255,255,255,0.85)' }}>{ad.brandPlain}</span>
              </div>
            ) : (
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>{ad.brandPlain}</div>
            )}
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(20px, 2.5vw, 30px)', fontWeight: 700, color: ad.accent, lineHeight: 1.15 }}>
              {ad.headline}
            </div>
          </div>

          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, marginBottom: 28, maxWidth: 360 }}>
            {ad.subline}
          </p>

          <a
            href={ad.href}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: ad.accent, color: '#0c0804',
              borderRadius: 10, padding: '11px 22px',
              fontSize: 12, fontWeight: 800, letterSpacing: 0.4,
              textDecoration: 'none',
              boxShadow: `0 4px 18px ${ad.glow}`,
              alignSelf: 'flex-start',
              transition: 'opacity 0.2s',
            }}
          >
            {ad.cta}
          </a>
        </div>

        {/* Right: tile mosaic (hidden on mobile via CSS class) */}
        <div className="ad-mosaic" style={{ flex: '0 0 36%', padding: '32px 32px 32px 0', display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '100%', height: 156 }}>
            <TileMini tiles={ad.tiles} />
          </div>
        </div>
      </div>

      {/* Bottom bar: dots + arrows */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px 22px' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {ADS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? 26 : 6,
                height: 6,
                borderRadius: 3,
                background: i === current ? ad.accent : 'rgba(255,255,255,0.18)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.35s ease',
              }}
              aria-label={`Ad ${i + 1}`}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={prev}
            style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.55)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
            aria-label="Previous"
          >‹</button>
          <button
            onClick={next}
            style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.55)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
            aria-label="Next"
          >›</button>
        </div>
      </div>
    </div>
  )
}
