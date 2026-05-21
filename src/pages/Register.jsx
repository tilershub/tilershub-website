import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase, DISTRICTS, SERVICES, uploadAvatar } from '../lib/supabase'
import { Footer, ServiceCheckGrid, Spinner } from '../components/UI'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const avatarRef = useRef()

  const [role, setRole] = useState('') // 'tiler' | 'homeowner'
  const [step, setStep] = useState(1) // 1=role, 2=account, 3=profile
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    full_name: '', phone: '', district: '',
    bio: '', experience_years: '', daily_rate_min: '', daily_rate_max: '',
    services: []
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSubmit() {
    setError('')
    if (form.password !== form.confirmPassword) { setError('මුරපද දෙක නොගැළපේ'); return }
    if (form.password.length < 6) { setError('මුරපදය අවම අකුරු 6ක් විය යුතුය'); return }
    if (role === 'tiler' && form.services.length === 0) { setError('අවම සේවාවක් තෝරන්න'); return }

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
      }
      const { user } = await signUp(form.email, form.password, role, profileData)

      if (avatarFile && user) {
        try {
          const url = await uploadAvatar(user.id, avatarFile)
          await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
        } catch (_) {}
      }

      navigate(role === 'tiler' ? '/dashboard' : '/explore')
    } catch (err) {
      setError(err.message === 'User already registered' ? 'මෙම ඊමේල් ලිපිනය දැනටමත් ලියාපදිංචි වී ඇත' : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '48px 20px' }}>

        {/* Step 1: Role selection */}
        {step === 1 && (
          <div style={{ textAlign: 'center' }}>
            <span className="section-tag">ලියාපදිංචිය</span>
            <h1 className="section-title" style={{ marginBottom: 8 }}>ඔබ කවුද?</h1>
            <p style={{ color: 'var(--text-mid)', fontSize: 14, marginBottom: 40 }}>ඔබේ භූමිකාව තෝරා ලියාපදිංචිය ආරම්භ කරන්න</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              {[
                { r: 'tiler', icon: '🔨', title: 'ටයිලර්', desc: 'ගෙදර හිමියන් හා ව්‍යාපෘති සොයා ඔබේ ව්‍යාපාරය ව්‍යාප්ත කරගන්න' },
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
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: 44, marginBottom: 16 }}>{icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 8 }}>{title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.7 }}>{desc}</div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-full btn-lg" disabled={!role} onClick={() => setStep(2)}>
              ඉදිරියට →
            </button>
            <p style={{ marginTop: 20, fontSize: 13, color: 'var(--text-light)' }}>
              දැනටමත් ගිණුමක් ඇතිද? <Link to="/login" style={{ color: 'var(--terracotta)', fontWeight: 600 }}>පිවිසෙන්න</Link>
            </p>
          </div>
        )}

        {/* Step 2: Account details */}
        {step === 2 && (
          <div style={{ background: 'var(--white)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 48px rgba(0,0,0,0.08)' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--charcoal) 0%, #2c2c2c 100%)', padding: '32px 36px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: -40, right: -40, width: 120, height: 120, background: 'radial-gradient(circle, var(--terracotta) 0%, transparent 70%)', opacity: 0.3 }} />
              <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'rgba(245,240,232,0.4)', cursor: 'pointer', fontSize: 13, marginBottom: 16, padding: 0 }}>← ආපසු</button>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: 'var(--white)', fontWeight: 700, marginBottom: 4 }}>ගිණුම් විස්තර</h2>
              <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.45)' }}>{role === 'tiler' ? 'ටයිලර් ගිණුමක්' : 'ගෘහ හිමිකරු ගිණුමක්'} සාදා ගන්න</p>
            </div>
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
                </div>
              </div>
              <button className="btn btn-primary btn-full btn-lg" disabled={!form.email || !form.password} onClick={() => { setError(''); setStep(3) }}>
                ඉදිරියට →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Profile details */}
        {step === 3 && (
          <div style={{ background: 'var(--white)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 48px rgba(0,0,0,0.08)' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--charcoal) 0%, #2c2c2c 100%)', padding: '32px 36px' }}>
              <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: 'rgba(245,240,232,0.4)', cursor: 'pointer', fontSize: 13, marginBottom: 16, padding: 0 }}>← ආපසු</button>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: 'var(--white)', fontWeight: 700, marginBottom: 4 }}>
                {role === 'tiler' ? 'ටයිලර් ප්‍රොෆයිලය' : 'ඔබ ගැන'}
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.45)' }}>ඔබ ගැන ගෘහ හිමිකරුවන්ට දන්වන්න</p>
            </div>
            <div style={{ padding: '32px 36px' }}>
              {error && <div className="alert alert-error">{error}</div>}

              {/* Avatar upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                <div
                  onClick={() => avatarRef.current?.click()}
                  style={{
                    width: 80, height: 80, borderRadius: 14,
                    background: avatarPreview ? 'transparent' : 'var(--cream)',
                    border: '2px dashed var(--cream-dark)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
                    transition: 'border-color 0.2s'
                  }}
                >
                  {avatarPreview ? <img src={avatarPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 28 }}>📷</span>}
                </div>
                <div>
                  <button className="btn btn-ghost" style={{ fontSize: 12, padding: '8px 16px' }} onClick={() => avatarRef.current?.click()}>
                    ඡායාරූපය අップ්ලෝඩ් කරන්න
                  </button>
                  <div className="form-hint" style={{ marginTop: 6 }}>JPG, PNG · 5MB දක්වා</div>
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
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">අත්දැකීම (වසර) <span className="req">*</span></label>
                      <input className="form-input" type="number" min="0" max="60" placeholder="5" value={form.experience_years} onChange={e => set('experience_years', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">දෛනික ගාස්තු (Rs.)</label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input className="form-input" type="number" placeholder="අවම" value={form.daily_rate_min} onChange={e => set('daily_rate_min', e.target.value)} />
                        <span style={{ color: 'var(--text-light)', flexShrink: 0 }}>–</span>
                        <input className="form-input" type="number" placeholder="උපරිම" value={form.daily_rate_max} onChange={e => set('daily_rate_max', e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">ඔබ ගැන <span className="req">*</span></label>
                    <textarea className="form-textarea" placeholder="ඔබේ විශේෂඥ ක්ෂේත්‍ර, ව්‍යාපෘති, ඔබේ ශෛලිය..." value={form.bio} onChange={e => set('bio', e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">සේවා <span className="req">*</span></label>
                    <ServiceCheckGrid services={SERVICES} selected={form.services} onChange={v => set('services', v)} />
                  </div>
                </>
              )}

              <button
                className="btn btn-primary btn-full btn-lg"
                style={{ marginTop: 8 }}
                disabled={loading || !form.full_name || !form.district || (role === 'tiler' && form.services.length === 0)}
                onClick={handleSubmit}
              >
                {loading ? <><Spinner /> ලියාපදිංචි කරමින්...</> : '✓ ප්‍රොෆයිලය සාදන්න'}
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
