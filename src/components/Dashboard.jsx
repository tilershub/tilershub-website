import { useState, useEffect } from 'react'
import { supabase, getUser, signOut, onAuthStateChange } from '../lib/supabase.js'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('projects')
  const [projects, setProjects] = useState([])
  const [submission, setSubmission] = useState(null)
  const [dataLoading, setDataLoading] = useState(false)

  useEffect(() => {
    getUser().then(u => {
      setUser(u)
      setLoading(false)
      if (u) loadData(u)
    })
    onAuthStateChange(u => {
      setUser(u)
      if (u) loadData(u)
      else setLoading(false)
    })
  }, [])

  async function loadData(u) {
    setDataLoading(true)
    const [{ data: proj }, { data: sub }] = await Promise.all([
      supabase.from('projects').select('*').eq('user_id', u.id).order('created_at', { ascending: false }),
      supabase.from('provider_submissions').select('*').eq('user_id', u.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ])
    setProjects(proj || [])
    setSubmission(sub)
    setDataLoading(false)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 12px', borderColor: 'rgba(26,43,74,0.2)', borderTopColor: 'var(--navy)' }} />
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ textAlign: 'center', maxWidth: 380 }}>
          <div style={{ fontSize: 56, marginBottom: 14 }}>🔒</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Sign in to view your dashboard</h2>
          <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.7, marginBottom: 24 }}>Track your posted projects and manage your provider listing.</p>
          <a href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '12px 24px', background: 'var(--navy)', color: '#fff', borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Sign In →
          </a>
        </div>
      </div>
    )
  }

  const initials = (user.email || '?').split('@')[0].slice(0, 2).toUpperCase()

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 64px' }}>

      {/* User header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>My Dashboard</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{user.email}</div>
          </div>
        </div>
        <button
          onClick={async () => { await signOut(); window.location.href = '/' }}
          style={{ fontSize: 12, color: 'var(--text-3)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}
        >
          Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface-2)', padding: 4, borderRadius: 12, border: '1px solid var(--border)', width: 'fit-content' }}>
        {[
          { key: 'projects', label: '📋 My Projects' },
          { key: 'listing', label: '👷 My Listing' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '8px 18px', fontSize: 13, fontWeight: 600, borderRadius: 9, border: 'none', cursor: 'pointer',
              background: tab === t.key ? '#fff' : 'transparent',
              color: tab === t.key ? 'var(--navy)' : 'var(--text-3)',
              boxShadow: tab === t.key ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s',
            }}
          >{t.label}</button>
        ))}
      </div>

      {dataLoading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div className="spinner" style={{ margin: '0 auto', borderColor: 'rgba(26,43,74,0.2)', borderTopColor: 'var(--navy)' }} />
        </div>
      ) : tab === 'projects' ? (
        <ProjectsTab projects={projects} />
      ) : (
        <ListingTab submission={submission} />
      )}
    </div>
  )
}

function ProjectsTab({ projects }) {
  const STATUS_COLOR = {
    pending_review: { bg: '#FEF3C7', color: '#92400E', label: 'Under Review' },
    active: { bg: '#F0FDF4', color: '#166534', label: 'Active' },
    matched: { bg: '#EFF6FF', color: '#1E40AF', label: 'Matched' },
    completed: { bg: '#F3F4F6', color: '#374151', label: 'Completed' },
  }

  if (projects.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--surface-2)', borderRadius: 16, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>No projects yet</div>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20, lineHeight: 1.7 }}>
          Post a tiling project and verified professionals will contact you on WhatsApp.
        </p>
        <a href="/post-project" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '11px 22px', background: 'var(--terra)', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
          📋 Post a Project
        </a>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {projects.map(p => {
        const s = STATUS_COLOR[p.status] || STATUS_COLOR.pending_review
        return (
          <div key={p.id} style={{ padding: 20, background: '#fff', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{p.project_type}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>📍 {p.city}{p.district ? `, ${p.district}` : ''}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {s.label}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>{p.description}</p>
            {p.budget_range && (
              <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 8 }}>💰 Budget: {p.budget_range}</div>
            )}
            {p.created_at && (
              <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4 }}>
                Posted {new Date(p.created_at).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            )}
          </div>
        )
      })}
      <div style={{ textAlign: 'center', paddingTop: 8 }}>
        <a href="/post-project" style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 600, textDecoration: 'none' }}>+ Post another project</a>
      </div>
    </div>
  )
}

function ListingTab({ submission }) {
  const STATUS = {
    pending_review: { bg: '#FEF3C7', color: '#92400E', label: 'Under Review', desc: 'Your application is being reviewed by the TilersHub team. We will contact you on WhatsApp within 1–2 business days.' },
    approved: { bg: '#F0FDF4', color: '#166534', label: 'Approved', desc: 'Your application was approved. Your listing is being set up.' },
    listed: { bg: '#EFF6FF', color: '#1E40AF', label: 'Listed', desc: 'You are live on TilersHub! Customers can find and contact you.' },
    rejected: { bg: '#FEF2F2', color: '#991B1B', label: 'Not Approved', desc: 'Your application was not approved. Contact us for details.' },
  }

  if (!submission) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--surface-2)', borderRadius: 16, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>👷</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Not listed yet</div>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20, lineHeight: 1.7 }}>
          Are you a tiler, workshop or supplier? Apply to get listed on TilersHub for free.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/join-tilershub" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '11px 22px', background: 'var(--navy)', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            ✅ Apply as Provider
          </a>
          <a href="/providers" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '11px 22px', background: 'var(--surface-3)', color: 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            Browse Directory
          </a>
        </div>
      </div>
    )
  }

  const s = STATUS[submission.status] || STATUS.pending_review

  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{submission.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>📍 {submission.city}{submission.district ? `, ${submission.district}` : ''}</div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
          {s.label}
        </span>
      </div>

      <div style={{ padding: '12px 16px', background: s.bg, borderRadius: 10, marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: s.color, margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
      </div>

      {(submission.services || []).length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Services</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {submission.services.map(s => (
              <span key={s} className="chip chip-navy" style={{ fontSize: 11 }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <a href={`https://wa.me/94774503744?text=Hi TilersHub, I applied as a provider (${submission.name}) and want to check my listing status.`} target="_blank" rel="noopener" style={{ fontSize: 12, fontWeight: 600, color: '#16a34a', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
          💬 Contact TilersHub on WhatsApp
        </a>
      </div>
    </div>
  )
}
