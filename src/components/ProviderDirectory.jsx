import { useState, useEffect, useRef } from 'react'
import { supabase, buildWhatsAppLink, DISTRICTS_EN, SERVICES_EN, PROVIDER_TYPES, VERIFICATION_BADGES } from '../lib/supabase.js'

const TYPE_LABELS = {
  tiler: 'Tilers', workshop: 'Workshops', supplier: 'Suppliers',
  contractor: 'Contractors', tile_shop: 'Tile Shops', brand_dealer: 'Brand Dealers',
  tool_supplier: 'Tool Suppliers', bathroom_shop: 'Bathroom Shops',
}

function initials(name) {
  return (name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'TH'
}

function VerificationBadge({ status }) {
  const b = VERIFICATION_BADGES[status] || VERIFICATION_BADGES.listed
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: b.bg, color: b.color, border: `1px solid ${b.color}30` }}>
      {status === 'th_master' ? '★' : status === 'th_certified_pro' ? '✦' : status === 'th_verified' ? '✓' : '·'} {b.label}
    </span>
  )
}

function ProviderCard({ provider, onClick }) {
  const pts = PROVIDER_TYPES.find(p => p.value === provider.provider_type)
  return (
    <div
      onClick={() => onClick(provider)}
      style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(27,58,107,0.1)' }}
      onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      <div style={{ padding: '18px 18px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #1B3A6B, #2B5299)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
            {provider.profile_image ? <img src={provider.profile_image} alt={provider.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(provider.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{provider.name}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>📍 {provider.city || provider.district}</div>
          </div>
          <VerificationBadge status={provider.verification_status} />
        </div>
        {provider.description && (
          <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {provider.description}
          </p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
          {pts && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#eef3fb', color: '#1B3A6B', border: '1px solid #d5e2f5' }}>
              {pts.icon} {pts.label}
            </span>
          )}
          {(provider.services || []).slice(0, 2).map(s => (
            <span key={s} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>{s}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {provider.whatsapp && (
            <a href={buildWhatsAppLink(provider.whatsapp, provider.name)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#25D366', color: '#fff', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
              <span>💬</span> WhatsApp
            </a>
          )}
          {provider.phone && (
            <a href={`tel:${provider.phone}`} onClick={e => e.stopPropagation()}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: '#eef3fb', color: '#1B3A6B', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 700, textDecoration: 'none', border: '1px solid #d5e2f5' }}>
              📞 Call
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function ShopCard({ provider, onClick }) {
  const pts = PROVIDER_TYPES.find(p => p.value === provider.provider_type)
  const brands = (provider.services || []).filter(s =>
    !['Floor Tiles', 'Wall Tiles', 'Bathroom Tiles', 'Outdoor Tiles', 'Commercial'].includes(s)
  )
  const categories = (provider.services || []).filter(s =>
    ['Floor Tiles', 'Wall Tiles', 'Bathroom Tiles', 'Outdoor Tiles', 'Commercial'].includes(s)
  )

  return (
    <div onClick={() => onClick(provider)}
      style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(27,58,107,0.1)' }}
      onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      {provider.cover_image ? (
        <div style={{ height: 100, overflow: 'hidden', position: 'relative' }}>
          <img src={provider.cover_image} alt={provider.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,36,68,0.85) 0%, transparent 60%)' }} />
        </div>
      ) : (
        <div style={{ background: 'linear-gradient(135deg, #0f2444, #1B3A6B)', padding: '18px 18px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🏪</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{provider.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>📍 {provider.city}{provider.district ? `, ${provider.district}` : ''}</div>
          </div>
          {pts && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>{pts.icon} {pts.label}</span>}
        </div>
      )}
      <div style={{ padding: '14px 18px 16px' }}>
        {provider.description && (
          <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {provider.description}
          </p>
        )}
        {brands.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Brands Carried</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {brands.map(b => (
                <span key={b} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: '#eef3fb', color: '#1B3A6B', border: '1px solid #d5e2f5', fontWeight: 600 }}>{b}</span>
              ))}
            </div>
          </div>
        )}
        {categories.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
            {categories.map(c => (
              <span key={c} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>{c}</span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          {provider.whatsapp && (
            <a href={buildWhatsAppLink(provider.whatsapp, provider.name)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#25D366', color: '#fff', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
              <span>💬</span> WhatsApp
            </a>
          )}
          {provider.phone && (
            <a href={`tel:${provider.phone}`} onClick={e => e.stopPropagation()}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: '#eef3fb', color: '#1B3A6B', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 700, textDecoration: 'none', border: '1px solid #d5e2f5' }}>
              📞 Call
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Tiler card colour palette ──────────────────────────────────────────────
const TILER_COVER_BG = 'linear-gradient(135deg, #0F2444 0%, #1B3A6B 100%)'

// Promotional banner card (horizontal scroll spotlight)
function TilerBanner({ tiler, onClick }) {
  const phone = tiler.whatsapp || tiler.phone

  return (
    <div
      onClick={() => onClick(tiler)}
      style={{ width: 240, minWidth: 240, height: 150, borderRadius: 16, overflow: 'hidden', flexShrink: 0, cursor: 'pointer', position: 'relative', transition: 'transform 0.2s', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
      onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.02)' }}
      onMouseOut={e => { e.currentTarget.style.transform = '' }}
    >
      {/* Background: cover image or colour gradient */}
      {tiler.cover_image
        ? <img src={tiler.cover_image} alt={tiler.full_name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        : <div style={{ position: 'absolute', inset: 0, background: TILER_COVER_BG }} />
      }
      {/* Tile-grid texture */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(255,255,255,0.8) 19px,rgba(255,255,255,0.8) 20px),repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(255,255,255,0.8) 19px,rgba(255,255,255,0.8) 20px)', pointerEvents: 'none' }} />
      {/* Dark scrim at bottom */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }} />

      {/* Verified badge top-right */}
      {tiler.is_verified && (
        <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)' }}>✓ Skilled</span>
      )}

      {/* Bottom info */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          {/* Avatar */}
          <div style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
            {tiler.avatar_url
              ? <img src={tiler.avatar_url} alt={tiler.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials(tiler.full_name)
            }
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tiler.full_name}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)' }}>📍 {tiler.city || tiler.district}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {tiler.experience_years > 0 && (
            <span style={{ fontSize: 9, padding: '1px 7px', borderRadius: 20, background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>🛠️ {tiler.experience_years}+ yrs</span>
          )}
          {tiler.avg_rating > 0 && (
            <span style={{ fontSize: 9, padding: '1px 7px', borderRadius: 20, background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>⭐ {tiler.avg_rating.toFixed(1)}</span>
          )}
          {tiler.daily_rate_min && (
            <span style={{ fontSize: 9, padding: '1px 7px', borderRadius: 20, background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>Rs.{tiler.daily_rate_min}/sqft</span>
          )}
        </div>
      </div>
    </div>
  )
}

// Professional tiler grid card with cover + overlapping circular avatar
function TilerCard({ tiler, onClick }) {
  const phone = tiler.whatsapp || tiler.phone

  return (
    <div
      onClick={() => onClick(tiler)}
      style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'visible', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', position: 'relative' }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(27,58,107,0.12)' }}
      onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      {/* Cover image / gradient header */}
      <div style={{ height: 120, borderRadius: '16px 16px 0 0', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
        {tiler.cover_image
          ? <img src={tiler.cover_image} alt={tiler.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <>
              <div style={{ position: 'absolute', inset: 0, background: TILER_COVER_BG }} />
              <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(255,255,255,0.8) 19px,rgba(255,255,255,0.8) 20px),repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(255,255,255,0.8) 19px,rgba(255,255,255,0.8) 20px)', pointerEvents: 'none' }} />
            </>
        }
        {/* Dark overlay when cover image exists */}
        {tiler.cover_image && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)' }} />}

        {/* Verified badge */}
        {tiler.is_verified && (
          <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(4px)' }}>✓ Skilled</span>
        )}
        {/* Availability */}
        {tiler.availability === 'available' && (
          <span style={{ position: 'absolute', top: 10, left: 10, fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: 'rgba(22,163,74,0.85)', color: '#fff' }}>● Available</span>
        )}
      </div>

      {/* Circular avatar — overlaps cover/body boundary */}
      <div style={{ position: 'absolute', top: 120 - 28, left: 16, width: 56, height: 56, borderRadius: '50%', border: '3px solid #fff', background: '#1B3A6B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff', overflow: 'hidden', zIndex: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', flexShrink: 0 }}>
        {tiler.avatar_url
          ? <img src={tiler.avatar_url} alt={tiler.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : initials(tiler.full_name)
        }
      </div>

      {/* Card body */}
      <div style={{ padding: '32px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Name row — offset right to clear the avatar */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ width: 56 + 10, flexShrink: 0 }} />{/* spacer matching avatar */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tiler.full_name}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>📍 {tiler.city || tiler.district}</div>
          </div>
        </div>

        {/* Stats chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: '#eef3fb', color: '#1B3A6B', border: '1px solid #d5e2f5', fontWeight: 600 }}>🪚 Tiler</span>
          {tiler.experience_years > 0 && (
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', fontWeight: 600 }}>🛠️ {tiler.experience_years}+ yrs</span>
          )}
          {tiler.avg_rating > 0 && (
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a', fontWeight: 600 }}>⭐ {tiler.avg_rating.toFixed(1)}</span>
          )}
          {tiler.daily_rate_min && (
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff', fontWeight: 600 }}>Rs.{tiler.daily_rate_min}/sqft</span>
          )}
        </div>

        {/* Bio */}
        {tiler.bio && (
          <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.65, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {tiler.bio}
          </p>
        )}

        {/* Services */}
        {(tiler.services || []).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
            {(tiler.services || []).slice(0, 3).map(s => (
              <span key={s} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>{s}</span>
            ))}
            {(tiler.services || []).length > 3 && (
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0' }}>+{(tiler.services || []).length - 3} more</span>
            )}
          </div>
        )}

        {/* Contact buttons */}
        <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
          {phone && (
            <a
              href={buildWhatsAppLink(phone, tiler.full_name)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#25D366', color: '#fff', borderRadius: 10, padding: '9px 12px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
            >
              <span>💬</span> WhatsApp
            </a>
          )}
          {tiler.phone && (
            <a
              href={`tel:${tiler.phone}`}
              onClick={e => e.stopPropagation()}
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

function ProviderModal({ item, isTiler, onClose }) {
  if (!item) return null
  const name = isTiler ? item.full_name : item.name
  const phone = isTiler ? (item.whatsapp || item.phone) : (item.whatsapp || item.phone)
  const pts = !isTiler && PROVIDER_TYPES.find(p => p.value === item.provider_type)
  const coverBg = isTiler ? '#1B3A6B' : '#0f2444'

  const coverImage = isTiler ? item.cover_image : item.cover_image
  const avatarImage = isTiler ? item.avatar_url : item.profile_image

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        {/* Modal cover */}
        <div style={{ height: 160, position: 'relative', borderRadius: '20px 20px 0 0', overflow: 'hidden' }}>
          {coverImage
            ? <img src={coverImage} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <>
                <div style={{ position: 'absolute', inset: 0, background: isTiler ? TILER_COVER_BG : 'linear-gradient(135deg, #0f2444 0%, #1B3A6B 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(255,255,255,0.8) 19px,rgba(255,255,255,0.8) 20px),repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(255,255,255,0.8) 19px,rgba(255,255,255,0.8) 20px)' }} />
              </>
          }
          {coverImage && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />}
          {/* Close button */}
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.35)', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', fontSize: 16, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>✕</button>
        </div>

        {/* Avatar overlapping cover */}
        <div style={{ position: 'relative', paddingTop: 0 }}>
          <div style={{ position: 'absolute', top: -32, left: 24, width: 64, height: 64, borderRadius: '50%', border: '3px solid #fff', background: isTiler ? coverBg : '#1B3A6B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }}>
            {avatarImage
              ? <img src={avatarImage} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials(name)
            }
          </div>
        </div>

        <div style={{ padding: '10px 24px 24px', paddingTop: 40 }}>
          {/* Name & location */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>{name}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>📍 {item.city || item.district}{item.district && item.city ? `, ${item.district}` : ''}</div>
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {!isTiler && pts && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#eef3fb', color: '#1B3A6B' }}>{pts.icon} {pts.label}</span>}
            {isTiler && item.is_verified && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>✓ Skilled</span>}
            {!isTiler && <VerificationBadge status={item.verification_status} />}
          </div>

          {/* Bio / Description */}
          {(isTiler ? item.bio : item.description) && (
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.75, marginBottom: 18, padding: 14, background: '#f8fafc', borderRadius: 10 }}>
              {isTiler ? item.bio : item.description}
            </p>
          )}

          {/* Stats (tilers only) */}
          {isTiler && (item.experience_years || item.total_jobs || item.daily_rate_min) && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
              {item.experience_years > 0 && (
                <div style={{ padding: '10px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#1B3A6B' }}>{item.experience_years}+</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>Years Exp.</div>
                </div>
              )}
              {item.total_jobs > 0 && (
                <div style={{ padding: '10px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#1B3A6B' }}>{item.total_jobs}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>Jobs Done</div>
                </div>
              )}
              {item.daily_rate_min && (
                <div style={{ padding: '10px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1B3A6B' }}>Rs.{item.daily_rate_min}–{item.daily_rate_max || '?'}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>Per sq.ft</div>
                </div>
              )}
              {item.avg_rating > 0 && (
                <div style={{ padding: '10px 16px', background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a', textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#92400e' }}>⭐ {item.avg_rating.toFixed(1)}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{item.review_count || 0} reviews</div>
                </div>
              )}
            </div>
          )}

          {/* Services */}
          {(item.services || []).length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Services</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(item.services || []).map(s => (
                  <span key={s} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: '#eef3fb', color: '#1B3A6B', border: '1px solid #d5e2f5' }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio */}
          {(item.gallery || item.photo_urls || []).length > 0 && (() => {
            const imgs = item.gallery || item.photo_urls || []
            return (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Portfolio</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 6 }}>
                  {imgs.map((img, i) => (
                    <img key={i} src={img} alt="" style={{ width: '100%', aspectRatio: '1', borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Contact buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            {phone && (
              <a href={buildWhatsAppLink(phone, name)} target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#25D366', color: '#fff', borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                💬 WhatsApp
              </a>
            )}
            {item.phone && (
              <a href={`tel:${item.phone}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#eef3fb', color: '#1B3A6B', borderRadius: 12, padding: '13px 20px', fontSize: 14, fontWeight: 700, textDecoration: 'none', border: '1px solid #d5e2f5' }}>
                📞 Call
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const TYPE_INFO_CARDS = {
  workshop: [
    { icon: '🔪', title: 'Tile Cutting', body: 'Straight cuts, bevel edges and L-shapes for perfect fits on any site.' },
    { icon: '🌀', title: 'Routing & Profiling', body: 'Rounded edges, grooves and custom profiles for a premium finish.' },
    { icon: '💧', title: 'Waterjet Cutting', body: 'Precision curves, mosaic shapes and outlet holes without chipping.' },
  ],
  supplier: [
    { icon: '📦', title: 'Bulk Supply', body: 'Floor, wall and outdoor tiles supplied wholesale to contractors and homeowners.' },
    { icon: '🏷️', title: 'Competitive Pricing', body: 'Direct-from-importer pricing on porcelain, ceramic and natural stone.' },
    { icon: '🚚', title: 'Island-wide Delivery', body: 'Most suppliers deliver island-wide. Ask for minimum order quantities.' },
  ],
  contractor: [
    { icon: '🏗️', title: 'Full Renovation', body: 'End-to-end bathroom and kitchen renovation — design to handover.' },
    { icon: '💧', title: 'Waterproofing', body: 'Certified membrane waterproofing for wet areas and flat roofs.' },
    { icon: '📋', title: 'Project Management', body: 'Single point of contact managing tilers, plumbers and finishers.' },
  ],
  tile_shop: [
    { icon: '🏪', title: 'Showroom Experience', body: 'See tiles at full scale before buying — patterns, textures and grout combos.' },
    { icon: '🪨', title: 'Wide Range', body: 'Budget to premium ranges in porcelain, ceramic, marble and mosaic.' },
    { icon: '💡', title: 'Design Advice', body: 'In-store consultants help you match tiles, grout and fittings.' },
  ],
  brand_dealer: [
    { icon: '🏷️', title: 'Authorised Brands', body: 'Genuine Rocell, Lanka Tile, Megatile and imported brand products.' },
    { icon: '✅', title: 'Warranty Backed', body: 'Authorised dealers provide manufacturer warranty on every product.' },
    { icon: '🎨', title: 'Full Collections', body: 'Access the complete range of each brand including limited editions.' },
  ],
  tool_supplier: [
    { icon: '🔧', title: 'Tile Cutters & Saws', body: 'Manual cutters, wet saws and rail cutters for clean straight cuts.' },
    { icon: '⚙️', title: 'Leveling Systems', body: 'Clips, wedges and pliers for perfectly flat, lippage-free installations.' },
    { icon: '🦺', title: 'Safety Equipment', body: 'Knee pads, gloves, safety glasses and dust masks for site use.' },
  ],
  bathroom_shop: [
    { icon: '🚿', title: 'Sanitary Ware', body: 'Toilets, basins, showers and bathtubs from leading brands.' },
    { icon: '🔩', title: 'Faucets & Mixers', body: 'Basin mixers, bath mixers and kitchen taps in all finishes.' },
    { icon: '🪞', title: 'Vanities & Mirrors', body: 'Bathroom vanity units, storage cabinets and LED mirrors.' },
  ],
}

function SuggestedContent({ type, tilers, providers, onSelectTiler, onSelectProvider }) {
  const infoCards = TYPE_INFO_CARDS[type] || []
  const suggestedTilers = tilers.slice(0, 4)
  const otherProviders = providers.filter(p => p.provider_type !== type).slice(0, 3)
  const typeLabel = TYPE_LABELS[type] || 'Providers'

  return (
    <div>
      {/* Empty notice */}
      <div style={{ background: '#fff', borderRadius: 16, border: '2px dashed #e2e8f0', padding: '36px 24px', textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🏗️</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
          No {typeLabel} listed yet
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20, maxWidth: 360, margin: '0 auto 20px' }}>
          We're onboarding {typeLabel.toLowerCase()} now. Be the first to list yours — free, direct WhatsApp leads.
        </p>
        <a href="/join-tilershub" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#E05A2B', color: '#fff', borderRadius: 10, padding: '10px 22px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
          ✅ Join as {typeLabel.replace(/s$/, '')}
        </a>
      </div>

      {/* Info cards about what this type does */}
      {infoCards.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
            What {typeLabel} Do
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {infoCards.map(c => (
              <div key={c.title} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '18px 18px' }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: '#eef3fb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 10 }}>{c.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 4 }}>{c.title}</div>
                <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.65 }}>{c.body}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested tilers */}
      {suggestedTilers.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
              👷 Featured Tilers
            </div>
            <a href="/providers?type=tiler" style={{ fontSize: 12, color: '#1B3A6B', fontWeight: 600, textDecoration: 'none' }}>See all →</a>
          </div>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
            {suggestedTilers.map(t => (
              <TilerBanner key={t.id} tiler={t} onClick={onSelectTiler} />
            ))}
          </div>
        </div>
      )}

      {/* Other providers */}
      {otherProviders.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
              🏪 Other Providers
            </div>
            <a href="/providers" style={{ fontSize: 12, color: '#1B3A6B', fontWeight: 600, textDecoration: 'none' }}>See all →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {otherProviders.map(p => (
              <ProviderCard key={p.id} provider={p} onClick={onSelectProvider} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProviderDirectory({ initialType, initialSearch }) {
  const [tilers, setTilers] = useState([])
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [inputValue, setInputValue] = useState(initialSearch || '')
  const [search, setSearch] = useState(initialSearch || '')
  const [district, setDistrict] = useState('')
  const [type, setType] = useState(initialType || '')
  const [selected, setSelected] = useState(null)
  const [isTilerSelected, setIsTilerSelected] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [tilersRes, providersRes] = await Promise.all([
        supabase.from('tilers').select('*').order('featured', { ascending: false }).order('experience_years', { ascending: false }),
        supabase.from('providers').select('*').eq('status', 'active').order('is_featured', { ascending: false })
      ])
      setTilers(tilersRes.data || [])
      setProviders(providersRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const showTilers = !type || type === 'tiler'
  const showProviders = !!type && type !== 'tiler'

  const filteredTilers = showTilers ? tilers.filter(t => {
    if (district && t.district !== district) return false
    if (search) {
      const q = search.toLowerCase()
      return t.full_name?.toLowerCase().includes(q) || t.district?.toLowerCase().includes(q) || (t.services || []).some(s => s.toLowerCase().includes(q))
    }
    return true
  }) : []

  const filteredProviders = showProviders ? providers.filter(p => {
    if (type && p.provider_type !== type) return false
    if (district && p.district !== district && !(p.service_areas || []).includes(district)) return false
    if (search) {
      const q = search.toLowerCase()
      return p.name?.toLowerCase().includes(q) || p.city?.toLowerCase().includes(q) || (p.services || []).some(s => s.toLowerCase().includes(q))
    }
    return true
  }) : []

  const total = filteredTilers.length + filteredProviders.length

  // Spotlight: featured tilers, or first 6 if none are featured
  const spotlightTilers = filteredTilers.filter(t => t.featured).length > 0
    ? filteredTilers.filter(t => t.featured)
    : filteredTilers.slice(0, Math.min(6, filteredTilers.length))

  return (
    <div style={{ background: '#f8fafc', minHeight: '60vh' }}>
      {/* Sticky filter bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 0', position: 'sticky', top: 64, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
            <input
              value={inputValue}
              onChange={e => {
                const val = e.target.value
                setInputValue(val)
                clearTimeout(debounceRef.current)
                debounceRef.current = setTimeout(() => setSearch(val), 280)
              }}
              placeholder="Search by name, service..."
              style={{ width: '100%', padding: '9px 12px 9px 32px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
              onFocus={e => e.target.style.borderColor = '#1B3A6B'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <select value={type} onChange={e => setType(e.target.value)} style={{ padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, outline: 'none', background: '#fff', fontFamily: 'inherit', cursor: 'pointer' }}>
            <option value="">All Types</option>
            {PROVIDER_TYPES.map(p => <option key={p.value} value={p.value}>{p.icon} {p.label}</option>)}
          </select>
          <select value={district} onChange={e => setDistrict(e.target.value)} style={{ padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, outline: 'none', background: '#fff', fontFamily: 'inherit', cursor: 'pointer' }}>
            <option value="">All Districts</option>
            {DISTRICTS_EN.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {(inputValue || type || district) && (
            <button onClick={() => { setInputValue(''); setSearch(''); setType(''); setDistrict('') }} style={{ padding: '9px 14px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              ✕ {type && !inputValue && !district ? `Clear (${TYPE_LABELS[type] || type})` : 'Clear'}
            </button>
          )}
          <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>{total} found</span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>⏳</div>
            <p>Loading providers...</p>
          </div>
        ) : total === 0 ? (
          type && type !== 'tiler' && !search && !district ? (
            <SuggestedContent
              type={type}
              tilers={tilers}
              providers={providers}
              onSelectTiler={item => { setSelected(item); setIsTilerSelected(true) }}
              onSelectProvider={item => { setSelected(item); setIsTilerSelected(false) }}
            />
          ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>No results found</h3>
            <p style={{ color: '#64748b', marginBottom: 24 }}>Try adjusting your filters or search term</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {(search || district) && (
                <button onClick={() => { setSearch(''); setInputValue(''); setDistrict('') }} style={{ padding: '10px 20px', background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Clear Search
                </button>
              )}
              <a href="/providers" style={{ padding: '10px 20px', background: '#f1f5f9', color: '#334155', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                Browse All
              </a>
            </div>
          </div>
          )
        ) : (
          <>
            {/* ── Promotional Spotlight (tilers only) ── */}
            {showTilers && spotlightTilers.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1B3A6B', letterSpacing: '0.5px', textTransform: 'uppercase' }}>⭐ Featured Tilers</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Verified professionals ready for your project</div>
                  </div>
                  <a href="/join-tilershub" style={{ fontSize: 12, fontWeight: 700, color: '#1B3A6B', textDecoration: 'none', background: '#eef3fb', padding: '6px 14px', borderRadius: 8, border: '1px solid #d5e2f5' }}>
                    + List Your Profile
                  </a>
                </div>
                <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {spotlightTilers.map(t => (
                    <TilerBanner key={t.id} tiler={t} onClick={item => { setSelected(item); setIsTilerSelected(true) }} />
                  ))}
                  {/* Promo card: join as tiler */}
                  <a href="/join-tilershub" style={{ width: 240, minWidth: 240, height: 150, borderRadius: 16, overflow: 'hidden', flexShrink: 0, textDecoration: 'none', background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', border: '2px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = '#1B3A6B'; e.currentTarget.style.background = '#eef3fb' }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1B3A6B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff' }}>+</div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1B3A6B' }}>Promote Your Profile</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Free listing on TilersHub</div>
                    </div>
                  </a>
                </div>
              </div>
            )}

            {/* ── All Tilers heading ── */}
            {showTilers && filteredTilers.length > 0 && (
              <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 16, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                👷 All Tilers — {filteredTilers.length} listed
              </div>
            )}

            {/* ── Card grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
              {filteredProviders.map(p => (
                (p.provider_type === 'tile_shop' || p.provider_type === 'brand_dealer')
                  ? <ShopCard key={p.id} provider={p} onClick={item => { setSelected(item); setIsTilerSelected(false) }} />
                  : <ProviderCard key={p.id} provider={p} onClick={item => { setSelected(item); setIsTilerSelected(false) }} />
              ))}
              {filteredTilers.map(t => (
                <TilerCard key={t.id} tiler={t} onClick={item => { setSelected(item); setIsTilerSelected(true) }} />
              ))}
            </div>
          </>
        )}
      </div>

      {selected && (
        <ProviderModal item={selected} isTiler={isTilerSelected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
