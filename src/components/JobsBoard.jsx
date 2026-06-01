import { useState, useEffect } from 'react'
import { supabase, PROJECT_TYPES, DISTRICTS_EN } from '../lib/supabase.js'

const TYPE_ICONS = {
  'Floor Tiling': '🪨',
  'Bathroom Tiling': '🚿',
  'Bathroom Renovation': '🛁',
  'Granite Works': '💎',
  'Tile Cutting': '✂️',
  'Routering': '🔧',
  'Waterproofing': '💧',
  'Tile Shop Inquiry': '🏪',
}

const TYPE_COLORS = {
  'Floor Tiling': '#1B3A6B',
  'Bathroom Tiling': '#0f766e',
  'Bathroom Renovation': '#0f766e',
  'Granite Works': '#7c3aed',
  'Tile Cutting': '#b45309',
  'Routering': '#b45309',
  'Waterproofing': '#0369a1',
  'Tile Shop Inquiry': '#E05A2B',
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function selectStyle() {
  return {
    padding: '9px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10,
    fontSize: 13, fontFamily: 'inherit', background: '#fff', outline: 'none',
    cursor: 'pointer', WebkitAppearance: 'none', appearance: 'none',
  }
}

function AuthModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSend(e) {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) { setError('Enter a valid email address'); return }
    setLoading(true)
    setError('')
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : '/dashboard'
    const { error: err } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo } })
    setLoading(false)
    if (err) { setError(err.message || 'Something went wrong'); return }
    setSent(true)
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 400, boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#0f172a' }}>Sign in to TilersHub</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>We'll send a magic link to your email</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}>✕</button>
        </div>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>📬</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Check your inbox</div>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, maxWidth: 280, margin: '0 auto' }}>
              We sent a sign-in link to <strong>{email}</strong>. Click it to view contact details.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoFocus
                style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${error ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit', background: error ? '#fef2f2' : '#fff' }}
              />
              {error && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>⚠ {error}</p>}
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: loading ? '#94a3b8' : '#1B3A6B', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? '⏳ Sending...' : '✉️ Send Magic Link'}
            </button>
            <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 14 }}>No password needed — secure one-click email link.</p>
          </form>
        )}
      </div>
    </div>
  )
}

function JobCard({ project, user, onSignIn }) {
  const icon = TYPE_ICONS[project.project_type] || '🏠'
  const color = TYPE_COLORS[project.project_type] || '#1B3A6B'
  const excerpt = project.description?.length > 120 ? project.description.slice(0, 120) + '…' : project.description
  const phone = project.whatsapp?.replace(/\D/g, '')
  const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(`Hi, I saw your tiling project on TilersHub and I'm interested. Can we discuss the details?`)}`

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 12, transition: 'box-shadow 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}12`, border: `1.5px solid ${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{project.project_type}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>📍 {project.city}{project.district ? `, ${project.district}` : ''}</div>
          </div>
        </div>
        <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', paddingTop: 2 }}>{timeAgo(project.created_at)}</span>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, margin: 0 }}>{excerpt}</p>

      {/* Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: `${color}10`, color, fontWeight: 600, border: `1px solid ${color}20` }}>{project.project_type}</span>
        {project.budget_range && (
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#f0fdf4', color: '#15803d', fontWeight: 600, border: '1px solid #bbf7d0' }}>💰 {project.budget_range}</span>
        )}
      </div>

      {/* Contact */}
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, marginTop: 2 }}>
        {user ? (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#16a34a', color: '#fff', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
          >
            💬 Contact on WhatsApp
          </a>
        ) : (
          <button
            onClick={onSignIn}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#f8fafc', color: '#1B3A6B', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 700, border: '1.5px solid #e2e8f0', cursor: 'pointer' }}
          >
            🔒 Sign in to contact
          </button>
        )}
      </div>
    </div>
  )
}

export default function JobsBoard() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ type: '', district: '' })
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null))

    supabase
      .from('projects')
      .select('id, project_type, city, district, description, budget_range, whatsapp, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setProjects(data || []); setLoading(false) })

    return () => subscription.unsubscribe()
  }, [])

  const filtered = projects.filter(p => {
    if (filters.type && p.project_type !== filters.type) return false
    if (filters.district && p.district !== filters.district) return false
    return true
  })

  return (
    <div style={{ background: 'var(--surface)', minHeight: '60vh' }}>
      {/* Filter bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 20px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))} style={selectStyle()}>
            <option value="">All Project Types</option>
            {PROJECT_TYPES.map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>)}
          </select>
          <select value={filters.district} onChange={e => setFilters(f => ({ ...f, district: e.target.value }))} style={selectStyle()}>
            <option value="">All Districts</option>
            {DISTRICTS_EN.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {(filters.type || filters.district) && (
            <button onClick={() => setFilters({ type: '', district: '' })} style={{ fontSize: 12, color: '#64748b', background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontWeight: 600 }}>
              ✕ Clear
            </button>
          )}
          <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>
            {loading ? 'Loading…' : `${filtered.length} open project${filtered.length !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 64px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 20px', color: '#94a3b8', fontSize: 14 }}>Loading projects…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏗️</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>No open projects right now</h3>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Be the first to post a project and get matched with verified tilers.</p>
            <a href="/post-project" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E05A2B', color: '#fff', borderRadius: 12, padding: '11px 24px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              📋 Post a Project
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
            {filtered.map(p => (
              <JobCard key={p.id} project={p} user={user} onSignIn={() => setShowAuth(true)} />
            ))}
          </div>
        )}

        {/* CTA for homeowners */}
        {!loading && filtered.length > 0 && (
          <div style={{ marginTop: 48, padding: '28px 32px', background: 'linear-gradient(135deg, #1B3A6B, #0F2444)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Have a tiling project?</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Post it free — get contacted by verified tilers in your area.</div>
            </div>
            <a href="/post-project" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E05A2B', color: '#fff', borderRadius: 12, padding: '11px 22px', fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              📋 Post My Project
            </a>
          </div>
        )}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
