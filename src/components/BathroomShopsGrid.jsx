/* All constants and helpers outside component — avoids React island remount issues */

function waLead(phone, name) {
  const n = (phone || '').replace(/\D/g, '')
  const normalized = n.startsWith('94') ? n : '94' + n.replace(/^0/, '')
  const msg = encodeURIComponent(
    `ආයුබෝවන්! 🙏\n\nමම *TilersHub* (www.tilershub.lk) හරහා *${name}* සොයාගතිමි.\n\nඔබගේ සේවාව ගැන දැනගැනීමට කැමැත්තෙමි.\n\n📌 *TilersHub.lk* Lead\nස්තූතියි! 🏠`
  )
  return `https://wa.me/${normalized}?text=${msg}`
}

const TILE_KWS = ['tile', 'floor', 'wall', 'mosaic', 'porcelain', 'ceramic', 'granite', 'marble']

function shopTagline(services) {
  const s = (services || []).join(' ').toLowerCase()
  const hasTile = TILE_KWS.some(k => s.includes(k))
  return hasTile ? 'Tiles & Bathware' : 'Bathware Specialist'
}

function ShopCard({ shop, index }) {
  const waPhone = shop.whatsapp || shop.phone
  const waLink = waPhone ? waLead(waPhone, shop.name) : null
  const tagline = shopTagline(shop.services)
  const coverImg = shop.cover_image && !shop.cover_image.includes('picsum') ? shop.cover_image : null
  const chips = (shop.services || []).slice(0, 3)

  return (
    <div
      style={{ background: '#fff', border: '1px solid #e8edf5', borderRadius: 20, overflow: 'hidden', display: 'flex', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'all 0.2s' }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.12)' }}
      onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      {/* Left: photo */}
      <div style={{ width: 110, flexShrink: 0, position: 'relative', minHeight: 140 }}>
        {coverImg ? (
          <img src={coverImg} alt={shop.name} loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#f8fafc', backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 19px,#e2e8f0 19px,#e2e8f0 20px),repeating-linear-gradient(90deg,transparent,transparent 19px,#e2e8f0 19px,#e2e8f0 20px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 26, opacity: 0.18 }}>🚿</span>
          </div>
        )}
        {shop.is_featured && (
          <div style={{ position: 'absolute', top: 8, left: 8, background: '#D4AF37', color: '#fff', fontSize: 8, fontWeight: 700, letterSpacing: 0.5, padding: '3px 7px', borderRadius: 20, boxShadow: '0 2px 6px rgba(0,0,0,0.25)', whiteSpace: 'nowrap' }}>
            ⭐ Top Rated
          </div>
        )}
      </div>

      {/* Right: content */}
      <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 }}>
          {tagline}
        </div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: '#0f172a', lineHeight: 1.25, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {shop.name}
        </div>
        {shop.description && (
          <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6, margin: '0 0 8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
            {shop.description}
          </p>
        )}
        {chips.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
            {chips.map(s => (
              <span key={s} style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: '#eef3fb', color: '#4A2E17', border: '1px solid #d5e2f5' }}>{s}</span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 'auto' }}>
          <div style={{ fontSize: 11, color: '#94a3b8', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            📍 {shop.city || shop.district}
          </div>
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, background: '#0f172a', color: '#fff', borderRadius: 10, padding: '8px 13px', fontSize: 11, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              View Shop <span style={{ fontSize: 12 }}>›</span>
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
