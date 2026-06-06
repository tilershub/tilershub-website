import { useState, useEffect } from 'react'
import { supabase, signInWithOtp, DISTRICTS_EN } from '../lib/supabase.js'

const DRAFT_KEY = 'tilershub_draft_token'

function genToken() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

function Field({ label, id, req, error, hint, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label htmlFor={id} style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
        {label} {req && <span style={{ color: '#E05A2B' }}>*</span>}
      </label>
      {children}
      {hint && !error && <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{hint}</p>}
      {error && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>⚠ {error}</p>}
    </div>
  )
}

function inp(hasError) {
  return {
    width: '100%', padding: '11px 14px',
    border: `1.5px solid ${hasError ? '#fca5a5' : '#e2e8f0'}`,
    borderRadius: 10, fontSize: 13, outline: 'none', fontFamily: 'inherit',
    background: hasError ? '#fef2f2' : '#fff', transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  }
}

function MagicLinkForm({ label, hint }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function send(e) {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) { setErr('Enter a valid email address'); return }
    setLoading(true); setErr('')
    const { error } = await signInWithOtp(email.trim())
    setLoading(false)
    if (error) { setErr(error.message); return }
    setSent(true)
  }

  if (sent) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📬</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Check your inbox</div>
        <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7 }}>
          We sent a sign-in link to <strong>{email}</strong>. Click it to access your dashboard and manage your project.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={send} style={{ marginTop: 4 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 10 }}>{label}</div>
      {hint && <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12, lineHeight: 1.6 }}>{hint}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          autoFocus
          style={{ flex: 1, padding: '10px 14px', border: `1.5px solid ${err ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 10, fontSize: 13, outline: 'none', fontFamily: 'inherit', background: err ? '#fef2f2' : '#fff', boxSizing: 'border-box' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '10px 18px', background: loading ? '#94a3b8' : '#1B3A6B', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
          {loading ? '⏳' : 'Send Link →'}
        </button>
      </div>
      {err && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>⚠ {err}</p>}
      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>No password — we use a one-click magic link.</p>
    </form>
  )
}

export default function PostProjectForm() {
  const [form, setForm] = useState({
    project_type: '', city: '', district: '', description: '',
    budget_range: '', customer_name: '', whatsapp: ''
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [userId, setUserId] = useState(null)
  const [draftToken, setDraftToken] = useState('')

  useEffect(() => {
    let token = localStorage.getItem(DRAFT_KEY)
    if (!token) { token = genToken(); localStorage.setItem(DRAFT_KEY, token) }
    setDraftToken(token)
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function validate() {
    const e = {}
    if (!form.project_type.trim()) e.project_type = 'Required'
    if (!form.city.trim()) e.city = 'Required'
    if (!form.description.trim()) e.description = 'Required'
    if (form.description.trim().length < 20) e.description = 'Please describe your project in at least 20 characters'
    if (!form.customer_name.trim()) e.customer_name = 'Required'
    if (!form.whatsapp.trim()) e.whatsapp = 'Required'
    if (!/^\+?[0-9]{9,15}$/.test(form.whatsapp.replace(/\s/g, ''))) e.whatsapp = 'Enter a valid phone number (e.g. +94771234567)'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    setErrors({})
    try {
      const payload = {
        project_type: form.project_type,
        city: form.city.trim(),
        district: form.district || null,
        description: form.description.trim(),
        budget_range: form.budget_range || null,
        customer_name: form.customer_name.trim(),
        whatsapp: form.whatsapp.replace(/\s/g, ''),
        status: 'active',
      }
      if (userId) {
        payload.user_id = userId
        localStorage.removeItem(DRAFT_KEY)
      } else {
        payload.session_token = draftToken
      }
      const { error } = await supabase.from('projects').insert(payload)
      if (error) throw error
      setSuccess(true)
    } catch (err) {
      setErrors({ submit: err?.message || 'Something went wrong. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        {/* Success header */}
        <div style={{ textAlign: 'center', padding: '32px 20px 24px', background: '#fff', borderRadius: '20px 20px 0 0', border: '1px solid #e2e8f0', borderBottom: 'none' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Project Posted!</h2>
          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.8, maxWidth: 340, margin: '0 auto 16px' }}>
            Your project is live. Registered providers can now see it and submit bids.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '8px 14px' }}>
            <span style={{ fontSize: 13, color: '#15803d' }}>✓ We'll notify you on WhatsApp at <strong>{form.whatsapp}</strong></span>
          </div>
        </div>

        {userId ? (
          /* Signed-in user: simple success with manage link */
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderTop: '1px solid #f1f5f9', borderRadius: '0 0 20px 20px', padding: '20px 24px' }}>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/dashboard" style={{ padding: '11px 22px', background: '#1B3A6B', color: '#fff', borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Manage in Dashboard →</a>
              <button onClick={() => { setSuccess(false); setForm({ project_type: '', city: '', district: '', description: '', budget_range: '', customer_name: '', whatsapp: '' }) }}
                style={{ padding: '11px 22px', background: '#f1f5f9', color: '#334155', borderRadius: 12, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                Post Another
              </button>
            </div>
          </div>
        ) : (
          /* Anonymous user: auth prompt to finalize */
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 20px 20px', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #1B3A6B, #0F2444)', padding: '20px 24px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(245,158,11,0.8)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
                One more step
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Create a free account to manage your project</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 4 }}>
                {['📊 Track all bids in your dashboard', '💬 Get notified when providers respond', '✏️ Edit or close your project anytime'].map(b => (
                  <div key={b} style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{b}</div>
                ))}
              </div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <MagicLinkForm
                label="Enter your email to create your free account"
                hint={null}
              />
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="/providers" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>Browse Providers →</a>
                <span style={{ color: '#e2e8f0' }}>·</span>
                <button onClick={() => { setSuccess(false); setForm({ project_type: '', city: '', district: '', description: '', budget_range: '', customer_name: '', whatsapp: '' }) }}
                  style={{ fontSize: 13, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                  Post Another Project
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 560, margin: '0 auto' }}>
      {errors.submit && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 13, color: '#dc2626', marginBottom: 20 }}>
          ⚠ {errors.submit}
        </div>
      )}

      <Field label="Project Title" id="project_type" req error={errors.project_type}
        hint="e.g. Bathroom Tiling, Floor Tiling, Bathroom Renovation, Waterproofing…">
        <input
          id="project_type"
          value={form.project_type}
          onChange={e => set('project_type', e.target.value)}
          placeholder="e.g. Bathroom Tiling & Renovation"
          style={inp(!!errors.project_type)}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="City / Town" id="city" req error={errors.city}>
          <input id="city" value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Colombo 03" style={inp(!!errors.city)} />
        </Field>
        <Field label="District" id="district">
          <select id="district" value={form.district} onChange={e => set('district', e.target.value)}
            style={{ ...inp(false), WebkitAppearance: 'none', appearance: 'none', cursor: 'pointer' }}>
            <option value="">Select district...</option>
            {DISTRICTS_EN.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Project Description" id="description" req error={errors.description}
        hint="Describe your project: area size, tile type preferences, timeline, any special requirements.">
        <textarea id="description" value={form.description} onChange={e => set('description', e.target.value)}
          placeholder="e.g. Bathroom renovation — approximately 80 sq.ft floor and wall tiling. Looking for anti-slip floor tiles and white subway wall tiles. Need to start within 2 weeks..."
          rows={4} style={{ ...inp(!!errors.description), resize: 'vertical', minHeight: 100 }} />
      </Field>

      <Field label="Budget Range" id="budget_range" hint="Optional — e.g. Rs. 50,000, Rs. 150,000–250,000, Negotiable">
        <input
          id="budget_range"
          value={form.budget_range}
          onChange={e => set('budget_range', e.target.value)}
          placeholder="e.g. Rs. 150,000 or Negotiable"
          style={inp(false)}
        />
      </Field>

      <div style={{ height: 1, background: '#f1f5f9', margin: '8px 0 20px' }} />
      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
        🔒 Your contact details are kept private and only shared with matched providers.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Your Name" id="customer_name" req error={errors.customer_name}>
          <input id="customer_name" value={form.customer_name} onChange={e => set('customer_name', e.target.value)} placeholder="e.g. Nuwan Perera" style={inp(!!errors.customer_name)} />
        </Field>
        <Field label="WhatsApp Number" id="whatsapp" req error={errors.whatsapp} hint="e.g. +94771234567">
          <input id="whatsapp" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+94771234567" type="tel" style={inp(!!errors.whatsapp)} />
        </Field>
      </div>

      <button type="submit" disabled={submitting}
        style={{ width: '100%', padding: '13px', background: submitting ? '#94a3b8' : '#E05A2B', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}>
        {submitting ? '⏳ Submitting...' : '📋 Post My Project'}
      </button>

      <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 12 }}>
        Free service · No login required · Providers will bid and you choose
      </p>
    </form>
  )
}
