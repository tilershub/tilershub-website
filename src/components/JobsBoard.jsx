import { useState, useEffect } from 'react'
import { supabase, PROJECT_TYPES, DISTRICTS_EN } from '../lib/supabase.js'
import { jobPath, shortDate } from '../lib/jobs.js'

const TYPE_ICONS = {
  'Floor Tiling': '🪨', 'Bathroom Tiling': '🚿', 'Bathroom Renovation': '🛁',
  'Granite Works': '💎', 'Tile Cutting': '✂️', 'Routering': '🔧',
  'Waterproofing': '💧', 'Tile Shop Inquiry': '🏪',
}

const TYPE_COLORS = {
  'Floor Tiling': '#2563EB', 'Bathroom Tiling': '#2563EB', 'Bathroom Renovation': '#2563EB',
  'Granite Works': '#7c3aed', 'Tile Cutting': '#2563EB', 'Routering': '#2563EB',
  'Waterproofing': '#0369a1', 'Tile Shop Inquiry': '#2563EB',
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000)
  if (diff < 60) return 'දැන්ම'
  if (diff < 3600) return `${Math.floor(diff / 60)} මිනි`
  if (diff < 86400) return `${Math.floor(diff / 3600)} පැය`
  if (diff < 604800) return `${Math.floor(diff / 86400)} දින`
  return shortDate(ts)
}

function selectStyle() {
  return {
    padding: '9px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10,
    fontSize: 13, fontFamily: 'inherit', background: '#fff', outline: 'none',
    cursor: 'pointer', WebkitAppearance: 'none', appearance: 'none',
  }
}

function JobCard({ project, bidCount, blurred }) {
  const icon  = TYPE_ICONS[project.project_type] || '🏠'
  const color = TYPE_COLORS[project.project_type] || '#2563EB'
  const excerpt = project.description?.length > 120 ? project.description.slice(0, 120) + '…' : project.description

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', filter: blurred ? 'blur(5px)' : 'none', userSelect: blurred ? 'none' : 'auto', pointerEvents: blurred ? 'none' : 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}12`, border: `1.5px solid ${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>{project.project_type}</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>📍 {project.city}{project.district ? `, ${project.district}` : ''}</div>
          </div>
        </div>
        <span style={{ fontSize: 11, color: '#94A3B8', whiteSpace: 'nowrap', paddingTop: 2 }}>{timeAgo(project.created_at)}</span>
      </div>
      <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.7, margin: 0 }}>{excerpt}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: `${color}10`, color, fontWeight: 600, border: `1px solid ${color}20` }}>{project.project_type}</span>
        {project.budget_range && (
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#f0fdf4', color: '#15803d', fontWeight: 600, border: '1px solid #bbf7d0' }}>💰 {project.budget_range}</span>
        )}
        {bidCount > 0 && (
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#eff6ff', color: '#1d4ed8', fontWeight: 600, border: '1px solid #bfdbfe' }}>💬 {bidCount} ලංසු</span>
        )}
      </div>
      <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 12, marginTop: 2 }}>
        <a href={jobPath(project)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#2563EB', color: '#fff', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
          බලන්න සහ ලංසු →
        </a>
      </div>
    </div>
  )
}

function ProviderGate({ previewProjects, bidCounts }) {
  const [showAuth, setShowAuth] = useState(false)
  const [email, setEmail]       = useState('')
  const [sent, setSent]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [err, setErr]           = useState('')

  async function send(e) {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) { setErr('වලංගු විද්‍යුත් ලිපිනයක් ඇතුළු කරන්න'); return }
    setLoading(true); setErr('')
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: window.location.href } })
    setLoading(false)
    if (error) { setErr(error.message); return }
    setSent(true)
  }

  return (
    <div>
      {/* Blurred preview */}
      <div style={{ position: 'relative', marginBottom: 4 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
          {previewProjects.slice(0, 3).map(p => (
            <JobCard key={p.id} project={p} bidCount={bidCounts[p.id] || 0} blurred />
          ))}
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 140, background: 'linear-gradient(transparent, #F8FAFC)', pointerEvents: 'none' }} />
      </div>

      {/* Gate card */}
      <div style={{ maxWidth: 480, margin: '0 auto', background: '#fff', borderRadius: 20, border: '1.5px solid #E2E8F0', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #2563EB, #0F172A)', padding: '24px 28px' }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🔒</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
            ව්‍යාපෘති බැලීමට සහ ලංසු දැමීමට ලොගිනය
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: 0 }}>
            ලියාපදිංචි සේවා සපයන්නන්ට සියලු විවෘත ව්‍යාපෘති බලා, ගෘහ හිමියන්ට ලංසු ඉදිරිපත් කළ හැකිය.
          </p>
        </div>
        <div style={{ padding: '24px 28px' }}>
          {!showAuth ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                {['📊 සියලු විවෘත ව්‍යාපෘති බලන්න', '💬 මිල ගණන් සහිත ලංසු ඉදිරිපත් කරන්න', '✅ කෙළින්ම රැකියා ජය ගන්න', '🔔 නව ව්‍යාපෘති දැනුම් ලබන්න'].map(b => (
                  <div key={b} style={{ fontSize: 12, color: '#334155' }}>{b}</div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={() => setShowAuth(true)} style={{ flex: 1, padding: '12px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', minWidth: 140 }}>
                  ලොගිනය →
                </button>
                <a href="/join-tilershub" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', background: '#F1F5F9', color: '#2563EB', border: '1.5px solid #d5e2f5', borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: 'none', minWidth: 140 }}>
                  සේවා සපයන්නෙකු ලෙස එකතු වන්න
                </a>
              </div>
            </div>
          ) : sent ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📬</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>ඔබේ ඊමේල් බලන්න</div>
              <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.7 }}>
                <strong>{email}</strong> වෙත ලොගිනය සබැඳියක් යවා ඇත. සියලු ව්‍යාපෘති ප්‍රවේශ වීමට ක්ලික් කරන්න.
              </p>
            </div>
          ) : (
            <form onSubmit={send}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 10 }}>ලොගිනය සඳහා ඊමේල් ඇතුළු කරන්න</div>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErr('') }} placeholder="your@email.com" autoFocus
                style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${err ? '#fca5a5' : '#E2E8F0'}`, borderRadius: 10, fontSize: 13, outline: 'none', fontFamily: 'inherit', background: err ? '#fef2f2' : '#fff', boxSizing: 'border-box', marginBottom: 10 }} />
              {err && <p style={{ fontSize: 11, color: '#dc2626', marginBottom: 8 }}>⚠ {err}</p>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" disabled={loading}
                  style={{ flex: 1, padding: '11px', background: loading ? '#94A3B8' : '#2563EB', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? '⏳ යවමින්…' : '✉️ Magic Link යවන්න'}
                </button>
                <button type="button" onClick={() => setShowAuth(false)}
                  style={{ padding: '11px 14px', background: '#F1F5F9', color: '#64748B', border: 'none', borderRadius: 10, fontSize: 12, cursor: 'pointer' }}>
                  ආපසු
                </button>
              </div>
              <p style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 8 }}>මුරපදයක් අවශ්‍ය නැත — ආරක්ෂිත එකවර ලොගිනය.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function JobsBoard({ initialProjects = null, initialBidCounts = null }) {
  const [projects, setProjects]   = useState(initialProjects || [])
  const [loading, setLoading]     = useState(!initialProjects)
  const [filters, setFilters]     = useState({ type: '', district: '' })
  const [bidCounts, setBidCounts] = useState(initialBidCounts || {})
  const [user, setUser]           = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    supabase
      .from('projects')
      .select('id, project_type, city, district, description, budget_range, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const jobs = data || []
        // Refresh past the SSR seed (seed is capped; this is the full list)
        setProjects(jobs)
        setLoading(false)
        if (jobs.length > 0) {
          const ids = jobs.map(j => j.id)
          supabase.from('bids').select('job_id').in('job_id', ids).then(({ data: bids }) => {
            const counts = {}
            for (const b of bids || []) counts[b.job_id] = (counts[b.job_id] || 0) + 1
            setBidCounts(counts)
          })
        }
      })
  }, [])

  const filtered = projects.filter(p => {
    if (filters.type && p.project_type !== filters.type) return false
    if (filters.district && p.district !== filters.district) return false
    return true
  })

  return (
    <div style={{ background: 'var(--surface)', minHeight: '60vh' }}>
      {/* Filter bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '14px 20px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))} style={selectStyle()}>
            <option value="">සියලු ව්‍යාපෘති වර්ග</option>
            {PROJECT_TYPES.map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>)}
          </select>
          <select value={filters.district} onChange={e => setFilters(f => ({ ...f, district: e.target.value }))} style={selectStyle()}>
            <option value="">සියලු දිස්ත්‍රික්ක</option>
            {DISTRICTS_EN.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {(filters.type || filters.district) && (
            <button onClick={() => setFilters({ type: '', district: '' })} style={{ fontSize: 12, color: '#64748B', background: '#F1F5F9', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontWeight: 600 }}>
              ✕ ඉවත් කරන්න
            </button>
          )}
          <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 'auto' }}>
            {loading ? 'පූරණය…' : `විවෘත ව්‍යාපෘති ${filtered.length}ක්`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 64px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 20px', color: '#94A3B8', fontSize: 14 }}>ව්‍යාපෘති පූරණය…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px', background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏗️</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>දැනට විවෘත ව්‍යාපෘති නොමැත</h3>
            <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>ප්‍රථමයෙන් ව්‍යාපෘතිය පලකරන්න — සත්‍යාපිත ටයිලර්ලා ලංසු ඉදිරිපත් කරනු ඇත.</p>
            <a href="/post-project" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#2563EB', color: '#fff', borderRadius: 12, padding: '11px 24px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              📋 ව්‍යාපෘතිය පලකරන්න
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
            {filtered.map(p => (
              <JobCard key={p.id} project={p} bidCount={bidCounts[p.id] || 0} />
            ))}
          </div>
        )}

        {!loading && user && filtered.length > 0 && (
          <div style={{ marginTop: 48, padding: '28px 32px', background: 'linear-gradient(135deg, #2563EB, #0F172A)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>ටයිලිං ව්‍යාපෘතියක් තිබේද?</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>නොමිලේ පලකරන්න — සේවා සපයන්නන් ලංසු ඉදිරිපත් කරති, ඔබ තෝරා ගන්න.</div>
            </div>
            <a href="/post-project" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#2563EB', color: '#fff', borderRadius: 12, padding: '11px 22px', fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              📋 මගේ ව්‍යාපෘතිය පලකරන්න
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
