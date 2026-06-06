import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const JOB_TYPES = [
  'Floor Tiling', 'Bathroom Tiling', 'Bathroom Renovation',
  'Kitchen Tiling', 'Staircase Tiling', 'Wall Tiling',
  'Outdoor Tiling', 'Waterproofing', 'Granite Works', 'Other',
]

function Stars({ rating, size = 14, interactive = false, onRate }) {
  return (
    <div style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          onClick={() => interactive && onRate && onRate(n)}
          style={{
            fontSize: size, cursor: interactive ? 'pointer' : 'default',
            color: n <= rating ? '#f59e0b' : '#e2e8f0', userSelect: 'none',
          }}
        >★</span>
      ))}
    </div>
  )
}

function ReviewForm({ tilerId, providerId, onSubmitted }) {
  const [form, setForm] = useState({ reviewer_name: '', rating: 0, job_type: '', comment: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hovered, setHovered] = useState(0)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e) {
    e.preventDefault()
    if (!form.reviewer_name.trim()) { setError('Please enter your name'); return }
    if (!form.rating) { setError('Please select a star rating'); return }
    if (!form.comment.trim()) { setError('Please write a short review'); return }
    setLoading(true)
    setError('')
    const payload = {
      reviewer_name: form.reviewer_name.trim(),
      rating: form.rating,
      job_type: form.job_type || null,
      comment: form.comment.trim(),
    }
    if (tilerId) payload.tiler_id = tilerId
    if (providerId) payload.provider_id = providerId
    const { error: err } = await supabase.from('reviews').insert(payload)
    setLoading(false)
    if (err) { setError(err.message || 'Failed to submit. Please try again.'); return }
    onSubmitted()
  }

  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }
  const inp = { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14, background: '#f8fafc', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Leave a Review</div>

      <div>
        <label style={labelStyle}>Your Rating *</label>
        <div style={{ display: 'inline-flex', gap: 4 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <span
              key={n}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => set('rating', n)}
              style={{ fontSize: 28, cursor: 'pointer', color: n <= (hovered || form.rating) ? '#f59e0b' : '#e2e8f0', userSelect: 'none' }}
            >★</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Your Name *</label>
          <input value={form.reviewer_name} onChange={e => set('reviewer_name', e.target.value)} placeholder="e.g. Nimal Silva" style={inp} />
        </div>
        <div>
          <label style={labelStyle}>Job Type <span style={{ color: '#94a3b8', fontWeight: 400 }}>optional</span></label>
          <select value={form.job_type} onChange={e => set('job_type', e.target.value)} style={{ ...inp, cursor: 'pointer', WebkitAppearance: 'none' }}>
            <option value="">Select…</option>
            {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Your Review *</label>
        <textarea
          value={form.comment}
          onChange={e => set('comment', e.target.value)}
          placeholder="How was the work quality, professionalism, and value for money?"
          rows={3}
          style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }}
        />
      </div>

      {error && (
        <div style={{ fontSize: 12, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px' }}>
          ⚠ {error}
        </div>
      )}

      <button type="submit" disabled={loading} style={{ padding: '11px', background: loading ? '#94a3b8' : '#1B3A6B', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? '⏳ Submitting…' : '⭐ Submit Review'}
      </button>
    </form>
  )
}

export default function ReviewsSection({ tilerId, providerId }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const q = tilerId
      ? supabase.from('reviews').select('*').eq('tiler_id', tilerId).order('created_at', { ascending: false })
      : supabase.from('reviews').select('*').eq('provider_id', providerId).order('created_at', { ascending: false })
    q.then(({ data }) => { setReviews(data || []); setLoading(false) })
  }, [tilerId, providerId])

  const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
  const breakdown = [5, 4, 3, 2, 1].map(n => ({ n, count: reviews.filter(r => r.rating === n).length }))

  function timeAgo(ts) {
    const diff = Math.floor((Date.now() - new Date(ts)) / 1000 / 86400)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    if (diff < 30) return `${diff} days ago`
    if (diff < 365) return `${Math.floor(diff / 30)} months ago`
    return `${Math.floor(diff / 365)}y ago`
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 26, marginBottom: 20 }}>
      <h2 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>⭐ Reviews</h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8', fontSize: 13 }}>Loading reviews…</div>
      ) : reviews.length === 0 ? (
        <div>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>No reviews yet — be the first to leave one.</p>
          {!submitted && (
            showForm
              ? <ReviewForm tilerId={tilerId} providerId={providerId} onSubmitted={() => { setSubmitted(true); setShowForm(false) }} />
              : <button onClick={() => setShowForm(true)} style={{ fontSize: 12, fontWeight: 700, color: '#1B3A6B', background: '#eef3fb', border: '1.5px solid #d5e2f5', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>+ Leave a Review</button>
          )}
          {submitted && <div style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>✅ Thank you for your review!</div>}
        </div>
      ) : (
        <>
          {/* Summary row */}
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{avg.toFixed(1)}</div>
              <Stars rating={Math.round(avg)} size={16} />
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              {breakdown.map(({ n, count }) => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8', width: 8 }}>{n}</span>
                  <span style={{ fontSize: 10, color: '#f59e0b' }}>★</span>
                  <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#f59e0b', borderRadius: 3, width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : '0%' }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#94a3b8', width: 16 }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {reviews.map(r => (
              <div key={r.id} style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1B3A6B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                      {r.reviewer_name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{r.reviewer_name}</div>
                      {r.job_type && <div style={{ fontSize: 10, color: '#64748b' }}>{r.job_type}</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                    <Stars rating={r.rating} size={12} />
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>{timeAgo(r.created_at)}</span>
                  </div>
                </div>
                {r.comment && <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, margin: 0 }}>{r.comment}</p>}
              </div>
            ))}
          </div>

          {!submitted && (
            showForm
              ? <ReviewForm tilerId={tilerId} providerId={providerId} onSubmitted={() => { setSubmitted(true); setShowForm(false) }} />
              : <button onClick={() => setShowForm(true)} style={{ fontSize: 12, fontWeight: 700, color: '#1B3A6B', background: '#eef3fb', border: '1.5px solid #d5e2f5', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>+ Leave a Review</button>
          )}
          {submitted && <div style={{ fontSize: 13, color: '#16a34a', fontWeight: 600, marginTop: 8 }}>✅ Thank you for your review!</div>}
        </>
      )}
    </div>
  )
}
