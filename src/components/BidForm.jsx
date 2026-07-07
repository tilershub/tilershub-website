import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

const BIDDER_TYPES = [
  { value: 'Tiler',      icon: '🪚', label: 'Tiler',       desc: 'Tiling specialist' },
  { value: 'Contractor', icon: '🏗️', label: 'Contractor',  desc: 'Full renovation' },
  { value: 'Workshop',   icon: '🔧', label: 'Workshop',    desc: 'Workshop / cutting' },
  { value: 'Supplier',   icon: '📦', label: 'Supplier',    desc: 'Material supplier' },
  { value: 'Other',      icon: '👷', label: 'Other',       desc: 'Other trade' },
]

function inp(extra = {}) {
  return {
    width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10,
    fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fff',
    boxSizing: 'border-box', color: '#0f172a', transition: 'border-color 0.15s',
    ...extra,
  }
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
        <a href="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#4A2E17', textDecoration: 'none', background: '#F8F1E8', border: '1.5px solid #4A2E1722', borderRadius: 10, padding: '11px 20px' }}>
          ← Browse More Projects
        </a>
        <a href="/providers?type=tiler" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#fff', textDecoration: 'none', background: '#4A2E17', borderRadius: 10, padding: '11px 20px' }}>
          ✅ Create Your Profile
        </a>
      </div>
    </div>
  )
}

export default function BidForm({ jobId, bidCount = 0, projectType = '', city = '' }) {
  const [form, setForm] = useState({ name: '', whatsapp: '', bidder_type: 'Tiler', message: '', quote_amount: '', timeline: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const MAX_MSG = 600

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Please enter your name'); return }
    if (!form.whatsapp.trim()) { setError('Please enter your WhatsApp number'); return }
    if (form.message.trim().length < 20) { setError('Please write at least 20 characters describing your offer'); return }
    setLoading(true)
    setError('')
    // Stamp the submitter's user_id when logged in so their quotes reliably
    // show up under "My Quotes" regardless of phone-number formatting.
    const { data: { user } } = await supabase.auth.getUser()
    const { error: err } = await supabase.from('bids').insert({
      job_id: jobId,
      bidder_name: form.name.trim(),
      bidder_whatsapp: form.whatsapp.trim(),
      bidder_type: form.bidder_type.toLowerCase(),
      message: form.message.trim(),
      quote_amount: form.quote_amount ? parseInt(form.quote_amount, 10) : null,
      timeline: form.timeline.trim() || null,
      user_id: user?.id ?? null,
    })
    setLoading(false)
    if (err) { setError(err.message || 'Failed to submit. Please try again.'); return }
    setSubmitted(true)
  }

  if (submitted) return <BidSuccess projectType={projectType} city={city} />

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
