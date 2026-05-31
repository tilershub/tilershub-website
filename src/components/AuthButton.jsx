import { useState, useEffect } from 'react'
import { supabase, signInWithOtp, signOut } from '../lib/supabase.js'

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
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <a
          href="/dashboard"
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
        )}
      </div>
      <style>{`@keyframes authSlideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  )
}
