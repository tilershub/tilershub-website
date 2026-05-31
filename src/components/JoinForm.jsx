import { useState, useEffect } from 'react'
import { supabase, PROVIDER_TYPES, DISTRICTS_EN, SERVICES_EN } from '../lib/supabase.js'

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

export default function JoinForm() {
  const [form, setForm] = useState({
    name: '', provider_type: '', city: '', district: '',
    whatsapp: '', description: '', services: []
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleService = (s) => set('services', form.services.includes(s) ? form.services.filter(x => x !== s) : [...form.services, s])

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.provider_type) e.provider_type = 'Required'
    if (!form.city.trim()) e.city = 'Required'
    if (!form.whatsapp.trim()) e.whatsapp = 'Required'
    if (!/^\+?[0-9]{9,15}$/.test(form.whatsapp.replace(/\s/g, ''))) e.whatsapp = 'Enter a valid phone number'
    if (form.services.length === 0) e.services = 'Select at least one service'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    setErrors({})
    try {
      await supabase.from('provider_submissions').insert({
        name: form.name.trim(),
        provider_type: form.provider_type,
        city: form.city.trim(),
        district: form.district || null,
        whatsapp: form.whatsapp.replace(/\s/g, ''),
        description: form.description.trim() || null,
        services: form.services,
        status: 'pending_review',
        ...(userId ? { user_id: userId } : {}),
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
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Application Submitted!</h2>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.8, marginBottom: 20, maxWidth: 380, margin: '0 auto 20px' }}>
          Thank you for applying to join TilersHub. Our team will review your application and contact you on WhatsApp within 1–2 business days.
        </p>
        <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: '#15803d', margin: 0 }}>✓ We'll reach out to <strong>{form.whatsapp}</strong> soon.</p>
        </div>
        <a href="/providers" style={{ padding: '11px 24px', background: '#1B3A6B', color: '#fff', borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
          Browse Provider Directory
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 580, margin: '0 auto' }}>
      {errors.submit && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 13, color: '#dc2626', marginBottom: 20 }}>
          ⚠ {errors.submit}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Name / Business Name" id="name" req error={errors.name}>
          <input
            id="name"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Your full name or business"
            style={inputStyle(!!errors.name)}
          />
        </Field>
        <Field label="Provider Type" id="provider_type" req error={errors.provider_type}>
          <select
            id="provider_type"
            value={form.provider_type}
            onChange={e => set('provider_type', e.target.value)}
            style={{ ...inputStyle(!!errors.provider_type), WebkitAppearance: 'none', cursor: 'pointer' }}
          >
            <option value="">Select type...</option>
            {PROVIDER_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
          </select>
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="City / Town" id="city" req error={errors.city}>
          <input
            id="city"
            value={form.city}
            onChange={e => set('city', e.target.value)}
            placeholder="e.g. Nugegoda"
            style={inputStyle(!!errors.city)}
          />
        </Field>
        <Field label="District" id="district">
          <select
            id="district"
            value={form.district}
            onChange={e => set('district', e.target.value)}
            style={{ ...inputStyle(false), WebkitAppearance: 'none', cursor: 'pointer' }}
          >
            <option value="">Select district...</option>
            {DISTRICTS_EN.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
      </div>

      <Field label="WhatsApp Number" id="whatsapp" req error={errors.whatsapp} hint="This is the number customers will contact you on.">
        <input
          id="whatsapp"
          value={form.whatsapp}
          onChange={e => set('whatsapp', e.target.value)}
          placeholder="+94771234567"
          type="tel"
          style={inputStyle(!!errors.whatsapp)}
        />
      </Field>

      <Field label="Services Offered" id="services" req error={errors.services} hint="Select all services you provide">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SERVICES_EN.map(s => {
            const checked = form.services.includes(s)
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleService(s)}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: `1.5px solid ${checked ? '#1B3A6B' : '#e2e8f0'}`,
                  background: checked ? '#eef3fb' : '#fff',
                  color: checked ? '#1B3A6B' : '#64748b',
                  transition: 'all 0.15s'
                }}
              >
                {checked ? '✓ ' : ''}{s}
              </button>
            )
          })}
        </div>
      </Field>

      <Field label="Short Description" id="description" hint="Optional — describe your experience and what makes you stand out">
        <textarea
          id="description"
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="e.g. 8 years experience in floor and bathroom tiling across Colombo and Western Province. Specialise in large format tiles and herringbone patterns..."
          rows={3}
          style={{ ...inputStyle(false), resize: 'vertical' }}
        />
      </Field>

      <div style={{ padding: '14px 16px', background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', marginBottom: 20 }}>
        <p style={{ fontSize: 12, color: '#15803d', margin: 0, lineHeight: 1.6 }}>
          ✓ <strong>Free listing</strong> · Direct WhatsApp leads · No commission ever · TilersHub team reviews all applications within 1–2 business days.
        </p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        style={{ width: '100%', padding: '13px', background: submitting ? '#94a3b8' : '#1B3A6B', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}
      >
        {submitting ? '⏳ Submitting...' : '✅ Submit Application'}
      </button>
    </form>
  )
}
