import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const TYPE_ICONS = {
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

const TYPE_COLORS = {
  'Floor Tiling': '#4A2E17', 'Bathroom Tiling': '#0f766e', 'Bathroom Renovation': '#0f766e',
  'Granite Works': '#7c3aed', 'Tile Cutting': '#b45309', 'Waterproofing': '#0369a1',
  'Tile Shop Inquiry': '#A9713C', 'Large Format Tiling': '#7c3aed', 'Mosaic Tiling': '#7c3aed',
  'House Painting': '#b45309', 'Landscaping & Gardening': '#15803d', 'Carpentry Works': '#92400e',
  'Glass Railing': '#0891b2', 'Aluminium & Glass Works': '#374151', 'Electrical Repairs': '#7c3aed',
  'House Wiring': '#7c3aed', 'Gypsum Ceiling': '#166534', 'IPanel Ceiling': '#166534',
  'Demolition Work': '#be185d', 'Debris Removal': '#64748b', 'Granite Countertops': '#4b5563',
  'Pool Tiling': '#0369a1', 'Outdoor Tiling': '#15803d',
}

const BIDDER_TYPES = [
  { value: 'Tiler',      icon: '🪚', label: 'Tiler',       desc: 'Tiling specialist' },
  { value: 'Contractor', icon: '🏗️', label: 'Contractor',  desc: 'Full renovation' },
  { value: 'Workshop',   icon: '🔧', label: 'Workshop',    desc: 'Workshop / cutting' },
  { value: 'Supplier',   icon: '📦', label: 'Supplier',    desc: 'Material supplier' },
  { value: 'Other',      icon: '👷', label: 'Other',       desc: 'Other trade' },
]

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function inp(extra = {}) {
  return {
    width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10,
    fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fff',
    boxSizing: 'border-box', color: '#0f172a', transition: 'border-color 0.15s',
    ...extra,
  }
}

function ShareButtons({ url, title }) {
  const [copied, setCopied] = useState(false)
  const waText = encodeURIComponent(`🏠 ${title} — submit your bid on TilersHub: ${url}`)
  const share = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title, url }) } catch (_) {}
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button onClick={share} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 20, background: copied ? '#f0fdf4' : '#f8fafc', color: copied ? '#16a34a' : '#374151', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
        {copied ? '✓ Copied!' : '🔗 Copy Link'}
      </button>
      <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noopener noreferrer"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 20, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', textDecoration: 'none' }}>
        💬 Share via WhatsApp
      </a>
    </div>
  )
}

function BidForm({ jobId, bidCount, onSuccess }) {
  const [form, setForm] = useState({ name: '', whatsapp: '', bidder_type: 'Tiler', message: '', quote_amount: '', timeline: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const MAX_MSG = 600

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Please enter your name'); return }
    if (!form.whatsapp.trim()) { setError('Please enter your WhatsApp number'); return }
    if (form.message.trim().length < 20) { setError('Please write at least 20 characters describing your offer'); return }
    setLoading(true)
    setError('')
    const { error: err } = await supabase.from('bids').insert({
      job_id: jobId,
      bidder_name: form.name.trim(),
      bidder_whatsapp: form.whatsapp.trim(),
      bidder_type: form.bidder_type.toLowerCase(),
      message: form.message.trim(),
      quote_amount: form.quote_amount ? parseInt(form.quote_amount, 10) : null,
      timeline: form.timeline.trim() || null,
    })
    setLoading(false)
    if (err) { setError(err.message || 'Failed to submit. Please try again.'); return }
    onSuccess()
  }

  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }
  const msgLen = form.message.length

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Competition notice */}
      {bidCount > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>⚡</span>
          <span style={{ fontSize: 12, color: '#92400e', fontWeight: 600 }}>
            {bidCount} provider{bidCount !== 1 ? 's' : ''} already submitted {bidCount !== 1 ? 'bids' : 'a bid'} — stand out with a detailed offer!
          </span>
        </div>
      )}

      {/* Name + WhatsApp */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Your Name *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Saman Perera" style={inp()} />
        </div>
        <div>
          <label style={labelStyle}>WhatsApp Number *</label>
          <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="07X XXX XXXX" inputMode="tel" style={inp()} />
        </div>
      </div>

      {/* Bidder type */}
      <div>
        <label style={labelStyle}>I am a *</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {BIDDER_TYPES.map(t => (
            <button key={t.value} type="button" onClick={() => set('bidder_type', t.value)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 4px', borderRadius: 12, cursor: 'pointer', border: '1.5px solid', transition: 'all 0.15s',
                background: form.bidder_type === t.value ? '#4A2E17' : '#f8fafc',
                borderColor: form.bidder_type === t.value ? '#4A2E17' : '#e2e8f0',
              }}
            >
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: form.bidder_type === t.value ? '#fff' : '#374151' }}>{t.label}</span>
              <span style={{ fontSize: 9, color: form.bidder_type === t.value ? 'rgba(255,255,255,0.6)' : '#94a3b8', textAlign: 'center', lineHeight: 1.2 }}>{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quote + Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Your Quote <span style={{ color: '#94a3b8', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Rs.</span>
            <input type="number" value={form.quote_amount} onChange={e => set('quote_amount', e.target.value)} placeholder="e.g. 85000" style={inp({ paddingLeft: 38 })} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Timeline <span style={{ color: '#94a3b8', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
          <input value={form.timeline} onChange={e => set('timeline', e.target.value)} placeholder="e.g. 3–5 days" style={inp()} />
        </div>
      </div>

      {/* Message */}
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
          <label style={labelStyle}>Your Pitch *</label>
          <span style={{ fontSize: 10, color: msgLen > MAX_MSG * 0.9 ? '#dc2626' : '#94a3b8' }}>{msgLen}/{MAX_MSG}</span>
        </div>
        <textarea
          value={form.message}
          onChange={e => set('message', e.target.value.slice(0, MAX_MSG))}
          placeholder="Describe your experience, what you'll do, how long it will take, and why the homeowner should choose you over others…"
          rows={5}
          style={{ ...inp(), resize: 'vertical', lineHeight: 1.7 }}
        />
        <p style={{ fontSize: 11, color: '#94a3b8', margin: '5px 0 0' }}>Tip: mention your experience level, past similar jobs, and your waterproofing process.</p>
      </div>

      {error && (
        <div style={{ fontSize: 13, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚠ {error}
        </div>
      )}

      <button type="submit" disabled={loading}
        style={{ padding: '15px', background: loading ? '#94a3b8' : 'linear-gradient(135deg,#4A2E17,#6B4A2E)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 14px rgba(74,46,23,0.3)', transition: 'all 0.2s' }}>
        {loading ? '⏳ Submitting your bid…' : '📨 Submit Bid Now'}
      </button>

      {/* Trust strip */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        {['🔒 No login required', '💬 Homeowner contacts you via WhatsApp', '🚫 No commission'].map(t => (
          <span key={t} style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>{t}</span>
        ))}
      </div>
    </form>
  )
}

function BidSuccess({ projectType, city }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 24px' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#f0fdf4', border: '3px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 20px' }}>✅</div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: '#166534', marginBottom: 8 }}>Bid Submitted!</h3>
      <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, maxWidth: 380, margin: '0 auto 24px' }}>
        Your bid for the <strong>{projectType}</strong> in <strong>{city}</strong> has been received. If the homeowner selects you, they'll contact you directly on WhatsApp.
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#4A2E17', textDecoration: 'none', background: '#eef3fb', border: '1.5px solid #4A2E1722', borderRadius: 10, padding: '11px 20px' }}>
          ← Browse More Projects
        </a>
        <a href="/providers?type=tiler" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#fff', textDecoration: 'none', background: '#4A2E17', borderRadius: 10, padding: '11px 20px' }}>
          ✅ Create Your Profile
        </a>
      </div>
    </div>
  )
}

function SimilarJobCard({ job }) {
  const icon = TYPE_ICONS[job.project_type] || '🏠'
  const color = TYPE_COLORS[job.project_type] || '#4A2E17'
  return (
    <a href={`/job?id=${job.id}`}
      style={{ display: 'flex', alignItems: 'center', gap: 0, background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', textDecoration: 'none', color: 'inherit', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
      onMouseOver={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.09)'; e.currentTarget.style.borderColor = '#cbd5e1' }}
      onMouseOut={e  => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#e2e8f0' }}
    >
      <div style={{ width: 60, height: 60, background: color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{icon}</div>
      <div style={{ flex: 1, padding: '10px 12px', minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{job.project_type}</div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>📍 {job.city || job.district}</div>
      </div>
      <div style={{ padding: '0 12px', fontSize: 18, color: '#cbd5e1', flexShrink: 0 }}>›</div>
    </a>
  )
}

export default function JobDetail() {
  const [job, setJob] = useState(null)
  const [bidCount, setBidCount] = useState(0)
  const [similar, setSimilar] = useState([])
  const [loading, setLoading] = useState(true)
  const [bidSubmitted, setBidSubmitted] = useState(false)
  const [jobId, setJobId] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')
    if (!id) { setLoading(false); return }
    setJobId(id)

    Promise.all([
      supabase.from('projects').select('id,project_type,city,district,description,budget_range,created_at,status').eq('id', id).single(),
      supabase.from('bids').select('job_id', { count: 'exact', head: true }).eq('job_id', id),
    ]).then(([{ data: proj }, { count }]) => {
      setJob(proj)
      setBidCount(count || 0)
      setLoading(false)
      if (proj?.district) {
        supabase.from('projects').select('id,project_type,city,district,created_at').eq('status', 'active').eq('district', proj.district).neq('id', id).limit(4)
          .then(({ data }) => setSimilar(data || []))
      }
    })
  }, [])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
        <div style={{ fontSize: 36, marginBottom: 12, animation: 'pulse 1.5s infinite' }}>⏳</div>
        <div style={{ fontSize: 14 }}>Loading project…</div>
      </div>
    )
  }

  if (!job) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Project not found</h2>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>It may have been removed or the link is incorrect.</p>
        <a href="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#4A2E17', color: '#fff', borderRadius: 10, padding: '11px 22px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
          ← Browse All Projects
        </a>
      </div>
    )
  }

  const icon = TYPE_ICONS[job.project_type] || '🏠'
  const color = TYPE_COLORS[job.project_type] || '#4A2E17'
  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''
  const isActive = job.status === 'active' || !job.status

  return (
    <div>
      {/* ── Hero banner ── */}
      <div style={{ background: `linear-gradient(135deg,${color}f0 0%,${color} 100%)`, padding: '36px 20px 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 29px,rgba(255,255,255,0.8) 29px,rgba(255,255,255,0.8) 30px),repeating-linear-gradient(90deg,transparent,transparent 29px,rgba(255,255,255,0.8) 29px,rgba(255,255,255,0.8) 30px)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          <a href="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, fontWeight: 600, marginBottom: 20, textDecoration: 'none' }}>← All Projects</a>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, flexWrap: 'wrap' }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, flexShrink: 0 }}>{icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {isActive
                  ? <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#25D366', color: '#fff', letterSpacing: 1 }}>● OPEN</span>
                  : <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>● CLOSED</span>
                }
                <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  💬 {bidCount} bid{bidCount !== 1 ? 's' : ''}
                </span>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  ⏱ {timeAgo(job.created_at)}
                </span>
              </div>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(22px,4vw,32px)', fontWeight: 700, color: '#fff', margin: '0 0 8px', lineHeight: 1.2 }}>{job.project_type}</h1>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>📍 {job.city}{job.district ? `, ${job.district} District` : ''}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ background: '#f8fafc', padding: '24px 16px 80px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Project details card */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>

            {/* Chips row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              <span style={{ fontSize: 11, padding: '5px 13px', borderRadius: 20, background: `${color}10`, color, fontWeight: 700, border: `1px solid ${color}22` }}>{icon} {job.project_type}</span>
              {job.budget_range && (
                <span style={{ fontSize: 11, padding: '5px 13px', borderRadius: 20, background: '#f0fdf4', color: '#15803d', fontWeight: 700, border: '1px solid #bbf7d0' }}>💰 {job.budget_range}</span>
              )}
              <span style={{ fontSize: 11, padding: '5px 13px', borderRadius: 20, background: '#eff6ff', color: '#1d4ed8', fontWeight: 700, border: '1px solid #bfdbfe' }}>💬 {bidCount} bid{bidCount !== 1 ? 's' : ''} received</span>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>Project Description</div>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.85, margin: 0, borderLeft: '3px solid #e2e8f0', paddingLeft: 14 }}>
                {job.description || 'No description provided — contact the poster for full details.'}
              </p>
            </div>

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10, marginBottom: 20 }}>
              <div style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', padding: '12px 14px' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Location</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>📍 {job.city || job.district}</div>
              </div>
              {job.budget_range && (
                <div style={{ background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', padding: '12px 14px' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Budget</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>{job.budget_range}</div>
                </div>
              )}
              <div style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', padding: '12px 14px' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Posted</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>⏱ {timeAgo(job.created_at)}</div>
              </div>
              <div style={{ background: '#eff6ff', borderRadius: 12, border: '1px solid #bfdbfe', padding: '12px 14px' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Competition</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1d4ed8' }}>💬 {bidCount} bid{bidCount !== 1 ? 's' : ''}</div>
              </div>
            </div>

            {/* Share */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Share this project</div>
              <ShareButtons url={pageUrl} title={`${job.project_type} in ${job.city}`} />
            </div>
          </div>

          {/* Bid form card */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            {/* Form header */}
            <div style={{ background: 'linear-gradient(135deg,#1C120A,#4A2E17)', padding: '20px 24px' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Submit Your Bid</h2>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0 }}>No login required · Free · Homeowner contacts you on WhatsApp if interested</p>
            </div>
            <div style={{ padding: '24px' }}>
              {bidSubmitted
                ? <BidSuccess projectType={job.project_type} city={job.city || job.district} />
                : jobId && <BidForm jobId={jobId} bidCount={bidCount} onSuccess={() => setBidSubmitted(true)} />
              }
            </div>
          </div>

          {/* Similar jobs */}
          {similar.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>More in {job.district || job.city}</div>
                <a href="/jobs" style={{ fontSize: 12, fontWeight: 600, color: '#A9713C', textDecoration: 'none' }}>View all →</a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {similar.map(s => <SimilarJobCard key={s.id} job={s} />)}
              </div>
            </div>
          )}

          {/* CTA for homeowners */}
          <div style={{ background: '#A9713C', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 3 }}>Have a project?</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Post your project free — get competitive bids</div>
            </div>
            <a href="/post-project" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', color: '#A9713C', borderRadius: 10, padding: '11px 20px', fontSize: 13, fontWeight: 800, textDecoration: 'none', flexShrink: 0 }}>
              📋 Post Free
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}
