import { useState } from 'react'
import { supabase, PROJECT_TYPES, DISTRICTS_EN, BUDGET_RANGES } from '../lib/supabase.js'

/* Field wrapper defined outside component so React never remounts inputs on re-render */
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

function inputStyle(hasError) {
  return {
    width: '100%', padding: '11px 14px',
    border: `1.5px solid ${hasError ? '#fca5a5' : '#e2e8f0'}`,
    borderRadius: 10, fontSize: 13, outline: 'none', fontFamily: 'inherit',
    background: hasError ? '#fef2f2' : '#fff', transition: 'border-color 0.2s'
  }
}

export default function PostProjectForm() {
  const [form, setForm] = useState({
    project_type: '', city: '', district: '', description: '',
    budget_range: '', customer_name: '', whatsapp: ''
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function validate() {
    const e = {}
    if (!form.project_type) e.project_type = 'Required'
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
      await supabase.from('projects').insert({
        project_type: form.project_type,
        city: form.city.trim(),
        district: form.district || null,
        description: form.description.trim(),
        budget_range: form.budget_range || null,
        customer_name: form.customer_name.trim(),
        whatsapp: form.whatsapp.replace(/\s/g, ''),
        status: 'pending_review'
      })
      setSuccess(true)
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', maxWidth: 520, margin: '0 auto' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Project Posted!</h2>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.8, marginBottom: 28, maxWidth: 360, margin: '0 auto 28px' }}>
          Your project has been submitted successfully. Our team will review it and match you with verified professionals in your area.
        </p>
        <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', marginBottom: 28 }}>
          <p style={{ fontSize: 13, color: '#15803d', margin: 0 }}>✓ You'll be contacted on WhatsApp <strong>{form.whatsapp}</strong> once matched.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/providers" style={{ padding: '11px 22px', background: '#1B3A6B', color: '#fff', borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Browse Providers</a>
          <button onClick={() => { setSuccess(false); setForm({ project_type: '', city: '', district: '', description: '', budget_range: '', customer_name: '', whatsapp: '' }) }} style={{ padding: '11px 22px', background: '#f1f5f9', color: '#334155', borderRadius: 12, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            Post Another
          </button>
        </div>
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

      <Field label="Project Type" id="project_type" req error={errors.project_type}>
        <select
          id="project_type"
          value={form.project_type}
          onChange={e => set('project_type', e.target.value)}
          style={{ ...inputStyle(!!errors.project_type), WebkitAppearance: 'none', appearance: 'none', cursor: 'pointer' }}
        >
          <option value="">Select project type...</option>
          {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="City / Town" id="city" req error={errors.city}>
          <input
            id="city"
            value={form.city}
            onChange={e => set('city', e.target.value)}
            placeholder="e.g. Colombo 03"
            style={inputStyle(!!errors.city)}
          />
        </Field>
        <Field label="District" id="district">
          <select
            id="district"
            value={form.district}
            onChange={e => set('district', e.target.value)}
            style={{ ...inputStyle(false), WebkitAppearance: 'none', appearance: 'none', cursor: 'pointer' }}
          >
            <option value="">Select district...</option>
            {DISTRICTS_EN.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Project Description" id="description" req error={errors.description} hint="Describe your project: area size, tile type preferences, timeline, any special requirements.">
        <textarea
          id="description"
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="e.g. Bathroom renovation — approximately 80 sq.ft floor and wall tiling. Looking for anti-slip floor tiles and white subway wall tiles. Need to start within 2 weeks..."
          rows={4}
          style={{ ...inputStyle(!!errors.description), resize: 'vertical', minHeight: 100 }}
        />
      </Field>

      <Field label="Budget Range" id="budget_range" hint="Optional — helps match you with providers in your range">
        <select
          id="budget_range"
          value={form.budget_range}
          onChange={e => set('budget_range', e.target.value)}
          style={{ ...inputStyle(false), WebkitAppearance: 'none', appearance: 'none', cursor: 'pointer' }}
        >
          <option value="">Select budget range (optional)</option>
          {BUDGET_RANGES.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </Field>

      <div style={{ height: 1, background: '#f1f5f9', margin: '8px 0 20px' }} />
      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
        🔒 Your contact details are kept private and only shared with matched providers.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Your Name" id="customer_name" req error={errors.customer_name}>
          <input
            id="customer_name"
            value={form.customer_name}
            onChange={e => set('customer_name', e.target.value)}
            placeholder="e.g. Nuwan Perera"
            style={inputStyle(!!errors.customer_name)}
          />
        </Field>
        <Field label="WhatsApp Number" id="whatsapp" req error={errors.whatsapp} hint="e.g. +94771234567">
          <input
            id="whatsapp"
            value={form.whatsapp}
            onChange={e => set('whatsapp', e.target.value)}
            placeholder="+94771234567"
            type="tel"
            style={inputStyle(!!errors.whatsapp)}
          />
        </Field>
      </div>

      <button
        type="submit"
        disabled={submitting}
        style={{ width: '100%', padding: '13px', background: submitting ? '#94a3b8' : '#E05A2B', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}
      >
        {submitting ? '⏳ Submitting...' : '📋 Post My Project'}
      </button>

      <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 12 }}>
        Free service · No login required · You'll be contacted on WhatsApp
      </p>
    </form>
  )
}
