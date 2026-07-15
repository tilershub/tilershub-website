// Shared helpers for job (project) pages: SEO-friendly URLs + display meta.

export const JOB_TYPE_ICONS = {
  'Floor Tiling': '⬜', 'Bathroom Tiling': '🚿', 'Bathroom Renovation': '🛁',
  'Granite Works': '💎', 'Tile Cutting': '✂️', 'Routering': '🔧',
  'Waterproofing': '💧', 'Tile Shop Inquiry': '🏪', 'Large Format Tiling': '📏',
  'Mosaic Tiling': '🎨', 'Pool Tiling': '🏊', 'Outdoor Tiling': '🏡',
  'Glass Railing': '✨', 'Aluminium & Glass Works': '🪟', 'House Painting': '🎨',
  'Landscaping & Gardening': '🌿', 'Carpentry Works': '🪵', 'Demolition Work': '⚒️',
  'Site Cleaning': '🧹', 'Gypsum Ceiling': '🏛️', 'IPanel Ceiling': '🏠',
  'Electrical Repairs': '🔌', 'House Wiring': '⚡', 'House Lighting': '💡',
  'Shower Cubicle': '🚿', 'Bathroom Plumbing': '🚽', 'Debris Removal': '🚛',
  'Granite Countertops': '🪨', 'Aluminium Doors & Windows': '🚪',
}

export const JOB_TYPE_COLORS = {
  'Floor Tiling': '#0F766E', 'Bathroom Tiling': '#0f766e', 'Bathroom Renovation': '#0f766e',
  'Granite Works': '#7c3aed', 'Tile Cutting': '#b45309', 'Waterproofing': '#0369a1',
  'Tile Shop Inquiry': '#D97706', 'Large Format Tiling': '#7c3aed', 'Mosaic Tiling': '#7c3aed',
  'House Painting': '#b45309', 'Landscaping & Gardening': '#15803d', 'Carpentry Works': '#92400e',
  'Glass Railing': '#0891b2', 'Aluminium & Glass Works': '#374151', 'Electrical Repairs': '#7c3aed',
  'House Wiring': '#7c3aed', 'Gypsum Ceiling': '#166534', 'IPanel Ceiling': '#166534',
  'Demolition Work': '#be185d', 'Debris Removal': '#64748b', 'Granite Countertops': '#4b5563',
  'Pool Tiling': '#0369a1', 'Outdoor Tiling': '#15803d',
}

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Canonical SEO path for a project: /jobs/<type>-<district-or-city>-<uuid>
// The full UUID stays as the trailing segment so lookup never depends on the
// cosmetic slug text. Requires p.id; project_type/district/city optional.
export function jobPath(p) {
  const slug = slugify(`${p.project_type || 'tiling-project'}-${p.district || p.city || 'sri-lanka'}`)
  return `/jobs/${slug ? slug + '-' : ''}${p.id}`
}

// Pull the trailing UUID out of a /jobs/[slug] param. Returns null if absent.
export function extractJobId(slugParam) {
  const m = String(slugParam || '').match(UUID_RE)
  return m ? m[0].toLowerCase() : null
}

export function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
