import { useState, useEffect } from 'react'

/* All constants outside component — avoids remount */

function waLead(phone, name) {
  const n = (phone || '').replace(/\D/g, '')
  const normalized = n.startsWith('94') ? n : '94' + n.replace(/^0/, '')
  const msg = encodeURIComponent(
    `ආයුබෝවන්! 🙏\n\nමම *TilersHub* (www.tilershub.lk) හරහා *${name}* සොයාගතිමි.\n\nඔබගේ සේවාව ගැන දැනගැනීමට කැමැත්තෙමි.\n\n📌 *TilersHub.lk* Lead\nස්තූතියි! 🏠`
  )
  return `https://wa.me/${normalized}?text=${msg}`
}

const COVER_SETS = [
  [
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=600&q=75',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=75',
    'https://images.unsplash.com/photo-1620626011761-996317702149?auto=format&fit=crop&w=600&q=75',
    'https://images.unsplash.com/photo-1552239937-bd2f32de3f6f?auto=format&fit=crop&w=600&q=75',
  ],
  [
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=75',
    'https://images.unsplash.com/photo-1620626011761-996317702149?auto=format&fit=crop&w=600&q=75',
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=600&q=75',
    'https://images.unsplash.com/photo-1552239937-bd2f32de3f6f?auto=format&fit=crop&w=600&q=75',
  ],
]

function CoverSlider({ shopIndex }) {
  const images = COVER_SETS[shopIndex % COVER_SETS.length]
  const [current, setCurrent] = useState(shopIndex % images.length)

  useEffect(() => {
    const id = setInterval(() => setCurrent(c => (c + 1) % images.length), 3200)
    return () => clearInterval(id)
  }, [images.length])

  return (
    <div style={{ position: 'relative', height: 172, overflow: 'hidden', flexShrink: 0 }}>
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          loading="lazy"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            opacity: i === current ? 1 : 0,
            transition: 'opacity 1s ease',
          }}
        />
      ))}

      {/* Gradient scrim */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,18,32,0.72) 0%, rgba(10,18,32,0.18) 55%, transparent 100%)', pointerEvents: 'none' }} />

      {/* Dot indicators */}
      <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5, pointerEvents: 'none' }}>
        {images.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === current ? 18 : 5,
              height: 5, borderRadius: 3,
              background: i === current ? '#fff' : 'rgba(255,255,255,0.38)',
              transition: 'all 0.35s ease',
            }}
          />
        ))}
      </div>

      {/* 🚿 Bathroom Shop badge */}
      <div style={{ position: 'absolute', top: 10, left: 10, fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', background: 'rgba(10,18,32,0.55)', backdropFilter: 'blur(4px)', padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.18)' }}>
        🚿 Bathroom Shop
      </div>
    </div>
  )
}

function ShopCard({ shop, index }) {
  return (
    <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', transition: 'box-shadow 0.2s, transform 0.2s' }}
      onMouseOver={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(27,58,107,0.12)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
      onMouseOut={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = '' }}
    >
      <CoverSlider shopIndex={index} />

      <div style={{ padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Name + location */}
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', lineHeight: 1.2 }}>{shop.name}</div>
          {(shop.city || shop.district) && (
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>📍 {shop.city}{shop.district ? `, ${shop.district}` : ''}</div>
          )}
        </div>

        {/* Description */}
        {shop.description && (
          <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.65, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {shop.description}
          </p>
        )}

        {/* Service chips */}
        {(shop.services || []).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {(shop.services || []).slice(0, 4).map(sv => (
              <span key={sv} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: '#EFF6FF', color: '#1d4ed8', border: '1px solid #BFDBFE', fontWeight: 600 }}>{sv}</span>
            ))}
            {(shop.services || []).length > 4 && (
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0' }}>+{shop.services.length - 4} more</span>
            )}
          </div>
        )}

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 4 }}>
          {shop.whatsapp && (
            <a
              href={waLead(shop.whatsapp, shop.name)}
              target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#25D366', color: '#fff', borderRadius: 10, padding: '9px 12px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
            >
              💬 WhatsApp
            </a>
          )}
          {shop.phone && (
            <a
              href={`tel:${shop.phone}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: '#eef3fb', color: '#1B3A6B', borderRadius: 10, padding: '9px 12px', fontSize: 12, fontWeight: 700, textDecoration: 'none', border: '1px solid #d5e2f5' }}
            >
              📞 Call
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BathroomShopsGrid({ shops }) {
  if (!shops || shops.length === 0) return null
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 18 }}>
      {shops.map((shop, i) => (
        <ShopCard key={shop.id} shop={shop} index={i} />
      ))}
    </div>
  )
}
