import { useEffect, useState, useMemo } from 'react'
import { supabase, DISTRICTS, SERVICES } from '../lib/supabase'
import { TilerCard, TilerModal } from './TilerCard'
import { Spinner } from './UI'

const SORT_OPTIONS = [
  { value: 'experience', label: '⏱ අත්දැකීම' },
  { value: 'price_asc',  label: '💰 ගාස්තු ↑' },
  { value: 'price_desc', label: '💰 ගාස්තු ↓' },
]

const BLOG_TIPS = [
  {
    icon: '💡', tag: 'ඉඟිය',
    title: 'හොඳ ටයිලර් හඳුනා ගන්නේ කෙසේද?',
    desc: 'ශ්‍රේණිගත කිරීම්, sqft ගාස්තු සැසඳීම සහ WhatsApp හරහා මුල් සාකච්ඡාව — නිවැරදි ටයිලර් තෝරා ගැනීමේ ප්‍රධාන ඉඟි.',
    color: 'var(--terracotta)', bg: 'rgba(193,96,58,0.05)',
  },
  {
    icon: '📐', tag: 'ගණනය',
    title: 'ටයිල් ප්‍රමාණය ගණනය කිරීම',
    desc: 'sqft ගණනය කිරීම, 10% waste allowance, සහ grout ප්‍රමාණය — ව්‍යාපෘතිය ආරම්භ කිරීමට පෙර දැනගත යුතු දේ.',
    color: 'var(--sage)', bg: 'rgba(122,154,126,0.06)',
  },
  {
    icon: '🏠', tag: '2025 ප්‍රවණතා',
    title: 'ලංකාවේ ජනප්‍රිය ටයිල් ශෛලි',
    desc: 'ස්වාභාවික ගල් ඡායා, ලී-ෙලස් ටයිල්, සහ minimalist ශ්‍රේණිගත — 2025 නිවාස ව්‍යාපෘති සඳහා නිර්දේශිත.',
    color: 'var(--gold)', bg: 'rgba(201,168,76,0.06)',
  },
  {
    icon: '🔧', tag: 'නඩත්තු',
    title: 'ටයිල් දිගු කාලයක් රැකගන්නේ කෙසේද?',
    desc: 'Grout cleaning, sealing, සහ micro-crack ඉක්මනින් හඳුනා ගැනීම — ඔබේ ටයිල් ආයෝජනය රැකගන්නා ඉඟි.',
    color: 'var(--clay)', bg: 'rgba(160,130,109,0.06)',
  },
]

function BlogTipCard({ tip }) {
  return (
    <div style={{
      gridColumn: '1 / -1',
      background: tip.bg,
      border: `1px solid ${tip.color}28`,
      borderLeft: `4px solid ${tip.color}`,
      borderRadius: 14,
      padding: '18px 22px',
      display: 'flex', alignItems: 'center', gap: 18,
    }}>
      <div style={{
        width: 50, height: 50, flexShrink: 0,
        background: `${tip.color}15`,
        borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24,
      }}>
        {tip.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: tip.color, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 3 }}>
          {tip.tag}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 3 }}>
          {tip.title}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.75, margin: 0 }}>
          {tip.desc}
        </p>
      </div>
      <button style={{
        flexShrink: 0, background: 'none',
        border: `1.5px solid ${tip.color}45`,
        color: tip.color, borderRadius: 8,
        padding: '7px 14px', fontSize: 12, fontWeight: 600,
        cursor: 'pointer', fontFamily: "var(--th-body)",
        whiteSpace: 'nowrap',
      }}>
        කියවන්න →
      </button>
    </div>
  )
}

export default function ExploreApp() {
  const [tilers, setTilers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [district, setDistrict] = useState('')
  const [service, setService] = useState('')
  const [avail, setAvail] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('experience')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    async function fetchTilers() {
      setLoading(true)
      const { data, error } = await supabase.from('tilers').select('*')
      if (!error) setTilers(data || [])
      setLoading(false)
    }
    fetchTilers()

    const channel = supabase
      .channel('tiler_profiles_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tilers' }, () => {
        fetchTilers()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const filtered = useMemo(() => {
    let result = tilers
    if (district) result = result.filter(t => t.district === district)
    if (service)  result = result.filter(t => (t.services || []).includes(service))
    if (avail)    result = result.filter(t => t.availability === avail)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(t =>
        t.full_name?.toLowerCase().includes(q) ||
        t.district?.includes(search) ||
        (t.services || []).some(s => s.includes(search))
      )
    }
    result = [...result]
    if (sort === 'experience') {
      result.sort((a, b) => {
        if (a.featured !== b.featured) return b.featured ? 1 : -1
        return (b.experience_years || 0) - (a.experience_years || 0)
      })
    } else if (sort === 'price_asc') {
      result.sort((a, b) => (a.daily_rate_min || 99999) - (b.daily_rate_min || 99999))
    } else if (sort === 'price_desc') {
      result.sort((a, b) => (b.daily_rate_max || 0) - (a.daily_rate_max || 0))
    }
    return result
  }, [tilers, district, service, avail, search, sort]) // eslint-disable-line

  const hasFilters = district || service || avail || search
  const activeFilterCount = [district, service, avail].filter(Boolean).length
  const clearAll = () => { setDistrict(''); setService(''); setAvail(''); setSearch('') }

  const activeChips = [
    district && { label: `📍 ${district}`,                                               clear: () => setDistrict('') },
    service  && { label: `🔧 ${service}`,                                                clear: () => setService('') },
    avail    && { label: avail === 'available' ? '✓ ලබාගත හැකිය' : '⏳ කාර්යබහුලයි', clear: () => setAvail('') },
  ].filter(Boolean)

  const sel = {
    background: 'var(--white)', border: '1.5px solid var(--cream-dark)',
    borderRadius: 10, padding: '9px 12px',
    fontFamily: "var(--th-body)", fontSize: 13,
    color: 'var(--text-dark)', outline: 'none', cursor: 'pointer',
  }

  const gridItems = filtered.flatMap((t, i) => {
    const items = [{ type: 'tiler', tiler: t }]
    if ((i + 1) % 3 === 0) {
      items.push({ type: 'blog', tip: BLOG_TIPS[Math.floor(i / 3) % BLOG_TIPS.length] })
    }
    return items
  })

  return (
    <div>
      {/* Sticky compact filter bar */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--cream-dark)', position: 'sticky', top: 64, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '10px 16px' }}>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              style={{ ...sel, flex: 1, minWidth: 0 }}
              placeholder="🔍 නම, දිස්ත්‍රික්කය හෝ සේවාව..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button
              onClick={() => setShowFilters(s => !s)}
              style={{
                ...sel,
                display: 'flex', alignItems: 'center', gap: 6,
                background: activeFilterCount > 0 ? 'rgba(193,96,58,0.08)' : 'var(--white)',
                border: activeFilterCount > 0 ? '1.5px solid rgba(193,96,58,0.4)' : '1.5px solid var(--cream-dark)',
                color: activeFilterCount > 0 ? 'var(--terracotta)' : 'var(--text-dark)',
                whiteSpace: 'nowrap',
              }}
            >
              <span>⚙</span>
              <span style={{ fontSize: 12 }}>ෆිල්ටර්</span>
              {activeFilterCount > 0 && (
                <span style={{
                  background: 'var(--terracotta)', color: 'white',
                  borderRadius: '50%', width: 18, height: 18,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700,
                }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
            <select style={{ ...sel, maxWidth: 150 }} value={sort} onChange={e => setSort(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {!loading && (
              <span style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {filtered.length} ටයිලර්
              </span>
            )}
          </div>

          {showFilters && (
            <div style={{ paddingTop: 10, marginTop: 10, borderTop: '1px solid var(--cream-dark)' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <select style={sel} value={district} onChange={e => setDistrict(e.target.value)}>
                  <option value="">📍 සියලු දිස්ත්‍රික්ක</option>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select style={sel} value={service} onChange={e => setService(e.target.value)}>
                  <option value="">🔧 සියලු සේවා</option>
                  {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select style={sel} value={avail} onChange={e => setAvail(e.target.value)}>
                  <option value="">⏰ ලබාගත හැකි බව</option>
                  <option value="available">✓ ලබාගත හැකිය</option>
                  <option value="busy">⏳ කාර්යබහුලයි</option>
                </select>
                {hasFilters && (
                  <button className="btn btn-ghost" style={{ fontSize: 12, padding: '9px 14px', whiteSpace: 'nowrap' }} onClick={clearAll}>
                    ✕ ඉවත් කරන්න
                  </button>
                )}
              </div>
              {activeChips.length > 0 && (
                <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                  {activeChips.map((chip, i) => (
                    <button
                      key={i} onClick={chip.clear}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: 'rgba(193,96,58,0.08)', border: '1px solid rgba(193,96,58,0.25)',
                        color: 'var(--terracotta)', borderRadius: 20,
                        padding: '4px 10px', fontSize: 11, fontWeight: 600,
                        cursor: 'pointer', fontFamily: "var(--th-body)",
                      }}
                    >
                      {chip.label} <span style={{ opacity: 0.5, fontSize: 10 }}>✕</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-light)' }}>
            <Spinner /> <span style={{ marginLeft: 12, fontSize: 14 }}>ලබා ගනිමින්...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ width: 72, height: 72, background: 'var(--cream)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32 }}>🔍</div>
            <h3 style={{ fontFamily: "var(--th-display)", fontSize: 18, color: 'var(--charcoal)', marginBottom: 8 }}>ගැළපෙන ටයිලර්වරුන් නැත</h3>
            <p style={{ fontSize: 13, color: 'var(--text-light)', maxWidth: 280, margin: '0 auto 20px' }}>වෙනත් සෙවුමක් හෝ ෆිල්ටර් එකක් උත්සාහ කරන්න</p>
            {hasFilters && (
              <button className="btn btn-ghost" onClick={clearAll} style={{ fontSize: 13 }}>
                Filters ඉවත් කරන්න
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 18 }}>
            {gridItems.map((item, i) =>
              item.type === 'tiler'
                ? <TilerCard key={item.tiler.id} tiler={item.tiler} onClick={setSelected} />
                : <BlogTipCard key={`blog-${i}`} tip={item.tip} />
            )}
          </div>
        )}
      </div>

      {selected && <TilerModal tiler={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
