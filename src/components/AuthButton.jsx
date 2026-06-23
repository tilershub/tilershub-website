import { useState, useEffect } from 'react'
import { supabase, signInWithOtp, signInWithGoogle, signOut } from '../lib/supabase.js'

export default function AuthButton() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return null

  if (user) {
    const initials = (user.email || '?').slice(0, 2).toUpperCase()
    const isAdmin = user.email === 'tilershub@gmail.com'
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {isAdmin ? (
          <a
            href="/admin"
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '5px 12px 5px 6px',
              borderRadius: 10,
              background: 'var(--navy-50)',
              border: '1.5px solid var(--navy-100)',
              color: 'var(--navy)',
              fontSize: 13, fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <div style={{
              width: 26, height: 26, borderRadius: 8,
              background: 'var(--navy)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, flexShrink: 0,
            }}>{initials}</div>
            Dashboard
          </a>
        ) : (
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--navy)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, flexShrink: 0,
          }}>{initials}</div>
        )}
        <button
          onClick={async () => { await signOut(); window.location.href = '/' }}
          title="Sign out"
          style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text-4)', fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >↩</button>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          fontSize: 13, fontWeight: 600,
          padding: '7px 14px',
          borderRadius: 10,
          background: 'transparent',
          color: 'var(--text-2)',
          border: '1.5px solid var(--border)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Sign In
      </button>
      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  )
}

function AuthModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSend(e) {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) { setError('Enter a valid email address'); return }
    setLoading(true)
    setError('')
    const { error: err } = await signInWithOtp(email.trim())
    setLoading(false)
    if (err) { setError(err.message || 'Something went wrong'); return }
    setSent(true)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        zIndex: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: 20, padding: 32,
        width: '100%', maxWidth: 400,
        boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
        animation: 'authSlideUp 0.2s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
              Sign in to TilersHub
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>We'll send a magic link to your email</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-4)', lineHeight: 1 }}>✕</button>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>📬</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Check your inbox</div>
            <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.7, maxWidth: 280, margin: '0 auto 20px' }}>
              We sent a sign-in link to <strong>{email}</strong>. Click it to access your dashboard.
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-4)' }}>Didn't receive it? Check your spam folder.</p>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              style={{
                width: '100%', padding: '13px', marginBottom: 14,
                background: '#fff', color: '#374151',
                border: '1.5px solid #d1d5db', borderRadius: 10,
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-4)', fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            <form onSubmit={handleSend}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoFocus
                  style={{
                    width: '100%', padding: '12px 14px',
                    border: `1.5px solid ${error ? '#fca5a5' : 'var(--border)'}`,
                    borderRadius: 10, fontSize: 14, outline: 'none',
                    fontFamily: 'inherit',
                    background: error ? '#fef2f2' : '#fff',
                  }}
                />
                {error && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>⚠ {error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '13px',
                  background: loading ? '#94a3b8' : 'var(--navy)',
                  color: '#fff', border: 'none', borderRadius: 10,
                  fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? '⏳ Sending...' : '✉️ Send Magic Link'}
              </button>

              <p style={{ fontSize: 11, color: 'var(--text-4)', textAlign: 'center', marginTop: 14, lineHeight: 1.6 }}>
                No password needed — we use secure one-click email links.
              </p>
            </form>
          </>
        )}
      </div>
      <style>{`@keyframes authSlideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  )
}
