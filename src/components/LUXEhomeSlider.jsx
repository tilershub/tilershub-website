import { useState, useEffect, useRef } from 'react'

const CARDS = [
  {
    tag: 'Signature Collection',
    title: 'LUXEhome',
    subtitle: 'Premium Tiles · Sri Lanka',
    desc: '500+ luxury designs for floors, walls & bathrooms. Free islandwide delivery on orders above Rs. 50,000.',
    cta: 'Explore Collection →',
    bg: 'linear-gradient(135deg, #1a1209 0%, #2d1e08 60%, #1a1209 100%)',
    accent: '#D4AF37',
    glow: 'rgba(212,175,55,0.12)',
  },
  {
    tag: 'Marble Series',
    title: 'Italian Marble',
    subtitle: 'Carrara · Calacatta · Statuario',
    desc: 'Authentic Italian marble finishes at local prices. Transform living rooms and entrances into art.',
    cta: 'View Marble →',
    bg: 'linear-gradient(135deg, #181818 0%, #242424 60%, #181818 100%)',
    accent: '#C8C0B0',
    glow: 'rgba(200,192,176,0.08)',
  },
  {
    tag: 'Bathroom Collection',
    title: 'Bath Luxury',
    subtitle: 'Wall + Floor Complete Sets',
    desc: 'Anti-slip certified. Waterproof grout included. Full bathroom tile packages from Rs. 45,000.',
    cta: 'See Packages →',
    bg: 'linear-gradient(135deg, #08171d 0%, #0f2630 60%, #08171d 100%)',
    accent: '#5BC4D8',
    glow: 'rgba(91,196,216,0.10)',
  },
  {
    tag: 'Floor Collection',
    title: 'Large Format',
    subtitle: '60×60 · 80×80 · 120×60 cm',
    desc: 'Seamless modern interiors with premium large-format floor tiles. Rectified edges for zero-grout look.',
    cta: 'Order Now →',
    bg: 'linear-gradient(135deg, #1c1009 0%, #2c1a0e 60%, #1c1009 100%)',
    accent: '#C1603A',
    glow: 'rgba(193,96,58,0.12)',
  },
  {
    tag: 'Free Offer',
    title: 'Design Session',
    subtitle: '3D Layout Planning — Complimentary',
    desc: 'Book a free in-home tile consultation with our design team. Bring your vision, we handle the rest.',
    cta: 'Book Free →',
    bg: 'linear-gradient(135deg, #0c170c 0%, #152515 60%, #0c170c 100%)',
    accent: '#7EAE82',
    glow: 'rgba(126,174,130,0.10)',
  },
]

const CARD_W = 288
const GAP    = 16
const STEP   = CARD_W + GAP

export default function LUXEhomeSlider() {
  const trackRef = useRef(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      const el = trackRef.current
      if (!el) return
      const maxScroll = el.scrollWidth - el.clientWidth
      if (el.scrollLeft >= maxScroll - 8) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: STEP, behavior: 'smooth' })
      }
    }, 3800)
    return () => clearInterval(id)
  }, [paused])

  const scroll = (dir) => {
    trackRef.current?.scrollBy({ left: dir * STEP, behavior: 'smooth' })
  }

  return (
    <section style={{ background: '#0c0804', padding: '60px 0', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle gold grid texture */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.025,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(212,175,55,0.8) 39px, rgba(212,175,55,0.8) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(212,175,55,0.8) 39px, rgba(212,175,55,0.8) 40px)',
        pointerEvents: 'none',
      }} />

      {/* Section header */}
      <div style={{ padding: '0 24px', marginBottom: 32 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(212,175,55,0.6)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>
              ◆ Sponsored Partner
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 6 }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: '#D4AF37', letterSpacing: -0.5 }}>LUXE</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 400, color: 'rgba(255,255,255,0.85)', letterSpacing: -0.5 }}>home</span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', letterSpacing: 0.5 }}>
              Sri Lanka's Premium Tile Experience
            </div>
          </div>

          {/* Nav arrows */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => scroll(-1)}
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)',
                color: '#D4AF37', fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              aria-label="Previous"
            >‹</button>
            <button
              onClick={() => scroll(1)}
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)',
                color: '#D4AF37', fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              aria-label="Next"
            >›</button>
          </div>
        </div>
      </div>

      {/* Cards track */}
      <div
        ref={trackRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{
          display: 'flex',
          gap: GAP,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingLeft: 24,
          paddingRight: 24,
          paddingBottom: 4,
        }}
        className="luxe-track"
      >
        {CARDS.map((card, i) => (
          <div
            key={i}
            style={{
              minWidth: CARD_W, maxWidth: CARD_W,
              flexShrink: 0,
              scrollSnapAlign: 'start',
              background: card.bg,
              borderRadius: 18,
              padding: '28px 24px 24px',
              border: `1px solid ${card.accent}20`,
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            {/* Glow orb */}
            <div style={{
              position: 'absolute', top: -30, right: -30,
              width: 140, height: 140, borderRadius: '50%',
              background: card.glow,
              filter: 'blur(20px)',
              pointerEvents: 'none',
            }} />

            {/* Bottom corner accent line */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: 2,
              background: `linear-gradient(90deg, ${card.accent}00, ${card.accent}60, ${card.accent}00)`,
            }} />

            {/* Tag */}
            <div style={{
              display: 'inline-block',
              fontSize: 9, fontWeight: 700, color: card.accent,
              textTransform: 'uppercase', letterSpacing: 1.5,
              background: `${card.accent}15`,
              border: `1px solid ${card.accent}30`,
              padding: '3px 10px', borderRadius: 20,
              marginBottom: 18,
            }}>
              {card.tag}
            </div>

            {/* Title */}
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 24, fontWeight: 700,
              color: 'rgba(255,255,255,0.95)',
              lineHeight: 1.15, marginBottom: 6,
              position: 'relative',
            }}>
              {i === 0
                ? <><span style={{ color: '#D4AF37' }}>LUXE</span>home</>
                : card.title
              }
            </div>

            {/* Subtitle */}
            <div style={{
              fontSize: 11, fontWeight: 600,
              color: card.accent, letterSpacing: 0.3,
              marginBottom: 14,
            }}>
              {card.subtitle}
            </div>

            {/* Description */}
            <p style={{
              fontSize: 12, color: 'rgba(255,255,255,0.38)',
              lineHeight: 1.75, margin: '0 0 22px',
            }}>
              {card.desc}
            </p>

            {/* CTA */}
            <button style={{
              background: card.accent,
              color: i === 1 ? '#1a1a1a' : 'rgba(0,0,0,0.85)',
              border: 'none', borderRadius: 9,
              padding: '10px 18px',
              fontSize: 11, fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'Noto Sans Sinhala', sans-serif",
              letterSpacing: 0.3,
              transition: 'opacity 0.2s',
            }}>
              {card.cta}
            </button>
          </div>
        ))}

        {/* Trailing spacer so last card scrolls fully into view */}
        <div style={{ minWidth: 8, flexShrink: 0 }} />
      </div>
    </section>
  )
}
