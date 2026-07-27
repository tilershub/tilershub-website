import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useDistrict } from '../lib/district.js'

const SHOP_TYPES = ['tile_shop', 'bathroom_shop', 'supplier', 'brand_dealer', 'tool_supplier', 'workshop']

const AVATAR_COLORS = ['#2563EB', '#0891b2', '#7c3aed', '#15803d', '#be185d', '#0369a1']
function avatarColor(name) {
  let h = 0
  for (const c of name || '') h = (h * 31 + c.charCodeAt(0)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}
function initials(name) {
  return (name || '').split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?'
}

function Card({ p }) {
  const rating = Number(p.avg_rating) || 0
  const reviews = p.review_count || 0
  const [imgOk, setImgOk] = useState(true)
  const src = p.profile_image || p.cover_image
  return (
    <a
      href={`/providers/${p.slug}`}
      style={{
        flex: '0 0 auto', width: 172, background: '#fff', border: '1px solid var(--border)',
        borderRadius: 14, overflow: 'hidden', textDecoration: 'none', color: 'inherit',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {src && imgOk ? (
        // Fall back to the initials tile if the remote image 404s, rather
        // than leaving a broken-image icon in the card.
        <img src={src} alt="" loading="lazy" width="172" height="104"
          onError={() => setImgOk(false)}
          style={{ width: '100%', height: 104, objectFit: 'cover', background: 'var(--surface-3)' }} />
      ) : (
        <div style={{ height: 104, background: avatarColor(p.name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 30, fontWeight: 800 }}>
          {initials(p.name)}
        </div>
      )}
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: 34 }}>
          {p.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 12 }}>
          {reviews > 0 ? (
            <>
              <span style={{ color: '#F59E0B' }}>★</span>
              <strong style={{ color: 'var(--text)' }}>{rating.toFixed(1)}</strong>
              <span style={{ color: 'var(--text-4)' }}>({reviews})</span>
            </>
          ) : (
            <span style={{ color: 'var(--text-4)' }}>New</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>📍 {p.city || p.district}</div>
      </div>
    </a>
  )
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', gap: 10, overflow: 'hidden', padding: '0 16px' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ flex: '0 0 auto', width: 172, height: 190, background: 'var(--surface-3)', borderRadius: 14 }} />
      ))}
    </div>
  )
}

/**
 * Providers in the user's district, best-rated first.
 * `variant="shops"` switches to tile shops / suppliers.
 */
export default function NearYou({ variant = 'pros', initial = [] }) {
  const district = useDistrict()
  const [rows, setRows] = useState(initial)
  const [loading, setLoading] = useState(false)
  // True when nobody serves the chosen district and we widened to the whole
  // island — the heading must not claim these are local.
  const [widened, setWidened] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      let q = supabase
        .from('providers')
        .select('id,name,slug,city,district,service_areas,provider_type,avg_rating,review_count,profile_image,cover_image')
        .eq('status', 'active')
        .order('avg_rating', { ascending: false })
        .order('review_count', { ascending: false })
        .limit(60)
      q = variant === 'shops' ? q.in('provider_type', SHOP_TYPES) : q.not('provider_type', 'in', `(${SHOP_TYPES.join(',')})`)
      const { data } = await q
      if (cancelled) return
      // A provider counts as local if their district, city or declared
      // service areas mention the selected district.
      const local = (data || []).filter(p =>
        p.district === district ||
        (p.service_areas || []).includes(district) ||
        (p.city || '').toLowerCase().includes(district.toLowerCase())
      )
      setWidened(local.length === 0)
      setRows((local.length > 0 ? local : (data || [])).slice(0, 10))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [district, variant])

  const where = widened ? 'across Sri Lanka' : `in ${district}`
  const title = variant === 'shops' ? `🏪 Tile shops ${where}` : `⭐ Top rated ${where}`
  const href = variant === 'shops' ? '/tile' : '/providers'

  if (loading && rows.length === 0) return (
    <section style={{ padding: '20px 0 4px' }}>
      <h2 style={{ padding: '0 16px 12px', fontSize: 16, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{title}</h2>
      <Skeleton />
    </section>
  )

  if (rows.length === 0) return (
    <section style={{ padding: '20px 16px' }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', margin: '0 0 10px' }}>{title}</h2>
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '0 0 12px', lineHeight: 1.6 }}>
          {variant === 'shops'
            ? `No tile shops listed in ${district} yet.`
            : `No providers listed in ${district} yet — post your job and nearby pros will quote.`}
        </p>
        <a href="/post-project" className="btn btn-terra btn-sm">Post your job free</a>
      </div>
    </section>
  )

  return (
    <section style={{ padding: '20px 0 4px' }}>
      <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{title}</h2>
        <a href={href} style={{ fontSize: 13, fontWeight: 600, color: 'var(--terra)', textDecoration: 'none', whiteSpace: 'nowrap' }}>See all ›</a>
      </div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 16px 8px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {rows.map(p => <Card key={p.id} p={p} />)}
      </div>
    </section>
  )
}
