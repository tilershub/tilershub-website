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

function JobCard({ project, bidCount }) {
  const icon = TYPE_ICONS[project.project_type] || '🏠'
  const color = TYPE_COLORS[project.project_type] || '#1B3A6B'
  const excerpt = project.description?.length > 120 ? project.description.slice(0, 120) + '…' : project.description

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
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
        {bidCount > 0 && (
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#eff6ff', color: '#1d4ed8', fontWeight: 600, border: '1px solid #bfdbfe' }}>💬 {bidCount} bid{bidCount !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Action */}
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, marginTop: 2 }}>
        <a
          href={`/job?id=${project.id}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#E05A2B', color: '#fff', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
        >
          View &amp; Bid →
        </a>
      </div>
    </div>
  )
}

export default function JobsBoard() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ type: '', district: '' })
  const [bidCounts, setBidCounts] = useState({})

  useEffect(() => {
    supabase
      .from('projects')
      .select('id, project_type, city, district, description, budget_range, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const jobs = data || []
        setProjects(jobs)
        setLoading(false)
        if (jobs.length > 0) {
          const ids = jobs.map(j => j.id)
          supabase.from('bids').select('job_id').in('job_id', ids).then(({ data: bids }) => {
            const counts = {}
            for (const b of bids || []) {
              counts[b.job_id] = (counts[b.job_id] || 0) + 1
            }
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
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Be the first to post a project and get bids from verified tilers.</p>
            <a href="/post-project" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E05A2B', color: '#fff', borderRadius: 12, padding: '11px 24px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              📋 Post a Project
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
            {filtered.map(p => (
              <JobCard key={p.id} project={p} bidCount={bidCounts[p.id] || 0} />
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ marginTop: 48, padding: '28px 32px', background: 'linear-gradient(135deg, #1B3A6B, #0F2444)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Have a tiling project?</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Post it free — providers will bid and you choose who to contact.</div>
            </div>
            <a href="/post-project" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E05A2B', color: '#fff', borderRadius: 12, padding: '11px 22px', fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              📋 Post My Project
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
