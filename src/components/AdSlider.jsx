import { useState, useEffect } from 'react'

const ADS = [
  {
    tag: 'ප්‍රවර්ධකය',
    icon: '🏪',
    brand: 'Lanka Tile',
    line1: 'ශ්‍රී ලංකාවේ #1 ටයිල් නිෂ්පාදකයා — 500+ ශෛලි',
    line2: 'ප්‍රධාන ෂෝ රූම් 20+ · නොමිලේ delivery',
    cta: 'බලන්න →',
    accent: '#c1603a',
  },
  {
    tag: 'විශේෂ දීමනාව',
    icon: '💎',
    brand: 'Rocell',
    line1: 'Premium Italian & Local Tile Designs',
    line2: 'දිවයිනේ ශාඛා 30+ · ගෙදරට Sample',
    cta: 'සොයා ගන්න →',
    accent: '#c9a84c',
  },
  {
    tag: 'ද්‍රව්‍ය',
    icon: '🧱',
    brand: 'BuildMate LK',
    line1: 'Grout · Adhesive · Waterproofing — Online Order',
    line2: 'ටයිලර්වරුනට සහ ගෘහ හිමිකරුවනට හිතකර මිල',
    cta: 'ඇණවුම් →',
    accent: '#7a9a7e',
  },
  {
    tag: 'නිර්මාණ',
    icon: '🎨',
    brand: 'Design Studio LK',
    line1: 'නිදහස් ටයිල් layout design · 3D Preview',
    line2: 'ඔබේ නිවස ගැන සිහිනය සැලසුම් කරන්න',
    cta: 'සම්බන්ධ →',
    accent: '#a0826d',
  },
]

export default function AdSlider() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setCurrent(c => (c + 1) % ADS.length), 4500)
    return () => clearInterval(id)
  }, [paused])

  return (
    <div
      style={{ maxWidth: 660, margin: '0 auto' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div style={{ overflow: 'hidden', borderRadius: 14 }}>
        <div style={{
          display: 'flex',
          transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: `translateX(-${current * 100}%)`,
        }}>
          {ADS.map(ad => (
            <div
              key={ad.brand}
              style={{
                minWidth: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderLeft: `4px solid ${ad.accent}`,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div style={{
                width: 42, height: 42, flexShrink: 0,
                background: `${ad.accent}20`,
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>
                {ad.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)' }}>{ad.brand}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, color: ad.accent,
                    background: `${ad.accent}22`, padding: '2px 8px',
                    borderRadius: 10, textTransform: 'uppercase', letterSpacing: 1,
                  }}>
                    {ad.tag}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.65)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                  {ad.line1}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.32)', marginTop: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                  {ad.line2}
                </div>
              </div>

              <button style={{
                flexShrink: 0,
                background: `${ad.accent}20`,
                border: `1px solid ${ad.accent}55`,
                color: ad.accent,
                borderRadius: 8,
                padding: '8px 13px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Noto Sans Sinhala', sans-serif",
                whiteSpace: 'nowrap',
                transition: 'background 0.2s',
              }}>
                {ad.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12, alignItems: 'center' }}>
        {ADS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? 22 : 6,
              height: 6,
              borderRadius: 3,
              background: i === current ? 'var(--terracotta)' : 'rgba(255,255,255,0.2)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
