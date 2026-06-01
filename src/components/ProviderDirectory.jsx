import { useState, useEffect, useRef } from 'react'
import { supabase, buildWhatsAppLink, DISTRICTS_EN, SERVICES_EN, PROVIDER_TYPES, VERIFICATION_BADGES } from '../lib/supabase.js'

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
            <a
              href={buildWhatsAppLink(provider.whatsapp, provider.name)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#25D366', color: '#fff', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
            >
              <span>💬</span> WhatsApp
            </a>
          )}
          {provider.phone && (
            <a
              href={`tel:${provider.phone}`}
              onClick={e => e.stopPropagation()}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: '#eef3fb', color: '#1B3A6B', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 700, textDecoration: 'none', border: '1px solid #d5e2f5' }}
            >
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
    <div
      onClick={() => onClick(provider)}
      style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(27,58,107,0.1)' }}
      onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      {/* Shop colour-block header */}
      <div style={{ background: 'linear-gradient(135deg, #0f2444, #1B3A6B)', padding: '18px 18px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🏪</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{provider.name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>📍 {provider.city}{provider.district ? `, ${provider.district}` : ''}</div>
        </div>
        {pts && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>{pts.icon} {pts.label}</span>}
      </div>

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
            <a
              href={buildWhatsAppLink(provider.whatsapp, provider.name)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#25D366', color: '#fff', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
            >
              <span>💬</span> WhatsApp
            </a>
          )}
          {provider.phone && (
            <a
              href={`tel:${provider.phone}`}
              onClick={e => e.stopPropagation()}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: '#eef3fb', color: '#1B3A6B', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 700, textDecoration: 'none', border: '1px solid #d5e2f5' }}
            >
              📞 Call
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// Also show tilers from the original tilers table
function TilerCard({ tiler, onClick }) {
  return (
    <div
      onClick={() => onClick(tiler)}
      style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(27,58,107,0.1)' }}
      onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      <div style={{ padding: '18px 18px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #1B3A6B, #2B5299)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
            {tiler.avatar_url ? <img src={tiler.avatar_url} alt={tiler.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(tiler.full_name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tiler.full_name}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>📍 {tiler.city || tiler.district}</div>
          </div>
          {tiler.is_verified && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>✓ Verified</span>
          )}
        </div>

        {tiler.bio && (
          <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {tiler.bio}
          </p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#eef3fb', color: '#1B3A6B', border: '1px solid #d5e2f5' }}>👷 Tiler</span>
          {(tiler.services || []).slice(0, 2).map(s => (
            <span key={s} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>{s}</span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {tiler.phone && (
            <a
              href={buildWhatsAppLink(tiler.phone, tiler.full_name)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#25D366', color: '#fff', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
            >
              <span>💬</span> WhatsApp
            </a>
          )}
          {tiler.phone && (
            <a
              href={`tel:${tiler.phone}`}
              onClick={e => e.stopPropagation()}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: '#eef3fb', color: '#1B3A6B', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 700, textDecoration: 'none', border: '1px solid #d5e2f5' }}
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
  const phone = item.whatsapp || item.phone
  const pts = !isTiler && PROVIDER_TYPES.find(p => p.value === item.provider_type)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 28 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #1B3A6B, #2B5299)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff', overflow: 'hidden' }}>
              {(isTiler ? item.avatar_url : item.profile_image) ? <img src={isTiler ? item.avatar_url : item.profile_image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(name)}
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{name}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>📍 {(isTiler ? item.city || item.district : item.city || item.district)}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {!isTiler && pts && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#eef3fb', color: '#1B3A6B' }}>{pts.icon} {pts.label}</span>}
          {isTiler && item.is_verified && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#f0fdf4', color: '#16a34a' }}>✓ Verified</span>}
          {!isTiler && <VerificationBadge status={item.verification_status} />}
        </div>

        {(isTiler ? item.bio : item.description) && (
          <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.75, marginBottom: 18, padding: '14px', background: '#f8fafc', borderRadius: 10 }}>
            {isTiler ? item.bio : item.description}
          </p>
        )}

        {(isTiler ? item.services : item.services || []).length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Services</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(isTiler ? item.services : item.services || []).map(s => (
                <span key={s} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: '#eef3fb', color: '#1B3A6B', border: '1px solid #d5e2f5' }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {isTiler && item.experience_years && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
            <div style={{ padding: '10px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1B3A6B' }}>{item.experience_years}+</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>Years Exp.</div>
            </div>
            {item.total_jobs > 0 && (
              <div style={{ padding: '10px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1B3A6B' }}>{item.total_jobs}</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Jobs Done</div>
              </div>
            )}
            {item.daily_rate_min && (
              <div style={{ padding: '10px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1B3A6B' }}>Rs.{item.daily_rate_min}–{item.daily_rate_max}</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Per sq.ft</div>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          {phone && (
            <a href={buildWhatsAppLink(phone, name)} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#25D366', color: '#fff', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              💬 WhatsApp
            </a>
          )}
          {(item.phone || phone) && (
            <a href={`tel:${item.phone || phone}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#eef3fb', color: '#1B3A6B', borderRadius: 12, padding: '13px 20px', fontSize: 14, fontWeight: 700, textDecoration: 'none', border: '1px solid #d5e2f5' }}>
              📞 Call
            </a>
          )}
        </div>
      </div>
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

  // Combined + filtered results
  const showTilers = !type || type === 'tiler'
  const showProviders = !type || type !== 'tiler'

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

  return (
    <div style={{ background: '#f8fafc', minHeight: '60vh' }}>
      {/* Filter bar */}
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
              ✕ Clear
            </button>
          )}
          <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>{total} found</span>
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>⏳</div>
            <p>Loading providers...</p>
          </div>
        ) : total === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>No results found</h3>
            <p style={{ color: '#64748b', marginBottom: 24 }}>Try adjusting your filters or search term</p>
            <button onClick={() => { setSearch(''); setType(''); setDistrict('') }} style={{ padding: '10px 20px', background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
            {filteredProviders.map(p => (
              (p.provider_type === 'tile_shop' || p.provider_type === 'brand_dealer')
                ? <ShopCard key={p.id} provider={p} onClick={item => { setSelected(item); setIsTilerSelected(false) }} />
                : <ProviderCard key={p.id} provider={p} onClick={item => { setSelected(item); setIsTilerSelected(false) }} />
            ))}
            {filteredTilers.map(t => (
              <TilerCard key={t.id} tiler={t} onClick={item => { setSelected(item); setIsTilerSelected(true) }} />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <ProviderModal item={selected} isTiler={isTilerSelected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
