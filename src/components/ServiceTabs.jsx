import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const ALL_SERVICES = [
  { slug: 'floor-tiling',               icon: '⬜', label: 'Floor Tiling',              cat: 'flooring' },
  { slug: 'large-format-tiling',        icon: '📏', label: 'Large Format Tiling',       cat: 'flooring' },
  { slug: 'mosaic-tiling',              icon: '🎨', label: 'Mosaic Tiling',             cat: 'flooring' },
  { slug: 'pool-tiling',                icon: '🏊', label: 'Pool Tiling',               cat: 'flooring' },
  { slug: 'outdoor-tiling',             icon: '🏡', label: 'Outdoor Tiling',            cat: 'flooring' },
  { slug: 'tile-cutting-routering',     icon: '🧱', label: 'Tile Cutting',              cat: 'flooring' },
  { slug: 'epoxy-flooring',             icon: '🟤', label: 'Epoxy Flooring',            cat: 'flooring' },
  { slug: 'parquet-laminate',           icon: '🪵', label: 'Parquet / Laminate',        cat: 'flooring' },
  { slug: 'vinyl-flooring',             icon: '🟦', label: 'Vinyl Flooring',            cat: 'flooring' },
  { slug: 'granite-countertops',        icon: '🪨', label: 'Granite Countertops',       cat: 'flooring' },

  { slug: 'bathroom-renovation',        icon: '🚿', label: 'Bathroom Renovation',       cat: 'bathroom' },
  { slug: 'bathroom-plumbing',          icon: '🚽', label: 'Bathroom Plumbing',         cat: 'bathroom' },
  { slug: 'bathroom-lighting',          icon: '💡', label: 'Bathroom Lighting',         cat: 'bathroom' },
  { slug: 'shower-cubicle',             icon: '🚿', label: 'Shower Cubicle',            cat: 'bathroom' },
  { slug: 'bathroom-mirrors',           icon: '🪞', label: 'Bathroom Mirrors',          cat: 'bathroom' },
  { slug: 'vanity-cupboard',            icon: '🗄️', label: 'Vanity Cupboard',           cat: 'bathroom' },
  { slug: 'waterproofing',              icon: '💧', label: 'Waterproofing',             cat: 'bathroom' },

  { slug: 'kitchen-renovation',         icon: '🍳', label: 'Kitchen Renovation',        cat: 'kitchen' },
  { slug: 'kitchen-cabinets',           icon: '🗄️', label: 'Kitchen Cabinets',          cat: 'kitchen' },

  { slug: 'glass-railing',              icon: '✨', label: 'Glass Railing',             cat: 'glass' },
  { slug: 'aluminium-glass-works',      icon: '🪟', label: 'Aluminium & Glass Works',   cat: 'glass' },
  { slug: 'aluminium-doors-windows',    icon: '🚪', label: 'Doors & Windows',           cat: 'glass' },
  { slug: 'ipanel-ceiling',             icon: '🏠', label: 'IPanel Ceiling',            cat: 'glass' },
  { slug: 'gypsum-ceiling',             icon: '🏛️', label: 'Gypsum Ceiling',            cat: 'glass' },
  { slug: 'gate-fencing',               icon: '🚧', label: 'Gate & Fencing',            cat: 'glass' },

  { slug: 'roofing',                    icon: '🏚️', label: 'Roofing',                   cat: 'construction' },
  { slug: 'plastering-skimming',        icon: '🪣', label: 'Plastering & Skimming',     cat: 'construction' },
  { slug: 'partition-walls',            icon: '🧱', label: 'Partition Walls',           cat: 'construction' },
  { slug: 'water-tank-installation',    icon: '💦', label: 'Water Tank',               cat: 'construction' },
  { slug: 'concrete-masonry',           icon: '🏗️', label: 'Concrete & Masonry',        cat: 'construction' },
  { slug: 'carpentry-works',            icon: '🪵', label: 'Carpentry Works',           cat: 'construction' },
  { slug: 'debris-removal',             icon: '🚛', label: 'Debris Removal',            cat: 'construction' },
  { slug: 'demolition-work',            icon: '⚒️', label: 'Demolition Work',           cat: 'construction' },
  { slug: 'site-cleaning',              icon: '🧹', label: 'Site Cleaning',             cat: 'construction' },

  { slug: 'landscaping-gardening',      icon: '🌿', label: 'Landscaping',               cat: 'outdoor' },
  { slug: 'swimming-pool-construction', icon: '🏊', label: 'Swimming Pool',             cat: 'outdoor' },
  { slug: 'paving-driveways',           icon: '🛤️', label: 'Paving & Driveways',        cat: 'outdoor' },
  { slug: 'pergola-shade',              icon: '⛱️', label: 'Pergola & Shade',           cat: 'outdoor' },

  { slug: 'house-painting',             icon: '🎨', label: 'House Painting',            cat: 'trades' },
  { slug: 'furniture-painting',         icon: '🪑', label: 'Furniture Painting',        cat: 'trades' },
  { slug: 'house-lighting',             icon: '💡', label: 'House Lighting',            cat: 'trades' },
  { slug: 'house-wiring',               icon: '⚡', label: 'House Wiring',             cat: 'trades' },
  { slug: 'electrical-repairs',         icon: '🔌', label: 'Electrical Repairs',        cat: 'trades' },
  { slug: 'air-conditioning',           icon: '❄️', label: 'Air Conditioning',          cat: 'trades' },
  { slug: 'solar-panels',               icon: '☀️', label: 'Solar Panels',             cat: 'trades' },
  { slug: 'cctv-security',              icon: '📷', label: 'CCTV & Security',           cat: 'trades' },
  { slug: 'smart-home-automation',      icon: '🏠', label: 'Smart Home',               cat: 'trades' },
]

const CATEGORIES = [
  {
    id: 'flooring',
    label: 'Tiling Services',
    icon: '⬜',
    color: '#0f766e',
    bg: '#f0fdfa',
    border: '#99f6e4',
    terms: ['floor', 'tiling', 'tile', 'mosaic', 'epoxy', 'parquet', 'laminate', 'vinyl', 'granite', 'staircase'],
    blogSlugs: ['large-format-tiles-guide', 'best-tiles-for-bathroom-floor'],
  },
  {
    id: 'bathroom',
    label: 'Bathroom Services',
    icon: '🚿',
    color: '#0369a1',
    bg: '#e0f2fe',
    border: '#7dd3fc',
    terms: ['bathroom', 'bath', 'shower', 'vanity', 'plumbing', 'waterproof', 'mirror'],
    blogSlugs: ['bathroom-renovation-cost-sri-lanka', 'waterproofing-bathroom-guide'],
  },
  {
    id: 'kitchen',
    label: 'Kitchen Services',
    icon: '🍳',
    color: '#b45309',
    bg: '#fff7ed',
    border: '#fed7aa',
    terms: ['kitchen', 'cabinet', 'splashback'],
    blogSlugs: ['how-to-choose-a-tiler', 'post-tiling-project-tilershub'],
  },
  {
    id: 'glass',
    label: 'Glass & Aluminium',
    icon: '🪟',
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    terms: ['glass', 'aluminium', 'aluminum', 'railing', 'ceiling', 'ipanel', 'gypsum', 'gate', 'fencing', 'door', 'window'],
    blogSlugs: ['how-to-choose-a-tiler', 'best-tiles-for-bathroom-floor'],
  },
  {
    id: 'construction',
    label: 'Construction Services',
    icon: '🏗️',
    color: '#374151',
    bg: '#f8fafc',
    border: '#e2e8f0',
    terms: ['roof', 'plaster', 'partition', 'water tank', 'concrete', 'masonry', 'carpentry', 'debris', 'demolition', 'cleaning', 'construction'],
    blogSlugs: ['how-to-choose-a-tiler', 'post-tiling-project-tilershub'],
  },
  {
    id: 'outdoor',
    label: 'Outdoor Services',
    icon: '🌿',
    color: '#15803d',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    terms: ['outdoor', 'landscape', 'garden', 'pool', 'paving', 'driveway', 'pergola', 'shade'],
    blogSlugs: ['large-format-tiles-guide', 'post-tiling-project-tilershub'],
  },
  {
    id: 'trades',
    label: 'Trades & More',
    icon: '🎨',
    color: '#c2410c',
    bg: '#fff7ed',
    border: '#fed7aa',
    terms: ['paint', 'lighting', 'wiring', 'electrical', 'air condition', 'solar', 'cctv', 'security', 'smart home', 'automation'],
    blogSlugs: ['how-to-choose-a-tiler', 'post-tiling-project-tilershub'],
  },
]

const AVATAR_COLORS = ['#1B3A6B','#0f766e','#7c3aed','#b45309','#0369a1','#E05A2B','#15803d','#be185d']
function avatarColor(name) {
  let h = 0
  for (const c of (name || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}
function initials(name) {
  return (name || '').split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?'
}
function waLink(phone, name) {
  const cleaned = (phone || '').replace(/\D/g, '')
  const intl = cleaned.startsWith('0') ? '94' + cleaned.slice(1) : cleaned
  return `https://wa.me/${intl}?text=${encodeURIComponent(`Hi ${name}, I found you on TilersHub.`)}`
}
function timeAgo(ts) {
  const days = Math.floor((Date.now() - new Date(ts)) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1d ago'
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

function providerMatchesCat(p, cat) {
  const text = [
    ...(p.services || []),
    p.description || p.bio || '',
  ].join(' ').toLowerCase()
  return cat.terms.some(t => text.includes(t))
}

function projectMatchesCat(proj, cat) {
  const type = (proj.project_type || '').toLowerCase()
  return cat.terms.some(t => type.includes(t))
}

// ─── Cards ──────────────────────────────────────────────────────────────────

function ProviderCard({ p }) {
  const name = p.name || p.full_name || 'Provider'
  const color = avatarColor(name)
  const img = p.profile_image || p.avatar_url
  const phone = p.whatsapp || p.phone
  const verified = ['th_master','th_certified_pro','th_verified'].includes(p.verification_status) || p.is_verified
  const href = p.slug ? `/providers/${p.slug}` : null
  const chips = (p.services || []).slice(0, 3)

  return (
    <div style={{ flexShrink: 0, width: 280, background: '#fff', borderRadius: 20, border: '1px solid #e8edf5', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex' }}>
      {/* Coloured avatar panel */}
      <div style={{ width: 90, flexShrink: 0, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 130, overflow: 'hidden' }}>
        {img
          ? <img src={img} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          : <span style={{ fontSize: 30, fontWeight: 800, color: 'rgba(255,255,255,0.85)' }}>{initials(name)}</span>
        }
      </div>
      {/* Info panel */}
      <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', lineHeight: 1.25 }}>{name}</span>
          {verified && <span style={{ fontSize: 8, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, padding: '2px 7px', flexShrink: 0, marginTop: 2 }}>✓ Pro</span>}
        </div>
        {(p.city || p.district) && <div style={{ fontSize: 11, color: '#64748b', marginBottom: 5 }}>📍 {p.city || p.district}</div>}
        {(p.description || p.bio) && <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>{p.description || p.bio}</div>}
        {chips.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {chips.map(s => <span key={s} style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: '#eef3fb', color: '#1B3A6B', border: '1px solid #d5e2f5' }}>{s}</span>)}
          </div>
        )}
        {p.avg_rating > 0 && <div style={{ fontSize: 11, color: '#f59e0b', marginBottom: 8 }}>⭐ {Number(p.avg_rating).toFixed(1)}</div>}
        <div style={{ marginTop: 'auto' }}>
          {phone
            ? <a href={waLink(phone, name)} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#25D366', color: '#fff', borderRadius: 10, padding: '7px 14px', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
                💬 WhatsApp
              </a>
            : href
              ? <a href={href} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#1B3A6B', color: '#fff', borderRadius: 10, padding: '7px 14px', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
                  View Profile ›
                </a>
              : null
          }
        </div>
      </div>
    </div>
  )
}

function BlogCard({ post }) {
  return (
    <a href={`/blog/${post.slug}`}
      style={{ flexShrink: 0, width: 195, background: '#fff', borderRadius: 16, border: '1px solid #e8edf5', overflow: 'hidden', textDecoration: 'none', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ height: 56, background: `${post.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
        {post.icon}
      </div>
      <div style={{ padding: '9px 11px 11px', flex: 1 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#E05A2B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{post.category}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 6 }}>{post.title}</div>
        <div style={{ fontSize: 10, color: '#94a3b8' }}>{post.readTime} →</div>
      </div>
    </a>
  )
}

function ProjectCard({ proj }) {
  const TYPE_ICONS = { Bathroom: '🚿', Floor: '⬜', Kitchen: '🍳', Roof: '🏚️', Paint: '🎨', Tile: '🪨', Pool: '🏊', Garden: '🌿', Electrical: '⚡', Waterproof: '💧', Gypsum: '🏛️', Glass: '🪟', Air: '❄️', Solar: '☀️', CCTV: '📷' }
  const icon = Object.entries(TYPE_ICONS).find(([k]) => (proj.project_type || '').includes(k))?.[1] || '📋'

  return (
    <a href={`/job?id=${proj.id}`}
      style={{ flexShrink: 0, width: 172, background: '#fff', borderRadius: 16, border: '1px solid #e8edf5', padding: '11px 12px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 5, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
        <span style={{ fontSize: 20, lineHeight: 1.2, flexShrink: 0 }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{proj.project_type}</span>
      </div>
      {(proj.city || proj.district) && <div style={{ fontSize: 10, color: '#64748b' }}>📍 {proj.city || proj.district}</div>}
      {proj.budget && (
        <div style={{ fontSize: 10, fontWeight: 600, color: '#0f766e', background: '#f0fdfa', borderRadius: 6, padding: '2px 7px', alignSelf: 'flex-start' }}>
          Rs. {Number(proj.budget).toLocaleString()}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 2 }}>
        <span style={{ fontSize: 9, color: '#94a3b8' }}>{timeAgo(proj.created_at)}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#E05A2B', background: '#fff5f0', borderRadius: 6, padding: '2px 6px' }}>Bid Now →</span>
      </div>
    </a>
  )
}

function SkeletonCards({ count, width, height = 130 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} style={{ flexShrink: 0, width, height, borderRadius: 16, background: '#f1f5f9' }} />
  ))
}

function HRow({ children }) {
  return (
    <div style={{ display: 'flex', gap: 9, overflowX: 'auto', padding: '0 16px 12px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {children}
    </div>
  )
}

function SubLabel({ label, href, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 7px' }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: color || '#374151', textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</span>
      {href && <a href={href} style={{ fontSize: 11, color: '#E05A2B', fontWeight: 600, textDecoration: 'none' }}>See all ›</a>}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function ServiceTabs() {
  const [allProviders, setAllProviders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('providers')
      .select('id,name,city,district,slug,description,services,provider_type,whatsapp,phone,profile_image,verification_status,avg_rating')
      .eq('status', 'active').limit(300)
      .then(({ data }) => {
        setAllProviders(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <section style={{ background: '#f1f5f9' }}>

      <div style={{ padding: '13px 16px 10px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Browse Services</span>
        <a href="/providers" style={{ fontSize: 12, fontWeight: 600, color: '#E05A2B', textDecoration: 'none' }}>All Providers ›</a>
      </div>

      {CATEGORIES.map(cat => {
        const BADGE_ORDER = { th_master: 0, th_certified_pro: 1, th_verified: 2, verified: 2, listed: 3 }
        const badgeRank = p => BADGE_ORDER[p.verification_status] ?? (p.is_verified ? 2 : 4)
        const providers = allProviders
          .filter(p => providerMatchesCat(p, cat))
          .sort((a, b) => badgeRank(a) - badgeRank(b))
          .slice(0, 4)

        return (
          <div key={cat.id} style={{ background: '#fff', marginBottom: 8, paddingBottom: 4 }}>

            {/* ── Category header ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: cat.bg, border: `1px solid ${cat.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>
                  {cat.icon}
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: cat.color }}>{cat.label}</span>
              </div>
              <a href={`/providers?q=${encodeURIComponent(cat.label.replace(' Services', ''))}`}
                style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textDecoration: 'none' }}>
                View All ›
              </a>
            </div>

            {/* ── Providers ── */}
            <HRow>
              {loading
                ? <SkeletonCards count={4} width={280} height={130} />
                : providers.length > 0
                  ? providers.map(p => <ProviderCard key={p.id} p={p} />)
                  : <div style={{ fontSize: 12, color: '#94a3b8', padding: '8px 0' }}>
                      No providers yet — <a href="/join-tilershub" style={{ color: '#E05A2B', textDecoration: 'none', fontWeight: 600 }}>Join TilersHub</a>
                    </div>
              }
            </HRow>

          </div>
        )
      })}
    </section>
  )
}
