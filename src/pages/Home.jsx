import { useNavigate } from 'react-router-dom'
import { Footer } from '../components/UI'

const HOW_STEPS = [
  { icon: '🔍', num: '01', title: 'ටයිලර් සොයන්න', desc: 'දිස්ත්‍රික්කය, සේවාව හා ශ්‍රේණිගත කිරීම් අනුව ගළපෙන ටයිලර් සොයා ගන්න' },
  { icon: '💬', num: '02', title: 'WhatsApp සම්බන්ධය', desc: 'TilersHub ස්වයංක්‍රීය පණිවිඩයකින් ටයිලර් සමඟ කෙලින්ම සාකච්ඡා කරන්න' },
  { icon: '🏠', num: '03', title: 'ව්‍යාපෘතිය ආරම්භ කරන්න', desc: 'ගාස්තු, කාලසටහන සාකච්ඡා කර ඔබේ නිවස ලස්සන කරගන්න' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'var(--charcoal)',
        position: 'relative',
        overflow: 'hidden',
        padding: '90px 24px 110px',
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
        <div style={{
          position: 'absolute', bottom: -80, left: -80,
          width: 350, height: 350,
          background: 'radial-gradient(circle, var(--terracotta) 0%, transparent 70%)',
          opacity: 0.13
        }} />
        <div style={{
          position: 'absolute', top: -100, right: -100,
          width: 450, height: 450,
          background: 'radial-gradient(circle, var(--sage) 0%, transparent 70%)',
          opacity: 0.07
        }} />

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
            fontWeight: 700,
            color: 'var(--white)',
            lineHeight: 1.12,
            marginBottom: 8
          }}>
            ඔබේ නිවස<br />
            <span style={{ color: 'var(--terracotta)' }}>ලස්සන කරමු</span>
          </h1>

          <p style={{
            fontSize: 15, color: 'rgba(245,240,232,0.55)',
            maxWidth: 460, margin: '20px auto 52px',
            lineHeight: 1.9
          }}>
            ශ්‍රී ලංකාව පුරා දක්ෂ ටයිලර්වරුන් සෙවිය හැකි, WhatsApp හරහා කෙලින්ම සාකච්ඡා කළ හැකි නොමිලේ සේවාවකි
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
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

          {/* Stats */}
          <div style={{ marginTop: 72, display: 'flex', justifyContent: 'center', gap: 'clamp(24px, 6vw, 64px)', flexWrap: 'wrap' }}>
            {[
              { num: '500+', label: 'ලියාපදිංචි ටයිලර්' },
              { num: '25', label: 'දිස්ත්‍රික්ක' },
              { num: '2,000+', label: 'සාර්ථක ව්‍යාපෘති' },
              { num: 'නොමිලේ', label: 'සේවාව' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(26px,4vw,38px)', color: 'var(--terracotta)', fontWeight: 700 }}>{s.num}</div>
                <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.4)', marginTop: 3 }}>{s.label}</div>
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
            <div key={s.num} className="card" style={{ padding: '32px 28px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 16, right: 20, fontFamily: "'Playfair Display', serif", fontSize: 52, color: 'var(--cream-dark)', fontWeight: 700, lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: 38, marginBottom: 18 }}>{s.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: 'var(--charcoal)' }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.8 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tiler CTA */}
      <section style={{
        background: 'var(--charcoal)',
        padding: '80px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(193,96,58,0.6) 20px, rgba(193,96,58,0.6) 21px)` }} />
        <div style={{ position: 'relative' }}>
          <span className="section-tag">ටයිලර්වරුනි</span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px,4vw,40px)', color: 'var(--white)', margin: '12px 0', fontWeight: 700 }}>
            ව්‍යාපාරය <span style={{ color: 'var(--terracotta)' }}>ව්‍යාප්ත</span> කරගන්න
          </h2>
          <p style={{ color: 'rgba(245,240,232,0.45)', fontSize: 14, maxWidth: 420, margin: '0 auto 36px', lineHeight: 1.9 }}>
            TilersHub හරහා නව ගනුදෙනුකරුවන් ලබා ගෙන ශ්‍රී ලංකාව පුරා ඔබේ ව්‍යාපාරය ප්‍රවර්ධනය කරගන්න — නොමිලේ
          </p>
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
