import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const JOB_TYPES = [
  'Bathroom Renovation', 'Floor Tiling', 'Bathroom Tiling',
  'Kitchen Tiling', 'Wall Tiling', 'Outdoor Tiling',
  'Staircase Tiling', 'Waterproofing', 'Granite Works',
  'Large Format Tiling', 'Mosaic Tiling', 'Pool Tiling', 'Other',
]

const RATING_LABELS = { 5: 'Excellent', 4: 'Very Good', 3: 'Good', 2: 'Fair', 1: 'Poor' }
const RATING_COLORS = { 5: '#16a34a', 4: '#65a30d', 3: '#d97706', 2: '#ea580c', 1: '#dc2626' }

const AVATAR_COLORS = ['#1B3A6B','#0f766e','#7c3aed','#b45309','#0369a1','#E05A2B','#15803d','#be185d']
function avatarColor(name) {
  let h = 0
  for (const c of (name || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}
function initials(name) {
  return (name || '').split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?'
}
function timeAgo(ts) {
  const days = Math.floor((Date.now() - new Date(ts)) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30)  return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

// ─── Stars display ─────────────────────────────────────────────────────────────
function Stars({ rating, size = 13 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} style={{ fontSize: size, color: n <= rating ? '#f59e0b' : '#e2e8f0', lineHeight: 1 }}>★</span>
      ))}
    </span>
  )
}

// ─── Interactive star picker ────────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
        {[1,2,3,4,5].map(n => (
          <span
            key={n}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(n)}
            style={{ fontSize: 36, cursor: 'pointer', color: n <= active ? '#f59e0b' : '#e2e8f0', transition: 'color 0.1s, transform 0.1s', transform: hovered === n ? 'scale(1.2)' : 'scale(1)', userSelect: 'none', lineHeight: 1 }}
          >★</span>
        ))}
        {active > 0 && (
          <span style={{ fontSize: 13, fontWeight: 700, color: RATING_COLORS[active], marginLeft: 6 }}>
            {RATING_LABELS[active]}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Review form ───────────────────────────────────────────────────────────────
function ReviewForm({ tilerId, providerId, onSubmitted }) {
  const [form, setForm] = useState({ reviewer_name: '', rating: 0, job_type: '', comment: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e) {
    e.preventDefault()
    if (!form.rating)                           { setError('Please select a star rating'); return }
    if (!form.reviewer_name.trim())             { setError('Please enter your name'); return }
    if (!form.job_type)                         { setError('Please select the job type'); return }
    if (form.comment.trim().length < 20)        { setError('Review must be at least 20 characters'); return }
    setLoading(true); setError('')
    const payload = {
      reviewer_name: form.reviewer_name.trim(),
      rating:        form.rating,
      job_type:      form.job_type,
      comment:       form.comment.trim(),
    }
    if (tilerId)    payload.tiler_id    = tilerId
    if (providerId) payload.provider_id = providerId
    const { error: err } = await supabase.from('reviews').insert(payload)
    setLoading(false)
    if (err) { setError(err.message || 'Failed to submit — please try again.'); return }
    onSubmitted()
  }

  const inp = {
    width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box', background: '#fff',
  }
  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6,
  }
  const charCount = form.comment.length
  const charOk    = charCount >= 20

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16, background: '#f8fafc', borderRadius: 14, padding: '20px 18px', border: '1.5px solid #e2e8f0' }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Write a Review</div>

      {/* Stars */}
      <div>
        <label style={labelStyle}>Your Rating *</label>
        <StarPicker value={form.rating} onChange={v => set('rating', v)} />
      </div>

      {/* Name + Job type */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Your Name *</label>
          <input
            value={form.reviewer_name}
            onChange={e => set('reviewer_name', e.target.value)}
            placeholder="e.g. Nimal Silva"
            maxLength={60}
            style={inp}
            onFocus={e => e.target.style.borderColor = '#1B3A6B'}
            onBlur={e  => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>
        <div>
          <label style={labelStyle}>Job Type *</label>
          <select
            value={form.job_type}
            onChange={e => set('job_type', e.target.value)}
            style={{ ...inp, cursor: 'pointer' }}
            onFocus={e => e.target.style.borderColor = '#1B3A6B'}
            onBlur={e  => e.target.style.borderColor = '#e2e8f0'}
          >
            <option value="">Select…</option>
            {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Comment */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <label style={labelStyle}>Your Review *</label>
          <span style={{ fontSize: 10, color: charOk ? '#16a34a' : '#94a3b8' }}>{charCount}/500</span>
        </div>
        <textarea
          value={form.comment}
          onChange={e => set('comment', e.target.value.slice(0, 500))}
          placeholder="How was the work quality, punctuality, cleanliness and value for money?"
          rows={4}
          style={{ ...inp, resize: 'vertical', lineHeight: 1.65 }}
          onFocus={e => e.target.style.borderColor = '#1B3A6B'}
          onBlur={e  => e.target.style.borderColor = '#e2e8f0'}
        />
        {charCount > 0 && !charOk && (
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>{20 - charCount} more characters needed</div>
        )}
      </div>

      {error && (
        <div style={{ fontSize: 12, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px' }}>
          ⚠ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{ padding: '12px', background: loading ? '#94a3b8' : '#1B3A6B', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}
      >
        {loading ? '⏳ Submitting…' : '⭐ Submit Review'}
      </button>
    </form>
  )
}

// ─── Single review card ─────────────────────────────────────────────────────────
function ReviewCard({ r }) {
  const color = avatarColor(r.reviewer_name)
  const inits = initials(r.reviewer_name)
  const ratingColor = RATING_COLORS[r.rating] || '#f59e0b'
  return (
    <div style={{ padding: '16px 18px', background: '#fff', borderRadius: 14, border: '1px solid #e8edf5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
            {inits}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{r.reviewer_name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              {r.job_type && (
                <span style={{ fontSize: 9, fontWeight: 700, color: '#1B3A6B', background: '#eef3fb', border: '1px solid #d5e2f5', borderRadius: 20, padding: '1px 7px' }}>
                  {r.job_type}
                </span>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Stars rating={r.rating} size={13} />
            <span style={{ fontSize: 11, fontWeight: 700, color: ratingColor }}>{RATING_LABELS[r.rating]}</span>
          </div>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>{timeAgo(r.created_at)}</span>
        </div>
      </div>
      {r.comment && (
        <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, margin: 0, paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
          {r.comment}
        </p>
      )}
    </div>
  )
}

// ─── Rating summary bar ─────────────────────────────────────────────────────────
function RatingSummary({ avg, reviews }) {
  const breakdown = [5,4,3,2,1].map(n => ({
    n, count: reviews.filter(r => r.rating === n).length,
    pct: reviews.length > 0 ? Math.round((reviews.filter(r => r.rating === n).length / reviews.length) * 100) : 0,
  }))
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', background: '#f8fafc', borderRadius: 14, padding: '18px 20px', border: '1px solid #e8edf5', marginBottom: 20 }}>
      <div style={{ textAlign: 'center', minWidth: 72 }}>
        <div style={{ fontSize: 42, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{avg.toFixed(1)}</div>
        <Stars rating={Math.round(avg)} size={16} />
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 5 }}>
          {reviews.length} review{reviews.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 160 }}>
        {breakdown.map(({ n, count, pct }) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: '#64748b', width: 10, textAlign: 'right' }}>{n}</span>
            <span style={{ fontSize: 11, color: '#f59e0b', lineHeight: 1 }}>★</span>
            <div style={{ flex: 1, height: 7, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: RATING_COLORS[n], borderRadius: 4, width: `${pct}%`, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontSize: 10, color: pct > 0 ? '#374151' : '#cbd5e1', width: 28, textAlign: 'right', fontWeight: pct > 0 ? 600 : 400 }}>{pct > 0 ? `${pct}%` : '—'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────────
const PAGE = 5

export default function ReviewsSection({ tilerId, providerId }) {
  const [reviews,   setReviews]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [visible,   setVisible]   = useState(PAGE)

  useEffect(() => {
    const q = tilerId
      ? supabase.from('reviews').select('*').eq('tiler_id',    tilerId).order('created_at', { ascending: false })
      : supabase.from('reviews').select('*').eq('provider_id', providerId).order('created_at', { ascending: false })
    q.then(({ data }) => { setReviews(data || []); setLoading(false) })
  }, [tilerId, providerId])

  function onSubmitted() {
    setSubmitted(true)
    setShowForm(false)
    // Reload reviews so new one shows immediately
    const q = tilerId
      ? supabase.from('reviews').select('*').eq('tiler_id',    tilerId).order('created_at', { ascending: false })
      : supabase.from('reviews').select('*').eq('provider_id', providerId).order('created_at', { ascending: false })
    q.then(({ data }) => setReviews(data || []))
  }

  const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px 20px', marginBottom: 20 }}>

      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
          ⭐ Reviews {reviews.length > 0 && <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>({reviews.length})</span>}
        </h2>
        {!submitted && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{ fontSize: 12, fontWeight: 700, color: '#1B3A6B', background: '#eef3fb', border: '1.5px solid #d5e2f5', borderRadius: 8, padding: '7px 14px', cursor: 'pointer' }}
          >
            + Write a Review
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 13 }}>Loading reviews…</div>
      ) : (
        <>
          {/* Rating summary — only if reviews exist */}
          {reviews.length > 0 && <RatingSummary avg={avg} reviews={reviews} />}

          {/* Empty state */}
          {reviews.length === 0 && !showForm && (
            <div style={{ textAlign: 'center', padding: '28px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>No reviews yet</p>
              <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>Be the first to share your experience.</p>
              <button
                onClick={() => setShowForm(true)}
                style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: '#1B3A6B', border: 'none', borderRadius: 10, padding: '10px 24px', cursor: 'pointer' }}
              >
                ⭐ Write a Review
              </button>
            </div>
          )}

          {/* Review cards */}
          {reviews.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {reviews.slice(0, visible).map(r => <ReviewCard key={r.id} r={r} />)}
            </div>
          )}

          {/* Load more */}
          {reviews.length > visible && (
            <button
              onClick={() => setVisible(v => v + PAGE)}
              style={{ width: '100%', padding: '10px', background: '#f8fafc', color: '#374151', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', marginBottom: 14 }}
            >
              Show more ({reviews.length - visible} remaining)
            </button>
          )}

          {/* Review form */}
          {showForm && (
            <div style={{ marginTop: reviews.length > 0 ? 8 : 0 }}>
              <ReviewForm tilerId={tilerId} providerId={providerId} onSubmitted={onSubmitted} />
            </div>
          )}

          {/* Success message */}
          {submitted && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#16a34a', fontWeight: 600, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 16px', marginTop: 8 }}>
              ✅ Thank you — your review has been posted!
            </div>
          )}
        </>
      )}
    </div>
  )
}
