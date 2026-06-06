import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

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

const BIDDER_TYPES = ['Tiler', 'Contractor', 'Workshop', 'Supplier', 'Other']

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
    width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10,
    fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fff', boxSizing: 'border-box',
    ...extra,
  }
}

function ShareButtons({ url, title }) {
  const [copied, setCopied] = useState(false)
  const waText = encodeURIComponent(`Check out this ${title} — submit your bid on TilersHub: ${url}`)

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
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <button
        onClick={share}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 20, background: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0', cursor: 'pointer' }}
      >
        {copied ? '✓ Copied!' : '🔗 Share'}
      </button>
      <a
        href={`https://wa.me/?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 20, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', textDecoration: 'none' }}
      >
        💬 Share on WhatsApp
      </a>
    </div>
  )
}

function BidForm({ jobId, onSuccess }) {
  const [form, setForm] = useState({
    name: '', whatsapp: '', bidder_type: 'Tiler',
    message: '', quote_amount: '', timeline: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Please enter your name'); return }
    if (!form.whatsapp.trim()) { setError('Please enter your WhatsApp number'); return }
    if (!form.message.trim()) { setError('Please write a message describing your offer'); return }
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

  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Your Name *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Saman Perera" style={inp()} />
        </div>
        <div>
          <label style={labelStyle}>WhatsApp Number *</label>
          <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="07X XXX XXXX" style={inp()} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>I am a *</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {BIDDER_TYPES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => set('bidder_type', t)}
              style={{
                padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
                background: form.bidder_type === t ? '#1B3A6B' : '#f8fafc',
                color: form.bidder_type === t ? '#fff' : '#374151',
                borderColor: form.bidder_type === t ? '#1B3A6B' : '#e2e8f0',
              }}
            >{t}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Your Quote (Rs.) <span style={{ color: '#94a3b8', fontWeight: 400 }}>optional</span></label>
          <input type="number" value={form.quote_amount} onChange={e => set('quote_amount', e.target.value)} placeholder="e.g. 45000" style={inp()} />
        </div>
        <div>
          <label style={labelStyle}>Timeline <span style={{ color: '#94a3b8', fontWeight: 400 }}>optional</span></label>
          <input value={form.timeline} onChange={e => set('timeline', e.target.value)} placeholder="e.g. 3–5 days" style={inp()} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Your Message *</label>
        <textarea
          value={form.message}
          onChange={e => set('message', e.target.value)}
          placeholder="Describe what you'll do, your experience, and why the homeowner should choose you…"
          rows={5}
          style={{ ...inp(), resize: 'vertical', lineHeight: 1.6 }}
        />
      </div>

      {error && (
        <div style={{ fontSize: 13, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px' }}>
          ⚠ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{ padding: '14px', background: loading ? '#94a3b8' : '#1B3A6B', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? '⏳ Submitting…' : '📨 Submit Bid'}
      </button>
      <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', margin: 0 }}>
        Your WhatsApp number is only shared with the homeowner if they choose to contact you.
      </p>
    </form>
  )
}

function BidSuccess() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f0fdf4', borderRadius: 16, border: '1px solid #bbf7d0' }}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#166534', marginBottom: 8 }}>Bid Submitted!</h3>
      <p style={{ fontSize: 13, color: '#166534', lineHeight: 1.7, maxWidth: 360, margin: '0 auto 20px' }}>
        Your bid has been received. If the homeowner is interested, they'll contact you directly on WhatsApp.
      </p>
      <a href="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#1B3A6B', textDecoration: 'none', background: '#fff', border: '1.5px solid #1B3A6B', borderRadius: 10, padding: '10px 20px' }}>
        ← Browse More Projects
      </a>
    </div>
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
      supabase
        .from('projects')
        .select('id, project_type, city, district, description, budget_range, created_at')
        .eq('id', id)
        .single(),
      supabase.from('bids').select('job_id', { count: 'exact', head: true }).eq('job_id', id),
    ]).then(([{ data: proj }, { count }]) => {
      setJob(proj)
      setBidCount(count || 0)
      setLoading(false)
      if (proj?.district) {
        supabase
          .from('projects')
          .select('id, project_type, city, district, created_at')
          .eq('status', 'active')
          .eq('district', proj.district)
          .neq('id', id)
          .limit(3)
          .then(({ data }) => setSimilar(data || []))
      }
    })
  }, [])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
        <div style={{ fontSize: 14 }}>Loading project…</div>
      </div>
    )
  }

  if (!job) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Project not found</h2>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>It may have been removed or the link is incorrect.</p>
        <a href="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#1B3A6B', color: '#fff', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
          ← Browse All Projects
        </a>
      </div>
    )
  }

  const icon = TYPE_ICONS[job.project_type] || '🏠'
  const color = TYPE_COLORS[job.project_type] || '#1B3A6B'
  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = `${job.project_type} in ${job.city}`

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 72px' }}>
      {/* Back link */}
      <a href="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b', textDecoration: 'none', fontWeight: 600, marginBottom: 24 }}>
        ← All Projects
      </a>

      {/* Job header card */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '28px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: `${color}12`, border: `2px solid ${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{job.project_type}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>📍 {job.city}{job.district ? `, ${job.district}` : ''}</span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>·</span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>⏱ {timeAgo(job.created_at)}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: `${color}10`, color, fontWeight: 700, border: `1px solid ${color}20` }}>{job.project_type}</span>
          {job.budget_range && (
            <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: '#f0fdf4', color: '#15803d', fontWeight: 700, border: '1px solid #bbf7d0' }}>💰 {job.budget_range}</span>
          )}
          <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: '#eff6ff', color: '#1d4ed8', fontWeight: 700, border: '1px solid #bfdbfe' }}>
            💬 {bidCount} bid{bidCount !== 1 ? 's' : ''}
          </span>
        </div>

        <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, margin: '0 0 20px' }}>{job.description}</p>

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Share this project</div>
          <ShareButtons url={pageUrl} title={shareTitle} />
        </div>
      </div>

      {/* Bid section */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>Submit Your Bid</h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>
              No login needed · Free · Homeowner contacts you via WhatsApp
            </p>
          </div>
          {bidCount > 0 && (
            <span style={{ fontSize: 12, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '6px 12px', whiteSpace: 'nowrap' }}>
              {bidCount} provider{bidCount !== 1 ? 's' : ''} already bid
            </span>
          )}
        </div>

        {bidSubmitted
          ? <BidSuccess />
          : jobId && <BidForm jobId={jobId} onSuccess={() => setBidSubmitted(true)} />
        }
      </div>

      {/* Similar jobs */}
      {similar.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            More in {job.district || job.city}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {similar.map(s => (
              <a
                key={s.id}
                href={`/job?id=${s.id}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, padding: '8px 14px', borderRadius: 20, background: '#f8fafc', color: '#374151', border: '1px solid #e2e8f0', textDecoration: 'none' }}
              >
                {TYPE_ICONS[s.project_type] || '🏠'} {s.project_type} · {s.city}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
