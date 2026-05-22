import { useEffect, useState, useMemo } from 'react'
import { supabase, DISTRICTS, SERVICES } from '../lib/supabase'
import { TilerCard, TilerModal } from '../components/TilerCard'
import { Footer, Spinner } from '../components/UI'

const SORT_OPTIONS = [
  { value: 'rating',     label: '⭐ ශ්‍රේණිය (ඉහළ)' },
  { value: 'experience', label: '⏱ අත්දැකීම (වැඩිම)' },
  { value: 'price_asc',  label: '💰 ගාස්තු (අඩු)' },
  { value: 'price_desc', label: '💰 ගාස්තු (වැඩිම)' },
  { value: 'reviews',    label: '📝 සමාලෝචන (වැඩිම)' },
]

export default function Explore() {
  const [tilers, setTilers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [district, setDistrict] = useState('')
  const [service, setService] = useState('')
  const [avail, setAvail] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('rating')

  useEffect(() => {
    async function fetchTilers() {
      setLoading(true)
      const { data, error } = await supabase.from('tiler_profiles').select('*')
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
    if      (sort === 'rating')     result.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
    else if (sort === 'experience') result.sort((a, b) => (b.experience_years || 0) - (a.experience_years || 0))
    else if (sort === 'price_asc')  result.sort((a, b) => (a.daily_rate_min || 99999) - (b.daily_rate_min || 99999))
    else if (sort === 'price_desc') result.sort((a, b) => (b.daily_rate_max || 0) - (a.daily_rate_max || 0))
    else if (sort === 'reviews')    result.sort((a, b) => (b.review_count || 0) - (a.review_count || 0))

    return result
  }, [tilers, district, service, avail, search, sort])

  const hasFilters = district || service || avail || search
  const clearAll = () => { setDistrict(''); setService(''); setAvail(''); setSearch('') }

  const activeChips = [
    district && { label: `📍 ${district}`,                                               clear: () => setDistrict('') },
    service  && { label: `🔧 ${service}`,                                                clear: () => setService('') },
    avail    && { label: avail === 'available' ? '✓ ලබාගත හැකිය' : '⏳ කාර්යබහුලයි', clear: () => setAvail('') },
    search   && { label: `"${search}"`,                                                  clear: () => setSearch('') },
  ].filter(Boolean)

  const inputStyle = {
    background: 'var(--white)',
    border: '1.5px solid var(--cream-dark)',
    borderRadius: 10,
    padding: '10px 14px',
    fontFamily: "'Noto Sans Sinhala', sans-serif",
    fontSize: 13,
    color: 'var(--text-dark)',
    outline: 'none',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ background: 'var(--charcoal)', padding: '48px 24px', textAlign: 'center' }}>
        <span className="section-tag">ටයිලර් සොයන්න</span>
        <h1 className="section-title" style={{ color: 'var(--white)', marginBottom: 8 }}>
          දක්ෂ <span style={{ color: 'var(--terracotta)' }}>ටයිලර්වරුන්</span> සොයා ගන්න
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(245,240,232,0.45)', maxWidth: 440, margin: '0 auto' }}>
          ශ්‍රී ලංකාව පුරා ටයිල් ප්‍රවීණයන් WhatsApp හරහා සෙජෙ සම්බන්ධ වෙන්න
        </p>
      </div>

      {/* Sticky filter bar */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--cream-dark)', position: 'sticky', top: 64, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 24px' }}>

          {/* Row 1: search + sort */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              placeholder="🔍 නම, දිස්ත්‍රික්කය හෝ සේවාව..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select style={{ ...inputStyle, minWidth: 190 }} value={sort} onChange={e => setSort(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Row 2: filters + results count */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <select style={inputStyle} value={district} onChange={e => setDistrict(e.target.value)}>
              <option value="">📍 සියලු දිස්ත්‍රික්ක</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select style={inputStyle} value={service} onChange={e => setService(e.target.value)}>
              <option value="">🔧 සියලු සේවා</option>
              {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select style={inputStyle} value={avail} onChange={e => setAvail(e.target.value)}>
              <option value="">⏰ ලබාගත හැකි බව</option>
              <option value="available">✓ ලබාගත හැකිය</option>
              <option value="busy">⏳ කාර්යබහුලයි</option>
            </select>
            {hasFilters && (
              <button
                className="btn btn-ghost"
                style={{ fontSize: 12, padding: '10px 14px', whiteSpace: 'nowrap' }}
                onClick={clearAll}
              >
                ✕ ඉවත් කරන්න
              </button>
            )}
            {!loading && (
              <span style={{
                fontSize: 12, color: 'var(--text-light)', marginLeft: 'auto',
                background: 'var(--cream)', padding: '6px 14px', borderRadius: 20,
                border: '1px solid var(--cream-dark)', fontWeight: 600, whiteSpace: 'nowrap'
              }}>
                {filtered.length} ටයිලර්
              </span>
            )}
          </div>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              {activeChips.map((chip, i) => (
                <button
                  key={i}
                  onClick={chip.clear}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: 'rgba(193,96,58,0.08)', border: '1px solid rgba(193,96,58,0.25)',
                    color: 'var(--terracotta)', borderRadius: 20,
                    padding: '4px 10px', fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', fontFamily: "'Noto Sans Sinhala', sans-serif",
                    transition: 'background 0.15s',
                  }}
                >
                  {chip.label}
                  <span style={{ opacity: 0.55, fontSize: 10 }}>✕</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-light)' }}>
            <Spinner /> <span style={{ marginLeft: 12, fontSize: 14 }}>ලබා ගනිමින්...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ width: 72, height: 72, background: 'var(--cream)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32 }}>🔍</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: 'var(--charcoal)', marginBottom: 8 }}>ගැළපෙන ටයිලර්වරුන් නැත</h3>
            <p style={{ fontSize: 13, color: 'var(--text-light)', maxWidth: 280, margin: '0 auto 20px' }}>වෙනත් සෙවුමක් හෝ වෙනත් Filter එකක් උත්සාහ කරන්න</p>
            {hasFilters && (
              <button className="btn btn-ghost" onClick={clearAll} style={{ fontSize: 13 }}>
                සියලු Filters ඉවත් කරන්න
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 20 }}>
            {filtered.map(t => <TilerCard key={t.id} tiler={t} onClick={setSelected} />)}
          </div>
        )}
      </div>

      {selected && <TilerModal tiler={selected} onClose={() => setSelected(null)} />}
      <Footer />
    </div>
  )
}
