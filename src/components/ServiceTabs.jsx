const ALL_SERVICES = [
  { slug: 'floor-tiling',               icon: '⬜', label: 'Floor Tiling',              cat: 'flooring' },
  { slug: 'large-format-tiling',        icon: '📏', label: 'Large Format Tiling',       cat: 'flooring' },
  { slug: 'mosaic-tiling',              icon: '🎨', label: 'Mosaic Tiling',             cat: 'flooring' },
  { slug: 'pool-tiling',                icon: '🏊', label: 'Pool Tiling',               cat: 'flooring' },
  { slug: 'outdoor-tiling',             icon: '🏡', label: 'Outdoor Tiling',            cat: 'flooring' },
  { slug: 'tile-cutting-routering',     icon: '🧱', label: 'Tile Cutting & Routering',  cat: 'flooring' },
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
  { slug: 'aluminium-doors-windows',    icon: '🚪', label: 'Aluminium Doors & Windows', cat: 'glass' },
  { slug: 'ipanel-ceiling',             icon: '🏠', label: 'IPanel Ceiling',            cat: 'glass' },
  { slug: 'gypsum-ceiling',             icon: '🏛️', label: 'Gypsum Ceiling',            cat: 'glass' },
  { slug: 'gate-fencing',               icon: '🚧', label: 'Gate & Fencing',            cat: 'glass' },

  { slug: 'roofing',                    icon: '🏚️', label: 'Roofing',                   cat: 'construction' },
  { slug: 'plastering-skimming',        icon: '🪣', label: 'Plastering & Skimming',     cat: 'construction' },
  { slug: 'partition-walls',            icon: '🧱', label: 'Partition Walls',           cat: 'construction' },
  { slug: 'water-tank-installation',    icon: '💦', label: 'Water Tank Installation',   cat: 'construction' },
  { slug: 'concrete-masonry',           icon: '🏗️', label: 'Concrete & Masonry',        cat: 'construction' },
  { slug: 'carpentry-works',            icon: '🪵', label: 'Carpentry Works',           cat: 'construction' },
  { slug: 'debris-removal',             icon: '🚛', label: 'Debris Removal',            cat: 'construction' },
  { slug: 'demolition-work',            icon: '⚒️', label: 'Demolition Work',           cat: 'construction' },
  { slug: 'site-cleaning',              icon: '🧹', label: 'Site Cleaning',             cat: 'construction' },

  { slug: 'landscaping-gardening',      icon: '🌿', label: 'Landscaping & Gardening',   cat: 'outdoor' },
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
  { id: 'flooring',     label: 'Flooring Services',          icon: '⬜', color: '#0f766e', bg: '#f0fdfa', border: '#99f6e4' },
  { id: 'bathroom',     label: 'Bathroom Services',          icon: '🚿', color: '#0369a1', bg: '#e0f2fe', border: '#7dd3fc' },
  { id: 'kitchen',      label: 'Kitchen Services',           icon: '🍳', color: '#b45309', bg: '#fff7ed', border: '#fed7aa' },
  { id: 'glass',        label: 'Glass & Aluminium',          icon: '🪟', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  { id: 'construction', label: 'Construction Services',      icon: '🏗️', color: '#374151', bg: '#f8fafc', border: '#e2e8f0' },
  { id: 'outdoor',      label: 'Outdoor Services',           icon: '🌿', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  { id: 'trades',       label: 'Trades & More',              icon: '🎨', color: '#c2410c', bg: '#fff7ed', border: '#fed7aa' },
]

export default function ServiceTabs() {
  return (
    <section style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
      <div style={{ padding: '14px 16px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Our Services</span>
        <a href="/providers" style={{ fontSize: 12, fontWeight: 600, color: '#E05A2B', textDecoration: 'none' }}>View All ›</a>
      </div>

      {CATEGORIES.map(cat => {
        const services = ALL_SERVICES.filter(s => s.cat === cat.id)
        if (services.length === 0) return null
        return (
          <div key={cat.id} style={{ padding: '12px 0 4px' }}>
            {/* Category label row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: cat.bg, border: `1px solid ${cat.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                }}>
                  {cat.icon}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: cat.color }}>{cat.label}</span>
              </div>
              <a href={`/providers?q=${encodeURIComponent(cat.label.replace(' Services', ''))}`}
                style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textDecoration: 'none' }}>
                See all ›
              </a>
            </div>

            {/* Horizontal scroll row of service tiles */}
            <div style={{
              display: 'flex', gap: 9, overflowX: 'auto',
              padding: '0 16px 8px',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none', msOverflowStyle: 'none',
            }}>
              {services.map(s => (
                <a key={s.slug} href={`/services/${s.slug}`}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 6, padding: '10px 8px 9px',
                    borderRadius: 14, textDecoration: 'none',
                    background: '#f8fafc', border: '1px solid #f1f5f9',
                    flexShrink: 0, width: 72,
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = cat.bg; e.currentTarget.style.borderColor = cat.border }}
                  onMouseOut={e  => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#f1f5f9' }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: '#fff', border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21,
                  }}>
                    {s.icon}
                  </div>
                  <span style={{ fontSize: 9.5, fontWeight: 600, color: '#374151', textAlign: 'center', lineHeight: 1.35 }}>
                    {s.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )
      })}
    </section>
  )
}
