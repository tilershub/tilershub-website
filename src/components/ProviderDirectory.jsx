import { useState, useEffect, useRef } from 'react'
import { supabase, buildWhatsAppLink, DISTRICTS, DISTRICTS_EN, PROVIDER_TYPES, VERIFICATION_BADGES } from '../lib/supabase.js'

// ─── Translations ──────────────────────────────────────────────────────────────
const TRANS = {
  en: {
    searchPh: 'Search by name, service...',
    allDistricts: 'All Districts',
    all: 'All',
    tilersOpt: '🪚 Tilers',
    providersOpt: '👷 Providers',
    clear: label => label ? `✕ Clear (${label})` : '✕ Clear',
    found: n => `${n} found`,
    loading: 'Loading providers...',
    noResults: 'No results found',
    noResultsHint: 'Try adjusting your filters or search term',
    clearSearch: 'Clear Search',
    browseAll: 'Browse All',
    verified: '🛡️ Verified',
    community: 'Community',
    from: 'From',
    yrsExp: 'Yrs Experience',
    yearsExpLabel: 'Years Exp.',
    jobsDoneLabel: 'Jobs Done',
    perSqftLabel: 'Per sq.ft',
    reviewsLabel: n => `${n} reviews`,
    servicesLabel: 'Services',
    portfolioLabel: 'Portfolio',
    serviceAreasLabel: 'Service Areas',
    viewProfile: 'View Profile',
    viewShop: 'View Shop ›',
    whatsapp: '💬 WhatsApp',
    call: '📞 Call',
    altNumber: '💬 Alt. Number',
    skilled: '✓ Skilled',
    unverified: 'Unverified',
    unverifiedNotice: 'ℹ️ This profile was added from community-submitted information and has not yet been verified by TILERSHUB.',
    communityProfile: 'Community-submitted profile — not yet verified by TilersHub.',
    noTypeListed: type => `No ${type} listed yet`,
    noTypeHint: type => `We're onboarding ${type.toLowerCase()} now. Be the first to list yours — free, direct WhatsApp leads.`,
    joinAs: type => `✅ Join as ${type.replace(/s$/, '')}`,
    whatTheyDo: type => `What ${type} Do`,
    otherProviders: '🏪 Other Providers',
    seeAll: 'See all →',
    topRated: '⭐ Top Rated',
  },
  si: {
    searchPh: 'නමින්, සේවාවෙන් සොයන්න...',
    allDistricts: 'සියලු දිස්ත්‍රික්ක',
    all: 'සියල්ල',
    tilersOpt: '🪚 ටයිල් ශිල්පීන්',
    providersOpt: '👷 සේවා සපයන්නන්',
    clear: label => label ? `✕ ඉවත් (${label})` : '✕ ඉවත් කරන්න',
    found: n => `${n} ක් හමු විය`,
    loading: 'Loading...',
    noResults: 'ප්‍රතිඵල නොමැත',
    noResultsHint: 'ෆිල්ටර හෝ සෙවුම් යෙදුම වෙනස් කරන්න',
    clearSearch: 'සෙවුම ඉවත් කරන්න',
    browseAll: 'සියල්ල බලන්න',
    verified: '🛡️ සත්‍යාපිත',
    community: 'ප්‍රජා',
    from: 'සිට',
    yrsExp: 'වසර අත්දැකීම',
    yearsExpLabel: 'අත්දැකීම (වසර)',
    jobsDoneLabel: 'සේවා ගණන',
    perSqftLabel: 'sq.ft. ට',
    reviewsLabel: n => `සමාලෝචන ${n}`,
    servicesLabel: 'සේවාවන්',
    portfolioLabel: 'Portfolio',
    serviceAreasLabel: 'සේවා ප්‍රදේශ',
    viewProfile: 'පූර්ණ විස්තරය',
    viewShop: 'Shop බලන්න ›',
    whatsapp: '💬 WhatsApp',
    call: '📞 ඇමතීම',
    altNumber: '💬 වෙනත් අංකය',
    skilled: '✓ දක්ෂ',
    unverified: 'සත්‍යාපිත නොවේ',
    unverifiedNotice: 'ℹ️ මෙම ගොනුව ප්‍රජාව ඉදිරිපත් කළ තොරතුරු ආශ්‍රිතව TILERSHUB විසින් තවම සත්‍යාපනය කර නොමැත.',
    communityProfile: 'ප්‍රජා-ඉදිරිපත් ගොනුව — TilersHub විසින් තවම සත්‍යාපනය කර නොමැත.',
    noTypeListed: type => `${type} ලැයිස්තු ගත නොවේ`,
    noTypeHint: () => 'නොමිලේ ලැයිස්තු කරන්න. WhatsApp ඇමතුම් ලබාගන්න.',
    joinAs: type => `✅ ${type} ලෙස එකතු වන්න`,
    whatTheyDo: type => `${type} කරන දේ`,
    otherProviders: '🏪 වෙනත් සේවා සපයන්නන්',
    seeAll: 'සියල්ල →',
    topRated: '⭐ Top Rated',
  },
}

const TYPE_LABELS_EN = { tiler: 'Tilers', provider: 'Providers' }
const TYPE_LABELS_SI = { tiler: 'ටයිල් ශිල්පීන්', provider: 'සේවා සපයන්නන්' }

// ─── Language hook ─────────────────────────────────────────────────────────────
function useLang() {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem('tilershub_lang') || 'en' } catch { return 'en' }
  })
  function toggle() {
    const next = lang === 'en' ? 'si' : 'en'
    setLangState(next)
    try { localStorage.setItem('tilershub_lang', next) } catch {}
  }
  return [lang, toggle]
}

function LangToggle({ lang, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{ fontSize: 12, fontWeight: 700, padding: '7px 14px', border: '1.5px solid #e2e8f0', borderRadius: 20, cursor: 'pointer', background: '#fff', color: '#334155', display: 'inline-flex', gap: 6, alignItems: 'center', flexShrink: 0 }}
      title="Switch language / භාෂාව මාරු කරන්න"
    >
      <span style={{ opacity: lang === 'en' ? 1 : 0.35 }}>EN</span>
      <span style={{ opacity: 0.2, fontWeight: 300 }}>|</span>
      <span style={{ opacity: lang === 'si' ? 1 : 0.35 }}>සිං</span>
    </button>
  )
}

// ─── Shared helpers ────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#1B3A6B','#0f766e','#7c3aed','#b45309','#0369a1','#E05A2B','#15803d','#be185d']
function avatarColor(name) {
  let h = 0
  for (const c of (name || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}
function initials(name) {
  return (name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'TH'
}

const VERIFIED_STATUSES = new Set(['th_master', 'th_certified_pro', 'th_verified', 'verified'])

function VerificationBadge({ status }) {
  const b = VERIFICATION_BADGES[status] || VERIFICATION_BADGES.listed
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: b.bg, color: b.color, border: `1px solid ${b.color}30` }}>
      {status === 'th_master' ? '★' : status === 'th_certified_pro' ? '✦' : status === 'th_verified' ? '✓' : '·'} {b.label}
    </span>
  )
}

// ─── Provider type config ───────────────────────────────────────────────────────
const PROVIDER_TYPE_DISPLAY = {
  tiler:        { label: 'Professional' },
  contractor:   { label: 'Contractor'   },
  tile_shop:    { label: 'Tile Shop'    },
  supplier:     { label: 'Supplier'     },
  workshop:     { label: 'Workshop'     },
  brand_dealer: { label: 'Brand Dealer' },
  bathroom_shop:{ label: 'Bathware Shop'},
  tool_supplier:{ label: 'Tool Supplier'},
}

// Shop types use Card 2 (landscape); all others use Card 1 (portrait)
const SHOP_TYPES = new Set(['tile_shop', 'supplier', 'workshop', 'brand_dealer', 'bathroom_shop', 'tool_supplier'])

// ProviderCard routes to the correct card design based on provider_type
function ProviderCard({ provider, onClick, T }) {
  if (SHOP_TYPES.has(provider.provider_type)) {
    return <ShopCard provider={provider} onClick={onClick} T={T} />
  }
  return <ContractorCard provider={provider} onClick={onClick} T={T} />
}

// ─── Shop card ─────────────────────────────────────────────────────────────────
const BATH_KWS = ['bathroom', 'sanitary', 'bathware', 'faucet', 'vanity', 'shower', 'basin', 'toilet', 'bathtub']
const TILE_KWS = ['tile', 'floor', 'wall', 'mosaic', 'porcelain', 'ceramic', 'granite', 'marble']

function shopTagline(type, services) {
  const s = (services || []).join(' ').toLowerCase()
  const hasTile = TILE_KWS.some(k => s.includes(k))
  const hasBath = BATH_KWS.some(k => s.includes(k))
  if (hasTile && hasBath) return 'Tiles & Bathware'
  if (type === 'bathroom_shop') return hasTile ? 'Tiles & Bathware' : 'Bathware Specialist'
  if (type === 'brand_dealer') return 'Authorised Brand Dealer'
  return hasBath ? 'Tiles & Bathware' : 'Tile Showroom'
}

function ShopCard({ provider, onClick, T }) {
  const waPhone = provider.whatsapp || provider.phone
  const waLink = waPhone ? buildWhatsAppLink(waPhone, provider.name) : null
  const tagline = shopTagline(provider.provider_type, provider.services)
  const coverImg = provider.cover_image && !provider.cover_image.includes('picsum') ? provider.cover_image : null
  const typeLabel = PROVIDER_TYPE_DISPLAY[provider.provider_type]?.label || 'Shop'
  const chips = (provider.services || []).slice(0, 4)
  const rating = provider.avg_rating
  const reviewCount = provider.review_count || 0

  return (
    <div
      onClick={() => onClick(provider)}
      style={{ background: '#fff', border: '1px solid #e8edf5', borderRadius: 20, overflow: 'hidden', cursor: 'pointer', display: 'flex', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'all 0.2s', minHeight: 160 }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)' }}
      onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      {/* Left image panel — ~42% width */}
      <div style={{ width: '42%', flexShrink: 0, position: 'relative', minHeight: 160 }}>
        {coverImg ? (
          <img src={coverImg} alt={provider.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#f1f5f9', backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 19px,#e2e8f0 19px,#e2e8f0 20px),repeating-linear-gradient(90deg,transparent,transparent 19px,#e2e8f0 19px,#e2e8f0 20px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 34, opacity: 0.15 }}>🏪</span>
          </div>
        )}
        {/* Gradient overlay on image */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0.45) 100%)' }} />
        {/* Top-left badge */}
        {provider.is_featured && (
          <div style={{ position: 'absolute', top: 9, left: 9, background: '#D4AF37', color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: 0.4, padding: '4px 8px', borderRadius: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
            {T.topRated}
          </div>
        )}
        {!provider.is_featured && VERIFIED_STATUSES.has(provider.verification_status) && (
          <div style={{ position: 'absolute', top: 9, left: 9, background: 'rgba(22,163,74,0.9)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '4px 8px', borderRadius: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.25)', whiteSpace: 'nowrap' }}>
            ✓ Verified
          </div>
        )}
        {/* City overlaid bottom-left */}
        {(provider.city || provider.district) && (
          <div style={{ position: 'absolute', bottom: 8, left: 9, fontSize: 10, fontWeight: 600, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 'calc(100% - 16px)' }}>
            📍 {provider.city || provider.district}
          </div>
        )}
      </div>

      {/* Right content panel */}
      <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 3 }}>{tagline}</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#0f172a', lineHeight: 1.2, marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{provider.name}</div>
        {rating > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 7 }}>
            <span style={{ fontSize: 12 }}>⭐</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>{rating.toFixed(1)}</span>
            {reviewCount > 0 && <span style={{ fontSize: 11, color: '#94a3b8' }}>({reviewCount} reviews)</span>}
          </div>
        )}
        {provider.description && (
          <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6, margin: '0 0 9px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{provider.description}</p>
        )}
        {chips.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
            {chips.map(s => <span key={s} style={{ fontSize: 9, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: '#eef3fb', color: '#1B3A6B', border: '1px solid #d5e2f5' }}>{s}</span>)}
          </div>
        )}
        <div style={{ marginTop: 'auto' }}>
          {provider.slug ? (
            <a href={`/providers/${provider.slug}`} onClick={e => e.stopPropagation()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#0f172a', color: '#fff', borderRadius: 10, padding: '8px 14px', fontSize: 11, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {T.viewShop}
            </a>
          ) : waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#0f172a', color: '#fff', borderRadius: 10, padding: '8px 14px', fontSize: 11, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {T.viewShop}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Tiler card (Card 1 — portrait, full-width image at top) ──────────────────
function TilerCard({ tiler, onClick, T }) {
  const isVerified = tiler.is_verified
  const color = avatarColor(tiler.full_name)
  const inits = initials(tiler.full_name)
  const phone = tiler.whatsapp || tiler.phone
  const coverSrc = (tiler.gallery || [])[0] || tiler.avatar_url

  return (
    <div
      onClick={() => onClick(tiler)}
      style={{ background: '#fff', borderRadius: 20, border: '1px solid #e8edf5', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s,transform 0.2s' }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.12)' }}
      onMouseOut={e  => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      {/* Full-width cover image at top */}
      <div style={{ height: 160, position: 'relative', overflow: 'hidden', background: color }}>
        {coverSrc
          ? <img src={coverSrc} alt={tiler.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 52, fontWeight: 800, color: 'rgba(255,255,255,0.75)' }}>{inits}</span>
            </div>
        }
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.02) 60%, rgba(0,0,0,0.2) 100%)' }} />
        {isVerified && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.22)' }}>
            ✓ Verified
          </div>
        )}
      </div>

      {/* Content below image */}
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Tiler</span>
          {tiler.daily_rate_min > 0 && (
            <span style={{ fontSize: 12, color: '#64748b' }}>From <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Rs.{tiler.daily_rate_min}</span>/day</span>
          )}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 5, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{tiler.full_name}</div>
        {tiler.avg_rating > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
            <span>⭐</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>{tiler.avg_rating.toFixed(1)}</span>
            {tiler.review_count > 0 && <span style={{ fontSize: 12, color: '#94a3b8' }}>({tiler.review_count} reviews)</span>}
          </div>
        )}
        {tiler.speciality && (
          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65, marginBottom: 14, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {tiler.speciality}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid #f1f5f9', paddingTop: 12, flexWrap: 'wrap' }}>
          {tiler.experience_years > 0 && (
            <span style={{ fontSize: 11, color: '#475569', flexShrink: 0 }}><span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span> {tiler.experience_years}+ Yrs Experience</span>
          )}
          {(tiler.city || tiler.district) && (
            <span style={{ fontSize: 11, color: '#475569', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>📍 {tiler.city || tiler.district}</span>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexShrink: 0 }}>
            {phone && (
              <a href={buildWhatsAppLink(phone, tiler.full_name)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                style={{ display: 'inline-flex', alignItems: 'center', background: '#dcfce7', color: '#16a34a', border: '1px solid #86efac', borderRadius: 8, padding: '6px 10px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                💬
              </a>
            )}
            {tiler.slug && (
              <a href={`/tilers/${tiler.slug}`} onClick={e => e.stopPropagation()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#1B3A6B', color: '#fff', borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                View Profile ›
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Contractor card (Card 1 — portrait, full-width image at top) ─────────────
function ContractorCard({ provider, onClick, T }) {
  const color = avatarColor(provider.name)
  const inits = initials(provider.name)
  const phone = provider.whatsapp || provider.phone
  const coverSrc = provider.cover_image || provider.profile_image
  const typeLabel = PROVIDER_TYPE_DISPLAY[provider.provider_type]?.label || 'Contractor'
  const isVerified = VERIFIED_STATUSES.has(provider.verification_status)

  return (
    <div
      onClick={() => onClick(provider)}
      style={{ background: '#fff', borderRadius: 20, border: '1px solid #e8edf5', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s,transform 0.2s' }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.12)' }}
      onMouseOut={e  => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      {/* Full-width cover image at top */}
      <div style={{ height: 160, position: 'relative', overflow: 'hidden', background: color }}>
        {coverSrc
          ? <img src={coverSrc} alt={provider.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 52, fontWeight: 800, color: 'rgba(255,255,255,0.75)' }}>{inits}</span>
            </div>
        }
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.02) 60%, rgba(0,0,0,0.2) 100%)' }} />
        {isVerified && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.22)' }}>
            ✓ Verified
          </div>
        )}
      </div>

      {/* Content below image */}
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{typeLabel}</span>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 5, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{provider.name}</div>
        {provider.avg_rating > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
            <span>⭐</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>{provider.avg_rating.toFixed(1)}</span>
            {provider.review_count > 0 && <span style={{ fontSize: 12, color: '#94a3b8' }}>({provider.review_count} reviews)</span>}
          </div>
        )}
        {provider.description && (
          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65, marginBottom: 14, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {provider.description}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid #f1f5f9', paddingTop: 12, flexWrap: 'wrap' }}>
          {(provider.city || provider.district) && (
            <span style={{ fontSize: 11, color: '#475569', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>📍 {provider.city || provider.district}</span>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexShrink: 0 }}>
            {phone && (
              <a href={buildWhatsAppLink(phone, provider.name)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                style={{ display: 'inline-flex', alignItems: 'center', background: '#dcfce7', color: '#16a34a', border: '1px solid #86efac', borderRadius: 8, padding: '6px 10px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                💬
              </a>
            )}
            {provider.slug && (
              <a href={`/providers/${provider.slug}`} onClick={e => e.stopPropagation()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#1B3A6B', color: '#fff', borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                View Profile ›
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Profile modal ─────────────────────────────────────────────────────────────
function ProviderModal({ item, isTiler, onClose, T }) {
  if (!item) return null
  const name = isTiler ? item.full_name : item.name
  const phone = isTiler ? (item.whatsapp || item.phone) : (item.whatsapp || item.phone)
  const altWaPhone = isTiler && item.whatsapp && item.phone && item.whatsapp !== item.phone ? item.phone : null
  const pts = !isTiler && PROVIDER_TYPES.find(p => p.value === item.provider_type)
  const avatarImage = isTiler ? item.avatar_url : item.profile_image
  const coverImage  = item.cover_image

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ height: 160, position: 'relative', borderRadius: '20px 20px 0 0', overflow: 'hidden' }}>
          {coverImage
            ? <img src={coverImage} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0F2444 0%, #1B3A6B 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(255,255,255,0.8) 19px,rgba(255,255,255,0.8) 20px),repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(255,255,255,0.8) 19px,rgba(255,255,255,0.8) 20px)' }} />
              </>
          }
          {coverImage && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />}
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.35)', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', fontSize: 16, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>✕</button>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: -32, left: 24, width: 64, height: 64, borderRadius: '50%', border: '3px solid #fff', background: '#1B3A6B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }}>
            {avatarImage ? <img src={avatarImage} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(name)}
          </div>
        </div>

        <div style={{ padding: '10px 24px 24px', paddingTop: 40 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>{name}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>📍 {item.city || item.district}{item.district && item.city ? `, ${item.district}` : ''}</div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {!isTiler && pts && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#eef3fb', color: '#1B3A6B' }}>{pts.icon} {pts.label}</span>}
            {isTiler && item.is_verified && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>{T.skilled}</span>}
            {isTiler && !item.is_verified && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#f8fafc', color: '#94a3b8', border: '1px solid #e2e8f0' }}>{T.unverified}</span>}
            {!isTiler && <VerificationBadge status={item.verification_status} />}
          </div>

          {isTiler && !item.is_verified && (
            <div style={{ fontSize: 12, color: '#78716c', background: '#fef9f0', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', marginBottom: 16, lineHeight: 1.6 }}>
              {T.unverifiedNotice}
            </div>
          )}

          {(isTiler ? item.bio : item.description) && (
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.75, marginBottom: 18, padding: 14, background: '#f8fafc', borderRadius: 10 }}>
              {isTiler ? item.bio : item.description}
            </p>
          )}

          {isTiler && (item.experience_years || item.total_jobs || item.daily_rate_min) && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
              {item.experience_years > 0 && (
                <div style={{ padding: '10px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#1B3A6B' }}>{item.experience_years}+</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{T.yearsExpLabel}</div>
                </div>
              )}
              {item.total_jobs > 0 && (
                <div style={{ padding: '10px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#1B3A6B' }}>{item.total_jobs}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{T.jobsDoneLabel}</div>
                </div>
              )}
              {item.daily_rate_min && (
                <div style={{ padding: '10px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1B3A6B' }}>Rs.{item.daily_rate_min}–{item.daily_rate_max || '?'}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{T.perSqftLabel}</div>
                </div>
              )}
              {item.avg_rating > 0 && (
                <div style={{ padding: '10px 16px', background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a', textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#92400e' }}>⭐ {item.avg_rating.toFixed(1)}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{T.reviewsLabel(item.review_count || 0)}</div>
                </div>
              )}
            </div>
          )}

          {(item.services || []).length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>{T.servicesLabel}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(item.services || []).map(s => (
                  <span key={s} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: '#eef3fb', color: '#1B3A6B', border: '1px solid #d5e2f5' }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {(() => {
            const imgs = item.gallery || item.photo_urls || []
            if (!imgs.length) return null
            return (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>{T.portfolioLabel}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 6 }}>
                  {imgs.map((img, i) => <img key={i} src={img} alt="" style={{ width: '100%', aspectRatio: '1', borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }} />)}
                </div>
              </div>
            )
          })()}

          {(item.service_areas || []).length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>{T.serviceAreasLabel}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(item.service_areas || []).map(a => (
                  <span key={a} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: '#f1f5f9', color: '#334155' }}>{a}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            {phone && (
              <a href={buildWhatsAppLink(phone, name)} target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#25D366', color: '#fff', borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                {T.whatsapp}
              </a>
            )}
          </div>
          {altWaPhone && (
            <a href={buildWhatsAppLink(altWaPhone, name)} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginTop: 8, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 12, padding: 11, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              {T.altNumber}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Suggested content (empty state) ──────────────────────────────────────────
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

function SuggestedContent({ type, tilers, providers, onSelectTiler, onSelectProvider, T }) {
  const infoCards = TYPE_INFO_CARDS[type] || []
  const otherProviders = providers.filter(p => p.provider_type !== type).slice(0, 3)
  const typeLabel = TYPE_LABELS_EN[type] || type || 'Providers'

  return (
    <div>
      <div style={{ background: '#fff', borderRadius: 16, border: '2px dashed #e2e8f0', padding: '36px 24px', textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🏗️</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
          {T.noTypeListed(typeLabel)}
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20, maxWidth: 360, margin: '0 auto 20px' }}>
          {T.noTypeHint(typeLabel)}
        </p>
        <a href="/join-tilershub" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#E05A2B', color: '#fff', borderRadius: 10, padding: '10px 22px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
          {T.joinAs(typeLabel)}
        </a>
      </div>

      {infoCards.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
            {T.whatTheyDo(typeLabel)}
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

      {otherProviders.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>{T.otherProviders}</div>
            <a href="/providers" style={{ fontSize: 12, color: '#1B3A6B', fontWeight: 600, textDecoration: 'none' }}>{T.seeAll}</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {otherProviders.map(p => <ProviderCard key={p.id} provider={p} onClick={onSelectProvider} T={T} />)}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function ProviderDirectory({ initialType, initialSearch }) {
  const [lang, toggleLang] = useLang()
  const T = TRANS[lang]

  const [tilers,    setTilers]    = useState([])
  const [providers, setProviders] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [inputValue, setInputValue] = useState(initialSearch || '')
  const [search,    setSearch]    = useState(initialSearch || '')
  const [district,  setDistrict]  = useState('')
  const [type,      setType]      = useState(initialType || '')
  const [selected,  setSelected]  = useState(null)
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

  const showTilers    = !type || type === 'tiler'
  const showProviders = !type || type === 'provider'

  const filteredTilers = showTilers ? tilers.filter(t => {
    if (district && t.district !== district) return false
    if (search) {
      const q = search.toLowerCase()
      return t.full_name?.toLowerCase().includes(q) || t.district?.toLowerCase().includes(q) || (t.services || []).some(s => s.toLowerCase().includes(q))
    }
    return true
  }) : []

  const filteredProviders = showProviders ? providers.filter(p => {
    if (district && p.district !== district && !(p.service_areas || []).includes(district)) return false
    if (search) {
      const q = search.toLowerCase()
      return p.name?.toLowerCase().includes(q) || p.city?.toLowerCase().includes(q) || (p.services || []).some(s => s.toLowerCase().includes(q))
    }
    return true
  }) : []

  const total = filteredTilers.length + filteredProviders.length


  // Merge + sort: verified/featured first across both tilers and providers
  const allCards = [
    ...filteredProviders.map(p => {
      const verified = VERIFIED_STATUSES.has(p.verification_status)
      return { ...p, _kind: 'provider', _score: (p.is_featured ? 2 : 0) + (verified ? 1 : 0) }
    }),
    ...filteredTilers.map(t => ({
      ...t, _kind: 'tiler', _score: (t.featured ? 2 : 0) + (t.is_verified ? 1 : 0)
    })),
  ].sort((a, b) => b._score - a._score)

  const clearLabel = type && !inputValue && !district
    ? (lang === 'si' ? TYPE_LABELS_SI[type] : TYPE_LABELS_EN[type]) || type
    : null

  return (
    <div style={{ background: '#f8fafc', minHeight: '60vh' }}>
      {/* Sticky filter bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 0', position: 'sticky', top: 64, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
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
              placeholder={T.searchPh}
              style={{ width: '100%', padding: '9px 12px 9px 32px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
              onFocus={e => e.target.style.borderColor = '#1B3A6B'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          {/* Type filter */}
          <select value={type} onChange={e => setType(e.target.value)} style={{ padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, outline: 'none', background: '#fff', fontFamily: 'inherit', cursor: 'pointer' }}>
            <option value="">{T.all}</option>
            <option value="tiler">{T.tilersOpt}</option>
            <option value="provider">{T.providersOpt}</option>
          </select>

          {/* District filter */}
          <select value={district} onChange={e => setDistrict(e.target.value)} style={{ padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, outline: 'none', background: '#fff', fontFamily: 'inherit', cursor: 'pointer' }}>
            <option value="">{T.allDistricts}</option>
            {DISTRICTS_EN.map((d, i) => (
              <option key={d} value={d}>{lang === 'si' ? DISTRICTS[i] : d}</option>
            ))}
          </select>

          {(inputValue || type || district) && (
            <button onClick={() => { setInputValue(''); setSearch(''); setType(''); setDistrict('') }} style={{ padding: '9px 14px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {T.clear(clearLabel)}
            </button>
          )}

          <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>{T.found(total)}</span>

          {/* Language toggle */}
          <LangToggle lang={lang} onToggle={toggleLang} />
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>⏳</div>
            <p>{T.loading}</p>
          </div>
        ) : total === 0 ? (
          type && type !== 'tiler' && !search && !district ? (
            <SuggestedContent
              type={type} tilers={tilers} providers={providers}
              onSelectTiler={item => { setSelected(item); setIsTilerSelected(true) }}
              onSelectProvider={item => { setSelected(item); setIsTilerSelected(false) }}
              T={T}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{T.noResults}</h3>
              <p style={{ color: '#64748b', marginBottom: 24 }}>{T.noResultsHint}</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                {(search || district) && (
                  <button onClick={() => { setSearch(''); setInputValue(''); setDistrict('') }} style={{ padding: '10px 20px', background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    {T.clearSearch}
                  </button>
                )}
                <a href="/providers" style={{ padding: '10px 20px', background: '#f1f5f9', color: '#334155', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                  {T.browseAll}
                </a>
              </div>
            </div>
          )
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {allCards.map(item => item._kind === 'tiler'
              ? <TilerCard key={`t-${item.id}`} tiler={item} T={T} onClick={t => { setSelected(t); setIsTilerSelected(true) }} />
              : <ProviderCard key={`p-${item.id}`} provider={item} T={T} onClick={p => { setSelected(p); setIsTilerSelected(false) }} />
            )}
          </div>
        )}
      </div>

      {selected && (
        <ProviderModal item={selected} isTiler={isTilerSelected} onClose={() => setSelected(null)} T={T} />
      )}
    </div>
  )
}
