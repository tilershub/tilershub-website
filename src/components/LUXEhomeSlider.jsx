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
    glow: 'rgba(212,175,55,0.18)',
  },
  {
    tag: 'Marble Series',
    title: 'Italian Marble',
    subtitle: 'Carrara · Calacatta · Statuario',
    desc: 'Authentic Italian marble finishes at local prices. Transform living rooms and entrances into art.',
    cta: 'View Marble →',
    bg: 'linear-gradient(135deg, #181818 0%, #282828 60%, #181818 100%)',
    accent: '#C8C0B0',
    glow: 'rgba(200,192,176,0.14)',
  },
  {
    tag: 'Bathroom Collection',
    title: 'Bath Luxury',
    subtitle: 'Wall + Floor Complete Sets',
    desc: 'Anti-slip certified. Waterproof grout included. Full bathroom tile packages from Rs. 45,000.',
    cta: 'See Packages →',
    bg: 'linear-gradient(135deg, #08171d 0%, #0f2630 60%, #08171d 100%)',
    accent: '#5BC4D8',
    glow: 'rgba(91,196,216,0.16)',
  },
  {
    tag: 'Floor Collection',
    title: 'Large Format',
    subtitle: '60×60 · 80×80 · 120×60 cm',
    desc: 'Seamless modern interiors with premium large-format floor tiles. Rectified edges for zero-grout look.',
    cta: 'Order Now →',
    bg: 'linear-gradient(135deg, #1c1009 0%, #2c1a0e 60%, #1c1009 100%)',
    accent: '#C1603A',
    glow: 'rgba(193,96,58,0.18)',
  },
  {
    tag: 'Free Offer',
    title: 'Design Session',
    subtitle: '3D Layout Planning — Complimentary',
    desc: 'Book a free in-home tile consultation with our design team. Bring your vision, we handle the rest.',
    cta: 'Book Free →',
    bg: 'linear-gradient(135deg, #0c170c 0%, #152515 60%, #0c170c 100%)',
    accent: '#7EAE82',
    glow: 'rgba(126,174,130,0.16)',
  },
]

const CARD_W = 380
const GAP    = 20
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
    <section style={{ background: '#0c0804', padding: '72px 0 80px', position: 'relative', overflow: 'hidden' }}>
      {/* Gold grid texture */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(212,175,55,0.8) 39px, rgba(212,175,55,0.8) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(212,175,55,0.8) 39px, rgba(212,175,55,0.8) 40px)',
        pointerEvents: 'none',
      }} />

      {/* Section header */}
      <div style={{ padding: '0 32px', marginBottom: 40 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(212,175,55,0.65)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
              ◆ Sponsored Partner
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 8 }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 700, color: '#D4AF37', letterSpacing: -0.5 }}>LUXE</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 400, color: 'rgba(255,255,255,0.9)', letterSpacing: -0.5 }}>home</span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.5 }}>
              Sri Lanka's Premium Tile Experience
            </div>
          </div>

          {/* Nav arrows */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={() => scroll(-1)}
              style={{
                width: 46, height: 46, borderRadius: '50%',
                background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)',
                color: '#D4AF37', fontSize: 20, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              aria-label="Previous"
            >‹</button>
            <button
              onClick={() => scroll(1)}
              style={{
                width: 46, height: 46, borderRadius: '50%',
                background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)',
                color: '#D4AF37', fontSize: 20, cursor: 'pointer',
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
          paddingLeft: 32,
          paddingRight: 32,
          paddingBottom: 8,
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
              borderRadius: 22,
              padding: '36px 32px 32px',
              border: `1px solid ${card.accent}28`,
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            {/* Glow orb top-right */}
            <div style={{
              position: 'absolute', top: -40, right: -40,
              width: 200, height: 200, borderRadius: '50%',
              background: card.glow,
              filter: 'blur(32px)',
              pointerEvents: 'none',
            }} />

            {/* Secondary glow bottom-left */}
            <div style={{
              position: 'absolute', bottom: -60, left: -40,
              width: 160, height: 160, borderRadius: '50%',
              background: card.glow,
              filter: 'blur(40px)',
              opacity: 0.5,
              pointerEvents: 'none',
            }} />

            {/* Bottom accent line */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: 3,
              background: `linear-gradient(90deg, ${card.accent}00, ${card.accent}80, ${card.accent}00)`,
            }} />

            {/* Tag */}
            <div style={{
              display: 'inline-block',
              fontSize: 10, fontWeight: 700, color: card.accent,
              textTransform: 'uppercase', letterSpacing: 1.5,
              background: `${card.accent}18`,
              border: `1px solid ${card.accent}35`,
              padding: '4px 12px', borderRadius: 20,
              marginBottom: 22,
            }}>
              {card.tag}
            </div>

            {/* Title */}
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 32, fontWeight: 700,
              color: 'rgba(255,255,255,0.96)',
              lineHeight: 1.15, marginBottom: 8,
              position: 'relative',
            }}>
              {i === 0
                ? <><span style={{ color: '#D4AF37' }}>LUXE</span>home</>
                : card.title
              }
            </div>

            {/* Subtitle */}
            <div style={{
              fontSize: 13, fontWeight: 600,
              color: card.accent, letterSpacing: 0.4,
              marginBottom: 18,
              opacity: 0.9,
            }}>
              {card.subtitle}
            </div>

            {/* Divider */}
            <div style={{
              height: 1,
              background: `linear-gradient(90deg, ${card.accent}30, transparent)`,
              marginBottom: 18,
            }} />

            {/* Description */}
            <p style={{
              fontSize: 13, color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.8, margin: '0 0 28px',
            }}>
              {card.desc}
            </p>

            {/* CTA */}
            <button style={{
              background: card.accent,
              color: '#0c0804',
              border: 'none', borderRadius: 10,
              padding: '12px 22px',
              fontSize: 12, fontWeight: 800,
              cursor: 'pointer',
              fontFamily: "'Noto Sans Sinhala', sans-serif",
              letterSpacing: 0.5,
              transition: 'opacity 0.2s',
              boxShadow: `0 4px 20px ${card.glow}`,
            }}>
              {card.cta}
            </button>
          </div>
        ))}

        {/* Trailing spacer */}
        <div style={{ minWidth: 12, flexShrink: 0 }} />
      </div>
    </section>
  )
}
