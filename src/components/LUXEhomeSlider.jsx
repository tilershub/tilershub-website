import { useState, useEffect, useCallback } from 'react'

const CARDS = [
  {
    eyebrow: 'Signature Collection',
    title: 'Premium Tiles',
    titleBold: 'For Every Space',
    desc: '500+ luxury designs for floors, walls & bathrooms. Free islandwide delivery above Rs. 50,000.',
    features: [
      { icon: '🎨', label: '500+ Designs' },
      { icon: '🚚', label: 'Free Delivery' },
      { icon: '🛡️', label: '5-Year Warranty' },
      { icon: '📐', label: 'Expert Sizing' },
    ],
    cta: 'Explore Collection →',
    bg: 'linear-gradient(135deg, #fef9f0 0%, #f8eccf 100%)',
    accent: '#C9952A',
    accentLight: '#F5E6C0',
    textDark: '#1a0c00',
    tiles: ['#D4AF37','#C9952A','#F0D878','#A07010','#E8C84A','#B8870A','#EBCA6A','#906008','#F8E090'],
  },
  {
    eyebrow: 'Marble Series',
    title: 'Italian Marble',
    titleBold: 'Carrara · Calacatta',
    desc: 'Authentic Italian marble finishes at local prices. Transform living rooms and entrances into art.',
    features: [
      { icon: '✨', label: 'Polished Finish' },
      { icon: '📏', label: 'Large Format' },
      { icon: '💎', label: 'Premium Grade' },
      { icon: '🏠', label: 'Indoor & Out' },
    ],
    cta: 'View Marble →',
    bg: 'linear-gradient(135deg, #f8f7f5 0%, #eeeae4 100%)',
    accent: '#7A7068',
    accentLight: '#E0DDD6',
    textDark: '#1a1814',
    tiles: ['#F5F3F0','#E0DDD8','#CCCAC4','#D8D5CE','#F0EDE8','#B8B5AE','#E8E5E0','#D0CCC6','#C8C4BC'],
  },
  {
    eyebrow: 'Bathroom Collection',
    title: 'Bath Luxury',
    titleBold: 'Wall + Floor Sets',
    desc: 'Anti-slip certified. Waterproof grout included. Complete bathroom packages from Rs. 45,000.',
    features: [
      { icon: '💧', label: 'Anti-Slip' },
      { icon: '🔒', label: 'Waterproof' },
      { icon: '📦', label: 'Complete Sets' },
      { icon: '🔧', label: 'Install Guide' },
    ],
    cta: 'See Packages →',
    bg: 'linear-gradient(135deg, #e8f6fa 0%, #c8eaf4 100%)',
    accent: '#1A7A96',
    accentLight: '#A8E0F0',
    textDark: '#081820',
    tiles: ['#5BC4D8','#3AAAC0','#7AD8E8','#2090A8','#90D0E0','#1878A0','#60C0D0','#A8E4F0','#48B8CC'],
  },
  {
    eyebrow: 'Floor Collection',
    title: 'Large Format',
    titleBold: '60×60 · 80×80 · 120×60 cm',
    desc: 'Seamless modern interiors. Rectified edges for the perfect zero-grout minimalist look.',
    features: [
      { icon: '📐', label: 'Rectified Edges' },
      { icon: '✦', label: 'Zero Grout' },
      { icon: '🏗️', label: '3 Format Sizes' },
      { icon: '🎯', label: 'Precision Cut' },
    ],
    cta: 'Order Now →',
    bg: 'linear-gradient(135deg, #fdf0e8 0%, #f8d8c0 100%)',
    accent: '#C1603A',
    accentLight: '#F0C0A0',
    textDark: '#1c0800',
    tiles: ['#C1603A','#D4784A','#A84828','#E0906A','#B85030','#F0A880','#903820','#D87050','#E89878'],
  },
  {
    eyebrow: 'Free Offer',
    title: '3D Design Session',
    titleBold: 'Complimentary',
    desc: 'Book a free in-home tile consultation with our design team. 3D layout planning included.',
    features: [
      { icon: '🏠', label: '3D Layout' },
      { icon: '📅', label: 'Flexible Date' },
      { icon: '👨‍🎨', label: 'Expert Team' },
      { icon: '✓', label: '100% Free' },
    ],
    cta: 'Book Free Session →',
    bg: 'linear-gradient(135deg, #eef6ee 0%, #d0ecd0 100%)',
    accent: '#2E7D3A',
    accentLight: '#A8D8A8',
    textDark: '#081408',
    tiles: ['#7EAE82','#5A9460','#9EC8A0','#4A8450','#B8D8B8','#3A7448','#68A06C','#A0C8A4','#58A060'],
  },
]

function TileMosaic({ tiles, accent }) {
  const layout = [
    { col: '1 / 3', row: '1 / 2' },
    { col: '3 / 4', row: '1 / 2' },
    { col: '4 / 5', row: '1 / 3' },
    { col: '1 / 2', row: '2 / 4' },
    { col: '2 / 4', row: '2 / 3' },
    { col: '2 / 3', row: '3 / 4' },
    { col: '3 / 5', row: '3 / 4' },
  ]
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridTemplateRows: 'repeat(3, 1fr)',
      gap: 8, width: '100%', height: '100%',
    }}>
      {layout.map((pos, i) => (
        <div key={i} style={{
          gridColumn: pos.col, gridRow: pos.row,
          background: `linear-gradient(135deg, ${tiles[i]}, ${tiles[(i + 3) % tiles.length]})`,
          borderRadius: 10,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.4)',
          border: '1px solid rgba(255,255,255,0.5)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)',
          }} />
        </div>
      ))}
    </div>
  )
}

export default function LUXEhomeSlider() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setCurrent(c => (c + 1) % CARDS.length), [])
  const prev = useCallback(() => setCurrent(c => (c - 1 + CARDS.length) % CARDS.length), [])

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, 4200)
    return () => clearInterval(id)
  }, [paused, next])

  const card = CARDS[current]

  return (
    <section style={{ background: 'var(--cream)', padding: '48px 24px 56px', position: 'relative' }}>
      {/* Sponsor label */}
      <div style={{ maxWidth: 1100, margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#C9952A' }}>LUXE</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 400, color: 'var(--charcoal)' }}>home</span>
          <span style={{ fontSize: 10, color: 'var(--text-light)', marginLeft: 10, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600 }}>· Sponsored</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={prev} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--white)', border: '1.5px solid var(--cream-dark)', color: 'var(--text-dark)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <button onClick={next} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--white)', border: '1.5px solid var(--cream-dark)', color: 'var(--text-dark)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
        </div>
      </div>

      {/* Main card */}
      <div
        style={{ maxWidth: 1100, margin: '0 auto', borderRadius: 24, overflow: 'hidden', background: card.bg, boxShadow: '0 8px 40px rgba(0,0,0,0.10)', transition: 'background 0.5s ease' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div style={{ display: 'flex', minHeight: 380, position: 'relative' }}>

          {/* Left: text content */}
          <div style={{ flex: '0 0 58%', padding: '52px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>

            <div style={{ fontSize: 11, fontWeight: 700, color: card.accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
              Introducing
            </div>

            <div style={{ marginBottom: 6 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px,3.5vw,40px)', fontWeight: 400, color: card.textDark, lineHeight: 1.2 }}>
                {card.title}
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(26px,4vw,48px)', fontWeight: 700, color: card.accent, lineHeight: 1.1 }}>
                {card.titleBold}
              </div>
            </div>

            <p style={{ fontSize: 13, color: card.textDark, opacity: 0.6, lineHeight: 1.8, maxWidth: 420, marginBottom: 32, marginTop: 10 }}>
              {card.desc}
            </p>

            {/* Feature icons */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 36, flexWrap: 'wrap' }}>
              {card.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 64 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: `${card.accent}18`,
                    border: `1.5px solid ${card.accent}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                  }}>
                    {f.icon}
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: card.textDark, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center', lineHeight: 1.3, opacity: 0.75 }}>
                    {f.label}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <button style={{
                background: card.accent, color: '#fff',
                border: 'none', borderRadius: 12,
                padding: '13px 28px',
                fontSize: 13, fontWeight: 700,
                cursor: 'pointer',
                boxShadow: `0 4px 20px ${card.accent}50`,
                letterSpacing: 0.3,
              }}>
                {card.cta}
              </button>
            </div>
          </div>

          {/* Diagonal clip separator */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: '54%', width: 80,
            background: card.bg,
            clipPath: 'polygon(0 0, 0% 100%, 100% 100%)',
            zIndex: 2,
          }} />

          {/* Right: tile mosaic */}
          <div style={{
            flex: '0 0 42%',
            background: `linear-gradient(135deg, ${card.accentLight}50, ${card.accentLight}90)`,
            padding: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: `${card.accent}15`, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: `${card.accent}10`, pointerEvents: 'none' }} />

            <div style={{ width: '100%', maxWidth: 280, height: 240, position: 'relative', zIndex: 1 }}>
              <TileMosaic tiles={card.tiles} accent={card.accent} />
            </div>

            {/* LUXEhome brand watermark */}
            <div style={{
              position: 'absolute', bottom: 20, right: 24,
              display: 'flex', alignItems: 'baseline', gap: 2,
              opacity: 0.35,
            }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, color: card.accent }}>LUXE</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: card.textDark }}>home</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
        {CARDS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? 28 : 8,
              height: 8, borderRadius: 4,
              background: i === current ? card.accent : 'var(--cream-dark)',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all 0.3s ease',
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
