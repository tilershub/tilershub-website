import { useState, useRef } from 'react'
import { signUp } from '../lib/authStore'
import { supabase, DISTRICTS, SERVICES, uploadAvatar } from '../lib/supabase'
import { ServiceCheckGrid, Spinner } from './UI'

function StepIndicator({ currentStep }) {
  const steps = ['භූමිකාව', 'ගිණුම', 'ප්‍රොෆයිලය']
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', marginBottom: 36 }}>
      {steps.map((label, i) => {
        const num = i + 1
        const done   = currentStep > num
        const active = currentStep === num
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-start' }}>
            {i > 0 && (
              <div style={{
                width: 52, height: 2, flexShrink: 0, marginTop: 15,
                background: done ? 'var(--terracotta)' : 'var(--cream-dark)',
                transition: 'background 0.3s',
              }} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 60 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: done ? 'var(--terracotta)' : active ? 'var(--charcoal)' : 'var(--cream)',
                border: active ? '2.5px solid var(--terracotta)' : done ? 'none' : '2px solid var(--cream-dark)',
                color: done || active ? 'white' : 'var(--text-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, transition: 'all 0.3s',
                boxShadow: active ? '0 0 0 4px rgba(193,96,58,0.12)' : 'none',
              }}>
                {done ? '✓' : num}
              </div>
              <div style={{
                fontSize: 10, fontWeight: active ? 700 : 400, whiteSpace: 'nowrap', textAlign: 'center',
                color: done ? 'var(--terracotta)' : active ? 'var(--charcoal)' : 'var(--text-light)',
              }}>
                {label}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function RegisterForm() {
  const avatarRef = useRef()

  const [role, setRole] = useState('')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    full_name: '', phone: '', district: '',
    bio: '', experience_years: '', daily_rate_min: '', daily_rate_max: '',
    services: [], availability: 'available',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  function advanceToStep3() {
    setError('')
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('නිවැරදි ඊමේල් ලිපිනයක් ඇතුළු කරන්න')
      return
    }
    if (!form.phone || form.phone.replace(/\D/g, '').length < 9) {
      setError('නිවැරදි WhatsApp අංකයක් ඇතුළු කරන්න (07XXXXXXXX)')
      return
    }
    if (form.password.length < 6) {
      setError('මුරපදය අවම අකුරු 6ක් විය යුතුය')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('මුරපද දෙක නොගැළපේ')
      return
    }
    setStep(3)
  }

  async function handleSubmit() {
    setError('')
    if (role === 'tiler' && form.services.length === 0) {
      setError('අවම සේවාවක් තෝරන්න')
      return
    }
    setLoading(true)
    try {
      const profileData = {
        full_name: form.full_name,
        phone: form.phone.replace(/^0/, '94'),
        district: form.district,
        bio: form.bio,
        experience_years: parseInt(form.experience_years) || 1,
        daily_rate_min: parseInt(form.daily_rate_min) || null,
        daily_rate_max: parseInt(form.daily_rate_max) || null,
        services: form.services,
        availability: form.availability,
      }
      const { user } = await signUp(form.email, form.password, role, profileData)

      if (avatarFile && user) {
        try {
          const url = await uploadAvatar(user.id, avatarFile)
          await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
        } catch (_) {}
      }

      window.location.href = role === 'tiler' ? '/dashboard' : '/explore'
    } catch (err) {
      setError(err.message === 'User already registered'
        ? 'මෙම ඊමේල් ලිපිනය දැනටමත් ලියාපදිංචි වී ඇත'
        : err.message)
    } finally {
      setLoading(false)
    }
  }

  const cardStyle = {
    background: 'var(--white)', borderRadius: 20,
    overflow: 'hidden', boxShadow: '0 8px 48px rgba(0,0,0,0.08)',
  }
  const darkHeader = (title, sub, onBack) => (
    <div style={{ background: 'linear-gradient(135deg, var(--charcoal) 0%, #2c2c2c 100%)', padding: '32px 36px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', bottom: -40, right: -40, width: 120, height: 120, background: 'radial-gradient(circle, var(--terracotta) 0%, transparent 70%)', opacity: 0.28 }} />
      {onBack && (
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(245,240,232,0.45)', cursor: 'pointer', fontSize: 13, marginBottom: 14, padding: 0, fontFamily: "'Noto Sans Sinhala', sans-serif" }}>
          ← ආපසු
        </button>
      )}
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: 'var(--white)', fontWeight: 700, marginBottom: 4, position: 'relative' }}>{title}</h2>
      <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.45)', position: 'relative' }}>{sub}</p>
    </div>
  )

  return (
    <div>
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '48px 20px' }}>

        <StepIndicator currentStep={step} />

        {step === 1 && (
          <div style={{ textAlign: 'center' }}>
            <span className="section-tag">ලියාපදිංචිය</span>
            <h1 className="section-title" style={{ marginBottom: 8 }}>ඔබ කවුද?</h1>
            <p style={{ color: 'var(--text-mid)', fontSize: 14, marginBottom: 40 }}>ඔබේ භූමිකාව තෝරා ලියාපදිංචිය ආරම්භ කරන්න</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              {[
                { r: 'tiler',     icon: '🔨', title: 'ටයිලර්',      desc: 'ගෙදර හිමියන් හා ව්‍යාපෘති සොයා ඔබේ ව්‍යාපාරය ව්‍යාප්ත කරගන්න' },
                { r: 'homeowner', icon: '🏠', title: 'ගෘහ හිමිකරු', desc: 'ඔබේ ව්‍යාපෘතිය සඳහා දක්ෂ ටයිලර් සොයා ගෙදර ලස්සන කරගන්න' },
              ].map(({ r, icon, title, desc }) => (
                <div
                  key={r}
                  onClick={() => setRole(r)}
                  className="card"
                  style={{
                    padding: '32px 24px', cursor: 'pointer', textAlign: 'center',
                    border: role === r ? '2px solid var(--terracotta)' : '1.5px solid var(--cream-dark)',
                    background: role === r ? 'rgba(193,96,58,0.04)' : 'var(--white)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: 44, marginBottom: 16 }}>{icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 8 }}>{title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.7 }}>{desc}</div>
                  {role === r && (
                    <div style={{ marginTop: 14, fontSize: 11, color: 'var(--terracotta)', fontWeight: 700 }}>✓ තෝරා ගත්තා</div>
                  )}
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-full btn-lg" disabled={!role} onClick={() => setStep(2)}>
              ඉදිරියට →
            </button>
            <p style={{ marginTop: 20, fontSize: 13, color: 'var(--text-light)' }}>
              දැනටමත් ගිණුමක් ඇතිද?{' '}
              <a href="/login" style={{ color: 'var(--terracotta)', fontWeight: 600 }}>පිවිසෙන්න</a>
            </p>
          </div>
        )}

        {step === 2 && (
          <div style={cardStyle}>
            {darkHeader(
              'ගිණුම් විස්තර',
              role === 'tiler' ? 'ටයිලර් ගිණුමක් සාදා ගන්න' : 'ගෘහ හිමිකරු ගිණුමක් සාදා ගන්න',
              () => setStep(1)
            )}
            <div style={{ padding: '32px 36px' }}>
              {error && <div className="alert alert-error">{error}</div>}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">ඊමේල් <span className="req">*</span></label>
                  <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp අංකය <span className="req">*</span></label>
                  <input className="form-input" placeholder="07XXXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
                  <div className="form-hint">ගෘහ හිමිකරුවන් ළඟා වන්නේ මෙම අංකයෙනි</div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">මුරපදය <span className="req">*</span></label>
                  <input className="form-input" type="password" placeholder="අවම 6 අකුරු" value={form.password} onChange={e => set('password', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">මුරපදය නැවත <span className="req">*</span></label>
                  <input className="form-input" type="password" placeholder="නැවත ලියන්න" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <div className="form-error">මුරපද දෙක නොගැළපේ</div>
                  )}
                </div>
              </div>
              <button
                className="btn btn-primary btn-full btn-lg"
                disabled={!form.email || !form.password}
                onClick={advanceToStep3}
              >
                ඉදිරියට →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={cardStyle}>
            {darkHeader(
              role === 'tiler' ? 'ළඟ ළඟ ඉවරයි!' : 'ඔබ ගැන',
              role === 'tiler' ? 'ඔබේ සේවා තෝරන්න — ඉතිරිය පසුව' : 'ඔබේ නම සහ ස්ථානය',
              () => setStep(2)
            )}
            <div style={{ padding: '32px 36px' }}>
              {error && <div className="alert alert-error">{error}</div>}

              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, padding: '16px', background: 'var(--cream)', borderRadius: 12 }}>
                <div
                  onClick={() => avatarRef.current?.click()}
                  style={{
                    width: 72, height: 72, borderRadius: 12, flexShrink: 0,
                    background: avatarPreview ? 'transparent' : 'var(--white)',
                    border: '2px dashed var(--cream-dark)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.2s',
                  }}
                >
                  {avatarPreview
                    ? <img src={avatarPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 26 }}>📷</span>
                  }
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--charcoal)', marginBottom: 4 }}>
                    {avatarPreview ? 'ඡායාරූපය තෝරා ඇත ✓' : 'ඡායාරූපයක් එකතු කරන්න'}
                  </div>
                  <div className="form-hint" style={{ marginBottom: 8 }}>JPG, PNG · 5MB දක්වා (ऐच්ඡිකව)</div>
                  <button className="btn btn-ghost" style={{ fontSize: 11, padding: '6px 14px' }} onClick={() => avatarRef.current?.click()}>
                    {avatarPreview ? '↺ වෙනස් කරන්න' : '+ ඡායාරූපය තෝරන්න'}
                  </button>
                </div>
                <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">සම්පූර්ණ නම <span className="req">*</span></label>
                  <input className="form-input" placeholder="ඔබේ නම" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">දිස්ත්‍රික්කය <span className="req">*</span></label>
                  <select className="form-select" value={form.district} onChange={e => set('district', e.target.value)}>
                    <option value="">-- තෝරන්න --</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {role === 'tiler' && (
                <>
                  <div className="form-group">
                    <label className="form-label">අත්දැකීම (වසර) <span className="req">*</span></label>
                    <input className="form-input" type="number" min="0" max="60" placeholder="5" value={form.experience_years} onChange={e => set('experience_years', e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">ඔබ ලබා දෙන සේවා <span className="req">*</span></label>
                    <ServiceCheckGrid services={SERVICES} selected={form.services} onChange={v => set('services', v)} />
                  </div>

                  <div style={{ background: 'rgba(122,154,126,0.07)', border: '1px solid rgba(122,154,126,0.2)', borderRadius: 10, padding: '12px 16px', marginTop: 4, marginBottom: 4 }}>
                    <div style={{ fontSize: 11, color: 'var(--sage)', fontWeight: 700, marginBottom: 3 }}>
                      ✓ ඉතිරිය dashboard හරහා සම්පූර්ණ කළ හැකිය
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-mid)', lineHeight: 1.75 }}>
                      sqft ගාස්තු, ඔබ ගැන, ෆොෙටෝ — ලියාපදිංචියෙන් පසු dashboard හිදී සැකසිය හැකිය.
                    </div>
                  </div>
                </>
              )}

              {role === 'homeowner' && (
                <div style={{ background: 'rgba(193,96,58,0.05)', border: '1px solid rgba(193,96,58,0.15)', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
                  <div style={{ fontSize: 13, color: 'var(--terracotta)', fontWeight: 700, marginBottom: 6 }}>🏠 ගෘහ හිමිකරු ගිණුම</div>
                  <p style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.8 }}>
                    ගිණුම සාදා ගැනීමෙන් පසු ශ්‍රී ලංකාව පුරා දක්ෂ ටයිලර්වරුන් WhatsApp හරහා සෙවිය හැකිය.
                  </p>
                </div>
              )}

              <button
                className="btn btn-primary btn-full btn-lg"
                style={{ marginTop: 8 }}
                disabled={loading || !form.full_name || !form.district || (role === 'tiler' && form.services.length === 0)}
                onClick={handleSubmit}
              >
                {loading ? <><Spinner /> ලියාපදිංචි කරමින්...</> : '✓ ගිණුම සාදන්න'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
