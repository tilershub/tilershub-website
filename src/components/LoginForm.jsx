import { useState } from 'react'
import { signIn } from '../lib/authStore'
import { supabase } from '../lib/supabase'
import { Spinner } from './UI'

export default function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleLogin() {
    setError('')
    setLoading(true)
    try {
      const data = await signIn(form.email, form.password)
      const { data: prof } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()
      window.location.href = prof?.role === 'tiler' ? '/dashboard' : '/explore'
    } catch {
      setError('ඊමේල් හෝ මුරපදය වැරදිය. නැවත උත්සාහ කරන්න.')
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    if (!resetEmail) return
    setError('')
    setResetLoading(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + '/login',
      })
      if (resetError) throw resetError
      setResetSent(true)
    } catch {
      setError('ඊමේල් යැවීමේ දෝෂයකි. නැවත උත්සාහ කරන්න.')
    } finally {
      setResetLoading(false)
    }
  }

  const headerTitle = forgotMode ? 'මුරපදය නැවත සකසන්න' : 'නැවත සාදරයෙන් පිළිගනිමු'
  const headerSub   = forgotMode ? 'ඔබේ ඊමේල් ලිපිනය ඇතුළු කරන්න' : 'ඔබේ TilersHub ගිණුමට පිවිසෙන්න'

  return (
    <div>
      <div style={{ maxWidth: 440, margin: '0 auto', padding: '64px 20px' }}>
        <div style={{ background: 'var(--white)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 48px rgba(0,0,0,0.08)' }}>

          <div style={{
            background: 'linear-gradient(135deg, var(--charcoal) 0%, #2c2c2c 100%)',
            padding: '36px', position: 'relative', overflow: 'hidden', textAlign: 'center'
          }}>
            <div style={{ position: 'absolute', bottom: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(circle, var(--terracotta) 0%, transparent 70%)', opacity: 0.22 }} />
            <div style={{ position: 'absolute', top: -50, left: -50, width: 130, height: 130, background: 'radial-gradient(circle, var(--sage) 0%, transparent 70%)', opacity: 0.08 }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 3, width: 30, height: 30 }}>
                  {[0,1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} style={{
                      background: i === 8 ? 'transparent' : 'var(--terracotta)',
                      borderRadius: 2,
                      border: i === 8 ? '1px solid rgba(193,96,58,0.35)' : 'none',
                      opacity: i === 8 ? 1 : (i % 3 === 0 ? 1 : i % 3 === 1 ? 0.65 : 0.35),
                    }} />
                  ))}
                </div>
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: 'var(--white)', fontWeight: 700, marginBottom: 6 }}>{headerTitle}</div>
              <div style={{ fontSize: 13, color: 'rgba(245,240,232,0.45)' }}>{headerSub}</div>
            </div>
          </div>

          <div style={{ padding: '32px 36px' }}>
            {error && <div className="alert alert-error">{error}</div>}

            {forgotMode ? (
              resetSent ? (
                <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
                  <div style={{ fontSize: 52, marginBottom: 16 }}>📧</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: 'var(--charcoal)', marginBottom: 10 }}>ඊමේල් යවා ඇත!</div>
                  <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.9, marginBottom: 24 }}>
                    ඔබේ inbox පරීක්ෂා කරන්න. මුරපදය නැවත සකසන link ඊමේල් කර ඇත.
                  </p>
                  <button className="btn btn-ghost btn-full" onClick={() => { setForgotMode(false); setResetSent(false); setResetEmail('') }}>
                    ← ලොගින් වෙත ආපසු
                  </button>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">ඊමේල් <span className="req">*</span></label>
                    <input
                      className="form-input"
                      type="email"
                      placeholder="you@example.com"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleForgotPassword()}
                      autoFocus
                    />
                  </div>
                  <button
                    className="btn btn-primary btn-full btn-lg"
                    disabled={resetLoading || !resetEmail}
                    onClick={handleForgotPassword}
                  >
                    {resetLoading ? <><Spinner /> යවමින්...</> : '📧 නැවත සකසන ලිපිය යවන්න'}
                  </button>
                  <button className="btn btn-ghost btn-full" style={{ marginTop: 10 }} onClick={() => { setForgotMode(false); setError('') }}>
                    ← ආපසු
                  </button>
                </>
              )
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">ඊමේල් <span className="req">*</span></label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>මුරපදය <span className="req">*</span></span>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: 'var(--terracotta)', fontSize: 11, cursor: 'pointer', fontFamily: "'Noto Sans Sinhala', sans-serif", fontWeight: 600, padding: 0 }}
                      onClick={() => { setForgotMode(true); setError('') }}
                    >
                      මුරපදය අමතකද?
                    </button>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="form-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="ඔබේ මුරපදය"
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                      style={{ paddingRight: 46 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      style={{
                        position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', fontSize: 17,
                        color: 'var(--text-light)', display: 'flex', alignItems: 'center', lineHeight: 1,
                      }}
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-full btn-lg"
                  style={{ marginTop: 4 }}
                  disabled={loading || !form.email || !form.password}
                  onClick={handleLogin}
                >
                  {loading ? <><Spinner /> පිවිසෙමින්...</> : '→ පිවිසෙන්න'}
                </button>

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-light)' }}>
                  ගිණුමක් නැද්ද?{' '}
                  <a href="/register" style={{ color: 'var(--terracotta)', fontWeight: 600 }}>ලියාපදිංචි වන්න</a>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
