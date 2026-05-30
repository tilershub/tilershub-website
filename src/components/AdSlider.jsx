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
    type: 'bathroom',
    tiles: ['#F5F3F0', '#D4AF37', '#E8E5E0', '#C9952A', '#F0EDE8', '#B8870A'],
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
    type: 'floor',
    tiles: ['#C9A07A', '#B88C68', '#D4B490', '#A07858', '#E0C8A8', '#8A6848'],
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
    type: 'staircase',
    tiles: ['#8AB8D4', '#5A90B8', '#A0C8E0', '#3878A8', '#C0D8F0', '#2060A0'],
  },
]

function BathroomScene({ tiles, accent }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden' }}>
      {/* Wall tile grid */}
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
      {/* Niche overlay */}
      <div style={{
        position: 'absolute',
        top: '18%', left: '22%', right: '6%', bottom: '18%',
        background: 'rgba(0,0,0,0.55)',
        borderRadius: 6,
        border: `2px solid ${accent}50`,
        boxShadow: 'inset 0 0 24px rgba(0,0,0,0.6)',
      }}>
        <div style={{ position: 'absolute', top: '33%', left: 8, right: 8, height: 1, background: `${accent}45` }} />
        <div style={{ position: 'absolute', top: '66%', left: 8, right: 8, height: 1, background: `${accent}45` }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: accent, opacity: 0.45, borderRadius: '0 0 4px 4px' }} />
        {[33, 66].map(pct => (
          <div key={pct} style={{ position: 'absolute', top: `calc(${pct}% - 7px)`, left: 12, display: 'flex', gap: 6 }}>
            {[0, 1, 2].map(j => (
              <div key={j} style={{ width: 8, height: 8, borderRadius: '50%', background: `${accent}28`, border: `1px solid ${accent}50` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function FloorScene({ tiles, accent }) {
  const rowOffsets = [false, true, false, true]
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 4 }}>
        {rowOffsets.map((offset, ri) => (
          <div key={ri} style={{ flex: 1, display: 'flex', gap: 4, marginLeft: offset ? '14%' : 0 }}>
            {Array.from({ length: 5 }).map((_, ci) => {
              const ti = (ri * 4 + ci) % tiles.length
              return (
                <div key={ci} style={{
                  flex: '0 0 calc(27% - 3px)',
                  minWidth: 0,
                  background: `linear-gradient(${offset ? '125deg' : '145deg'}, ${tiles[ti]}, ${tiles[(ti + 1) % tiles.length]})`,
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, transparent 55%)' }} />
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.28) 100%)', pointerEvents: 'none', borderRadius: 12 }} />
    </div>
  )
}

function StaircaseScene({ tiles, accent }) {
  const steps = [
    { w: '38%', ti: 0 },
    { w: '57%', ti: 1 },
    { w: '76%', ti: 2 },
    { w: '95%', ti: 3 },
  ]
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end', paddingBottom: 6 }}>
      {steps.map((s, i) => (
        <div key={i} style={{
          width: s.w,
          height: '21%',
          marginBottom: 5,
          background: `linear-gradient(135deg, ${tiles[s.ti]}, ${tiles[(s.ti + 2) % tiles.length]})`,
          borderRadius: '5px 5px 0 0',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 -4px 14px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: accent, opacity: 0.55 }} />
          {[33, 66].map(p => (
            <div key={p} style={{ position: 'absolute', top: 0, bottom: 0, left: `${p}%`, width: 1, background: 'rgba(0,0,0,0.15)' }} />
          ))}
        </div>
      ))}
    </div>
  )
}

function AdVisual({ ad }) {
  if (ad.type === 'bathroom') return <BathroomScene tiles={ad.tiles} accent={ad.accent} />
  if (ad.type === 'floor') return <FloorScene tiles={ad.tiles} accent={ad.accent} />
  if (ad.type === 'staircase') return <StaircaseScene tiles={ad.tiles} accent={ad.accent} />
  return null
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
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 1, marginBottom: 6 }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: ad.accent }}>{ad.brandGold}</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 400, color: 'rgba(255,255,255,0.85)' }}>{ad.brandPlain}</span>
            </div>
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

        {/* Right: scene illustration */}
        <div className="ad-mosaic" style={{ flex: '0 0 36%', padding: '28px 28px 28px 0', display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '100%', height: 160 }}>
            <AdVisual ad={ad} />
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
