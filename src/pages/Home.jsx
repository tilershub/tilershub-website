import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Footer } from '../components/UI'

const HOW_STEPS = [
  { icon: '🔍', num: '01', title: 'ටයිලර් සොයන්න', desc: 'දිස්ත්‍රික්කය, සේවාව හා ශ්‍රේණිගත කිරීම් අනුව ගළපෙන ටයිලර් සොයා ගන්න' },
  { icon: '💬', num: '02', title: 'WhatsApp සම්බන්ධය', desc: 'TilersHub ස්වයංක්‍රීය පණිවිඩයකින් ටයිලර් සමඟ කෙලින්ම සාකච්ඡා කරන්න' },
  { icon: '🏠', num: '03', title: 'ව්‍යාපෘතිය ආරම්භ කරන්න', desc: 'ගාස්තු, කාලසටහන සාකච්ඡා කර ඔබේ නිවස ලස්සන කරගන්න' },
]

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

function AdSlider() {
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
      {/* Slider viewport */}
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
              {/* Icon */}
              <div style={{
                width: 42, height: 42, flexShrink: 0,
                background: `${ad.accent}20`,
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>
                {ad.icon}
              </div>

              {/* Text */}
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

              {/* CTA */}
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

      {/* Dot indicators */}
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

export default function Home() {
  const navigate = useNavigate()

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'var(--charcoal)',
        position: 'relative',
        overflow: 'hidden',
        padding: '90px 24px 100px',
        textAlign: 'center'
      }}>
        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(193,96,58,0.6) 39px, rgba(193,96,58,0.6) 40px),
            repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(193,96,58,0.6) 39px, rgba(193,96,58,0.6) 40px)
          `
        }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 350, height: 350, background: 'radial-gradient(circle, var(--terracotta) 0%, transparent 70%)', opacity: 0.13 }} />
        <div style={{ position: 'absolute', top: -100, right: -100, width: 450, height: 450, background: 'radial-gradient(circle, var(--sage) 0%, transparent 70%)', opacity: 0.07 }} />

        <div style={{ position: 'relative' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(193,96,58,0.15)',
            border: '1px solid rgba(193,96,58,0.3)',
            color: 'var(--terracotta-muted)',
            fontSize: 10, padding: '5px 16px', borderRadius: 20,
            letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, marginBottom: 28
          }}>
            🇱🇰 ශ්‍රී ලංකාවේ #1 ටයිල් වේදිකාව
          </span>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(34px, 7vw, 68px)',
            fontWeight: 700, color: 'var(--white)',
            lineHeight: 1.12, marginBottom: 8
          }}>
            ඔබේ නිවස<br />
            <span style={{ color: 'var(--terracotta)' }}>ලස්සන කරමු</span>
          </h1>

          <p style={{
            fontSize: 15, color: 'rgba(245,240,232,0.55)',
            maxWidth: 460, margin: '20px auto 44px', lineHeight: 1.9
          }}>
            ශ්‍රී ලංකාව පුරා දක්ෂ ටයිලර්වරුන් සෙවිය හැකි, WhatsApp හරහා කෙලින්ම සාකච්ඡා කළ හැකි නොමිලේ සේවාවකි
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 44 }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/explore')}>
              🔍 ටයිලර් සොයන්න
            </button>
            <button
              className="btn btn-lg"
              style={{ background: 'rgba(245,240,232,0.07)', color: 'var(--cream)', border: '1.5px solid rgba(245,240,232,0.2)' }}
              onClick={() => navigate('/register')}
            >
              ✦ ටයිලර් ලෙස එකතු වන්න
            </button>
          </div>

          {/* Ad slider */}
          <AdSlider />

          {/* Stats */}
          <div style={{ marginTop: 48, display: 'flex', justifyContent: 'center', alignItems: 'stretch', flexWrap: 'wrap', borderTop: '1px solid rgba(245,240,232,0.07)' }}>
            {[
              { num: '500+', label: 'ලියාපදිංචි ටයිලර්' },
              { num: '25', label: 'දිස්ත්‍රික්ක' },
              { num: '2,000+', label: 'සාර්ථක ව්‍යාපෘති' },
              { num: 'නොමිලේ', label: 'සේවාව' },
            ].map((s, i, arr) => (
              <div key={s.label} style={{
                textAlign: 'center',
                padding: '28px clamp(16px, 4vw, 48px)',
                borderRight: i < arr.length - 1 ? '1px solid rgba(245,240,232,0.07)' : 'none'
              }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(26px,4vw,40px)', color: 'var(--terracotta)', fontWeight: 700 }}>{s.num}</div>
                <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.38)', marginTop: 4, letterSpacing: 0.3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="section-tag">ක්‍රියාවලිය</span>
          <h2 className="section-title">කෙසේ ක්‍රියා කරයිද?</h2>
          <p className="section-sub" style={{ margin: '0 auto' }}>සරල පියවර 3කින් ඔබේ ව්‍යාපෘතිය ආරම්භ කරන්න</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 24 }}>
          {HOW_STEPS.map(s => (
            <div key={s.num} className="card" style={{ padding: '36px 28px', position: 'relative' }}>
              <div style={{
                position: 'absolute', top: 20, right: 24,
                fontFamily: "'Playfair Display', serif",
                fontSize: 72, color: 'var(--cream-dark)', fontWeight: 700, lineHeight: 1, userSelect: 'none'
              }}>{s.num}</div>
              <div style={{
                width: 52, height: 52,
                background: 'linear-gradient(135deg, var(--terracotta) 0%, var(--terracotta-light) 100%)',
                borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, marginBottom: 22, boxShadow: '0 4px 16px rgba(193,96,58,0.25)'
              }}>{s.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: 'var(--charcoal)' }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.85 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tiler CTA */}
      <section style={{
        background: 'var(--charcoal)', padding: '80px 24px',
        textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(193,96,58,0.6) 20px, rgba(193,96,58,0.6) 21px)` }} />
        <div style={{ position: 'relative' }}>
          <span className="section-tag">ටයිලර්වරුනි</span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px,4vw,40px)', color: 'var(--white)', margin: '12px 0', fontWeight: 700 }}>
            ව්‍යාපාරය <span style={{ color: 'var(--terracotta)' }}>ව්‍යාප්ත</span> කරගන්න
          </h2>
          <p style={{ color: 'rgba(245,240,232,0.45)', fontSize: 14, maxWidth: 420, margin: '0 auto 28px', lineHeight: 1.9 }}>
            TilersHub හරහා නව ගනුදෙනුකරුවන් ලබා ගෙන ශ්‍රී ලංකාව පුරා ඔබේ ව්‍යාපාරය ප්‍රවර්ධනය කරගන්න — නොමිලේ
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 340, margin: '0 auto 36px', textAlign: 'left' }}>
            {['නොමිලේ ලියාපදිංචිය — ගෙවීමක් නැත', 'ශ්‍රී ලංකාව පුරා ගෘහ හිමිකරුවන්ට ළඟා වන්න', 'WhatsApp හරහා කෙලින්ම ව්‍යාපෘති ලබා ගන්න'].map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(245,240,232,0.65)', fontSize: 13 }}>
                <span style={{ flexShrink: 0, background: 'rgba(193,96,58,0.2)', color: 'var(--terracotta)', width: 22, height: 22, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>✓</span>
                {b}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              ✦ දැන්ම ලියාපදිංචි වන්න
            </button>
            <button className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--cream)', border: '1.5px solid rgba(255,255,255,0.15)' }} onClick={() => navigate('/explore')}>
              ටයිලර් බලන්න
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
