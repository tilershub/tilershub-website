import { useEffect, useState } from 'react'
import { supabase, DISTRICTS, SERVICES } from '../lib/supabase'
import { TilerCard, TilerModal } from '../components/TilerCard'
import { Footer, Spinner } from '../components/UI'

export default function Explore() {
  const [tilers, setTilers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [district, setDistrict] = useState('')
  const [service, setService] = useState('')
  const [avail, setAvail] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchTilers() {
      setLoading(true)
      const { data, error } = await supabase
        .from('tiler_profiles')
        .select('*')
        .order('avg_rating', { ascending: false })
      if (!error) setTilers(data || [])
      setLoading(false)
    }
    fetchTilers()

    // Real-time subscription for new tiler registrations
    const channel = supabase
      .channel('tiler_profiles_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tilers' }, () => {
        fetchTilers()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  useEffect(() => {
    let result = tilers
    if (district) result = result.filter(t => t.district === district)
    if (service) result = result.filter(t => (t.services || []).includes(service))
    if (avail) result = result.filter(t => t.availability === avail)
    if (search) result = result.filter(t =>
      t.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.district?.includes(search) ||
      (t.services || []).some(s => s.includes(search))
    )
    setFiltered(result)
  }, [tilers, district, service, avail, search])

  const inputStyle = {
    background: 'var(--white)',
    border: '1.5px solid var(--cream-dark)',
    borderRadius: 10,
    padding: '10px 16px',
    fontFamily: "'Noto Sans Sinhala', sans-serif",
    fontSize: 13,
    color: 'var(--text-dark)',
    outline: 'none',
    cursor: 'pointer'
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

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32, alignItems: 'center' }}>
          <input
            style={{ ...inputStyle, flex: 1, minWidth: 180 }}
            placeholder="🔍 නම, දිස්ත්‍රික්කය හෝ සේවාව..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
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
          {(district || service || avail || search) && (
            <button
              className="btn btn-ghost"
              style={{ fontSize: 12, padding: '10px 16px' }}
              onClick={() => { setDistrict(''); setService(''); setAvail(''); setSearch('') }}
            >
              ✕ ඉවත් කරන්න
            </button>
          )}
        </div>

        {/* Results count */}
        {!loading && (
          <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 24 }}>
            {filtered.length} ටයිලර්වරුන් හමු විය
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-light)' }}>
            <Spinner /> <span style={{ marginLeft: 12, fontSize: 14 }}>ලබා ගනිමින්...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: 18, color: 'var(--charcoal)', marginBottom: 8 }}>ගැළපෙන ටයිලර්වරුන් නැත</h3>
            <p style={{ fontSize: 13, color: 'var(--text-light)' }}>වෙනත් සෙවුමක් හෝ වෙනත් Filter එකක් උත්සාහ කරන්න</p>
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
