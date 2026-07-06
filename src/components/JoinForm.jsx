import { useState, useEffect } from 'react'
import { supabase, PROFESSIONS } from '../lib/supabase.js'
import { useLang } from '../lib/useLang.js'

const PENDING_KEY = 'tilershub_pending_join'

const T = {
  si: {
    required: 'අවශ්‍යයි',
    phoneInvalid: 'වලංගු දුරකථන අංකයක් ඇතුළු කරන්න',
    submitError: 'දෝෂයක් ඇති විය. නැවත උත්සාහ කරන්න.',
    successTitle: 'අයදුම්පත ලැබුණි!',
    successBody: 'ඔබේ dashboard වෙත ගෙන යමින්…',
    pickTitle: 'ඔබේ වෘත්තිය / සේවාව තෝරන්න',
    pickSub: 'ඔබව හොඳින්ම විස්තර කරන්නේ කුමක්ද?',
    change: '· වෙනස් කරන්න',
    name: 'නම / සමාගම',
    namePh: 'ඔබේ නම හෝ සමාගමේ නම',
    city: 'නගරය / ගම',
    cityPh: 'උදා: නුගේගොඩ',
    whatsapp: 'WhatsApp අංකය',
    whatsappHint: 'ගනුදෙනුකරුවන් ඔබව මෙතැනින් සම්බන්ධ කරගනී.',
    freeNote: '✓ නොමිලේ ලැයිස්තුගත වීම · WhatsApp හරහා leads · කොමිස් නැත · ඡායාරූප පසුව එක් කළ හැක.',
    googleNote: '🔐 ඉදිරියට යාමට Google ගිණුමෙන් sign in වේ — ආරක්ෂිතයි, නොමිලේ, මුරපද අවශ්‍ය නැත.',
    submit: '✅ නොමිලේ ලියාපදිංචි වන්න →',
    submitting: '⏳ ඉදිරිපත් කරමින්...',
    review: 'වැඩ කරන දින 1–2ක් ඇතුළත සමාලෝචනය කර WhatsApp හරහා දැනුම් දෙන්නෙමු.',
  },
  en: {
    required: 'Required',
    phoneInvalid: 'Enter a valid phone number',
    submitError: 'Something went wrong. Please try again.',
    successTitle: 'Application Submitted!',
    successBody: 'Taking you to your dashboard…',
    pickTitle: 'Select your profession / service',
    pickSub: 'What best describes you?',
    change: '· Change',
    name: 'Name / Company',
    namePh: 'Your name or company name',
    city: 'City / Town',
    cityPh: 'e.g. Nugegoda',
    whatsapp: 'WhatsApp Number',
    whatsappHint: 'Customers will contact you here.',
    freeNote: '✓ Free listing · Direct WhatsApp leads · No commission · Add photos & details after joining.',
    googleNote: "🔐 You'll sign in with your Google account to continue — safe, free, no passwords needed.",
    submit: '✅ Get Listed Free →',
    submitting: '⏳ Submitting...',
    review: "We'll review within 1–2 business days and contact you on WhatsApp.",
  },
}

function Field({ label, id, req, error, hint, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label htmlFor={id} style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 7 }}>
        {label}{req && <span style={{ color: '#A9713C', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && !error && <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 5, lineHeight: 1.5 }}>{hint}</p>}
      {error && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 5 }}>⚠ {error}</p>}
    </div>
  )
}

function inputStyle(hasError) {
  return {
    width: '100%', padding: '11px 14px',
    border: `1.5px solid ${hasError ? '#fca5a5' : '#e2e8f0'}`,
    borderRadius: 10, fontSize: 13, outline: 'none', fontFamily: 'inherit',
    background: hasError ? '#fef2f2' : '#fff', transition: 'border-color 0.2s', boxSizing: 'border-box',
  }
}

export default function JoinForm() {
  const lang = useLang()
  const t = T[lang] || T.en
  const [category, setCategory] = useState(null)
  const [form, setForm] = useState({ name: '', city: '', whatsapp: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    async function trySubmitPending(user) {
      const raw = localStorage.getItem(PENDING_KEY)
      if (!raw) return
      try {
        const payload = JSON.parse(raw)
        const { error } = await supabase.from('provider_submissions').insert({ ...payload, user_id: user.id })
        if (!error) {
          localStorage.removeItem(PENDING_KEY)
          setSuccess(true)
          setTimeout(() => { window.location.href = '/provider?welcome=1' }, 1500)
        }
      } catch {}
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setSignedIn(!!user)
      if (user) trySubmitPending(user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        setSignedIn(true)
        trySubmitPending(session.user)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = t.required
    if (!form.city.trim()) e.city = t.required
    if (!form.whatsapp.trim()) e.whatsapp = t.required
    else if (!/^\+?[0-9]{9,15}$/.test(form.whatsapp.replace(/\s/g, ''))) e.whatsapp = t.phoneInvalid
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    setErrors({})

    const payload = {
      name: form.name.trim(),
      provider_type: category?.value || 'tiler',
      city: form.city.trim(),
      district: null,
      whatsapp: form.whatsapp.replace(/\s/g, ''),
      services: [category?.label || 'General Services'],
      status: 'pending_review',
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { error } = await supabase.from('provider_submissions').insert({ ...payload, user_id: user.id })
        if (error) throw error
        setSuccess(true)
        setTimeout(() => { window.location.href = '/provider?welcome=1' }, 1500)
      } else {
        localStorage.setItem(PENDING_KEY, JSON.stringify(payload))
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/auth/callback?join_return=/join-tilershub` },
        })
      }
    } catch {
      setErrors({ submit: t.submitError })
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', maxWidth: 520, margin: '0 auto' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>{t.successTitle}</h2>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.8, maxWidth: 380, margin: '0 auto' }}>
          {t.successBody}
        </p>
      </div>
    )
  }

  // ── Step 1: Profession picker ──────────────────────────────────────────────
  if (!category) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 4 }}>{t.pickTitle}</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{t.pickSub}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
          {PROFESSIONS.map(prof => (
            <button
              key={prof.value}
              type="button"
              onClick={() => setCategory(prof)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '18px 12px', borderRadius: 14, border: '2px solid #e2e8f0', background: '#fff', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#4A2E17'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(74,46,23,0.12)'; e.currentTarget.style.background = '#F8F1E8' }}
              onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.background = '#fff' }}
            >
              <span style={{ fontSize: 30 }}>{prof.icon}</span>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>{prof.label}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Step 2: Minimal form ───────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 520, margin: '0 auto' }}>

      <div style={{ marginBottom: 28 }}>
        <button
          type="button"
          onClick={() => setCategory(null)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F8F1E8', border: '1.5px solid #EADDCB', borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#4A2E17' }}
        >
          {category.icon} {category.label} <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 400 }}>{t.change}</span>
        </button>
      </div>

      <Field label={t.name} id="name" req error={errors.name}>
        <input id="name" value={form.name} onChange={e => set('name', e.target.value)}
          placeholder={t.namePh} style={inputStyle(!!errors.name)} />
      </Field>

      <Field label={t.city} id="city" req error={errors.city}>
        <input id="city" value={form.city} onChange={e => set('city', e.target.value)}
          placeholder={t.cityPh} style={inputStyle(!!errors.city)} />
      </Field>

      <Field label={t.whatsapp} id="whatsapp" req error={errors.whatsapp} hint={t.whatsappHint}>
        <input id="whatsapp" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)}
          placeholder="+94771234567" type="tel" style={inputStyle(!!errors.whatsapp)} />
      </Field>

      <div style={{ padding: '13px 16px', background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: '#15803d', margin: 0, lineHeight: 1.6 }}>
          {t.freeNote}
        </p>
      </div>

      {!signedIn && (
        <div style={{ padding: '13px 16px', background: '#F8F1E8', borderRadius: 12, border: '1px solid #EADDCB', marginBottom: 22 }}>
          <p style={{ fontSize: 12, color: '#6B4A2E', margin: 0, lineHeight: 1.6 }}>
            {t.googleNote}
          </p>
        </div>
      )}

      {errors.submit && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 13, color: '#dc2626', marginBottom: 18 }}>
          ⚠ {errors.submit}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{ width: '100%', padding: 14, background: submitting ? '#94a3b8' : '#4A2E17', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}
      >
        {submitting ? t.submitting : t.submit}
      </button>

      <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 14, lineHeight: 1.6 }}>
        {t.review}
      </p>
    </form>
  )
}
