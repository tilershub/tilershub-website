import { useState } from 'react'

const ALL_SERVICES = [
  { slug: 'bathroom-renovation',     icon: '🚿', label: 'Bathroom Renovation',      cat: 'bathroom' },
  { slug: 'bathroom-plumbing',       icon: '🚽', label: 'Bathroom Plumbing',         cat: 'bathroom' },
  { slug: 'bathroom-lighting',       icon: '💡', label: 'Bathroom Lighting',         cat: 'bathroom' },
  { slug: 'shower-cubicle',          icon: '🚿', label: 'Shower Cubicle',            cat: 'bathroom' },
  { slug: 'bathroom-mirrors',        icon: '🪞', label: 'Bathroom Mirrors',          cat: 'bathroom' },
  { slug: 'vanity-cupboard',         icon: '🗄️', label: 'Vanity Cupboard',           cat: 'bathroom' },
  { slug: 'waterproofing',           icon: '💧', label: 'Waterproofing',             cat: 'bathroom' },
  { slug: 'floor-tiling',            icon: '⬜', label: 'Floor Tiling',              cat: 'flooring' },
  { slug: 'large-format-tiling',     icon: '📏', label: 'Large Format Tiling',       cat: 'flooring' },
  { slug: 'mosaic-tiling',           icon: '🎨', label: 'Mosaic Tiling',             cat: 'flooring' },
  { slug: 'pool-tiling',             icon: '🏊', label: 'Pool Tiling',               cat: 'flooring' },
  { slug: 'outdoor-tiling',          icon: '🏡', label: 'Outdoor Tiling',            cat: 'flooring' },
  { slug: 'tile-cutting-routering',  icon: '🧱', label: 'Tile Cutting & Routering',  cat: 'flooring' },
  { slug: 'glass-railing',           icon: '✨', label: 'Glass Railing',             cat: 'glass' },
  { slug: 'aluminium-glass-works',   icon: '🪟', label: 'Aluminium & Glass Works',   cat: 'glass' },
  { slug: 'aluminium-doors-windows', icon: '🚪', label: 'Aluminium Doors & Windows', cat: 'glass' },
  { slug: 'ipanel-ceiling',          icon: '🏠', label: 'IPanel Ceiling',            cat: 'glass' },
  { slug: 'house-painting',          icon: '🎨', label: 'House Painting',            cat: 'trades' },
  { slug: 'furniture-painting',      icon: '🪑', label: 'Furniture Painting',        cat: 'trades' },
  { slug: 'house-lighting',          icon: '💡', label: 'House Lighting',            cat: 'trades' },
  { slug: 'house-wiring',            icon: '⚡', label: 'House Wiring',             cat: 'trades' },
  { slug: 'electrical-repairs',      icon: '🔌', label: 'Electrical Repairs',        cat: 'trades' },
  { slug: 'granite-countertops',     icon: '🪨', label: 'Granite Countertops',       cat: 'flooring' },
  { slug: 'landscaping-gardening',   icon: '🌿', label: 'Landscaping & Gardening',   cat: 'outdoor' },
  { slug: 'carpentry-works',         icon: '🪵', label: 'Carpentry Works',           cat: 'construction' },
  { slug: 'debris-removal',          icon: '🚛', label: 'Debris Removal',            cat: 'construction' },
  { slug: 'demolition-work',         icon: '⚒️', label: 'Demolition Work',           cat: 'construction' },
  { slug: 'site-cleaning',           icon: '🧹', label: 'Site Cleaning',             cat: 'construction' },
  { slug: 'gypsum-ceiling',             icon: '🏛️', label: 'Gypsum Ceiling',              cat: 'glass' },
  // Phase 1
  { slug: 'kitchen-renovation',         icon: '🍳', label: 'Kitchen Renovation',          cat: 'kitchen' },
  { slug: 'air-conditioning',           icon: '❄️', label: 'Air Conditioning',            cat: 'trades' },
  { slug: 'roofing',                    icon: '🏚️', label: 'Roofing',                     cat: 'construction' },
  { slug: 'solar-panels',               icon: '☀️', label: 'Solar Panels',               cat: 'trades' },
  { slug: 'plastering-skimming',        icon: '🪣', label: 'Plastering & Skimming',      cat: 'construction' },
  { slug: 'gate-fencing',               icon: '🚧', label: 'Gate & Fencing',             cat: 'glass' },
  { slug: 'cctv-security',              icon: '📷', label: 'CCTV & Security',            cat: 'trades' },
  // Phase 2
  { slug: 'epoxy-flooring',             icon: '🟤', label: 'Epoxy Flooring',             cat: 'flooring' },
  { slug: 'parquet-laminate',           icon: '🪵', label: 'Parquet / Laminate',         cat: 'flooring' },
  { slug: 'partition-walls',            icon: '🧱', label: 'Partition Walls',            cat: 'construction' },
  { slug: 'water-tank-installation',    icon: '💦', label: 'Water Tank Installation',    cat: 'construction' },
  { slug: 'kitchen-cabinets',           icon: '🗄️', label: 'Kitchen Cabinets',           cat: 'kitchen' },
  { slug: 'concrete-masonry',           icon: '🏗️', label: 'Concrete & Masonry',         cat: 'construction' },
  { slug: 'vinyl-flooring',             icon: '🟦', label: 'Vinyl Flooring',             cat: 'flooring' },
  // Phase 3
  { slug: 'swimming-pool-construction', icon: '🏊', label: 'Swimming Pool',              cat: 'outdoor' },
  { slug: 'smart-home-automation',      icon: '🏠', label: 'Smart Home',                 cat: 'trades' },
  { slug: 'paving-driveways',           icon: '🛤️', label: 'Paving & Driveways',         cat: 'outdoor' },
  { slug: 'pergola-shade',              icon: '⛱️', label: 'Pergola & Shade',            cat: 'outdoor' },
]

const TABS = [
  { id: 'all',          label: 'All',              icon: '☰',  color: '#1B3A6B', bg: '#eef3fb' },
  { id: 'bathroom',     label: 'Bathroom',          icon: '🚿', color: '#0369a1', bg: '#e0f2fe' },
  { id: 'flooring',     label: 'Flooring',          icon: '⬜', color: '#0f766e', bg: '#f0fdfa' },
  { id: 'kitchen',      label: 'Kitchen',           icon: '🍳', color: '#b45309', bg: '#fff7ed' },
  { id: 'glass',        label: 'Glass & Aluminium', icon: '🪟', color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'construction', label: 'Construction',      icon: '🏗️', color: '#374151', bg: '#f8fafc' },
  { id: 'outdoor',      label: 'Outdoor',           icon: '🌿', color: '#15803d', bg: '#f0fdf4' },
  { id: 'trades',       label: 'Trades & More',     icon: '🎨', color: '#b45309', bg: '#fff7ed' },
]

export default function ServiceTabs() {
  const [active, setActive] = useState('all')

  const shown = active === 'all'
    ? ALL_SERVICES.slice(0, 16)
    : ALL_SERVICES.filter(s => s.cat === active)

  const activeTab = TABS.find(t => t.id === active)

  return (
    <section style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '16px 16px 18px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>
          {active === 'all' ? 'Popular Services' : TABS.find(t => t.id === active)?.label + ' Services'}
        </span>
        <a href={active === 'all' ? '/providers' : `/providers?q=${TABS.find(t=>t.id===active)?.label}`}
          style={{ fontSize: 12, fontWeight: 600, color: '#E05A2B', textDecoration: 'none' }}>
          View All ›
        </a>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 12, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '7px 13px', borderRadius: 20,
              fontSize: 12, fontWeight: 700,
              whiteSpace: 'nowrap', cursor: 'pointer',
              flexShrink: 0, border: 'none',
              background: active === tab.id ? activeTab?.color || '#1B3A6B' : '#f8fafc',
              color: active === tab.id ? '#fff' : '#374151',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 13 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Services grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {shown.map(s => (
          <a key={s.slug} href={`/services/${s.slug}`}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 7, padding: '12px 4px 10px', borderRadius: 14,
              background: '#f8fafc', textDecoration: 'none',
              border: '1px solid #f1f5f9',
            }}
            onMouseOver={e => { e.currentTarget.style.background = activeTab?.bg || '#eef3fb'; e.currentTarget.style.borderColor = '#e2e8f0' }}
            onMouseOut={e  => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#f1f5f9' }}
          >
            <div style={{ width: 46, height: 46, borderRadius: 13, background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              {s.icon}
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#374151', textAlign: 'center', lineHeight: 1.35 }}>{s.label}</span>
          </a>
        ))}
      </div>
    </section>
  )
}
