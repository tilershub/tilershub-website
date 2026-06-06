import { useState, useEffect } from 'react'
import { supabase, signInWithOtp } from '../lib/supabase.js'

const CLAIM_KEY = 'tilershub_pending_claim'

export default function ClaimProfile({ profileId, profileType, profileName, isClaimed }) {
  const [user, setUser]           = useState(null)
  const [ready, setReady]         = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [email, setEmail]         = useState('')
  const [sent, setSent]           = useState(false)
  const [loading, setLoading]     = useState(false)
  const [claimed, setClaimed]     = useState(isClaimed)
  const [err, setErr]             = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => { setUser(u); setReady(true) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  if (!ready || claimed) return null

  async function claimDirectly() {
    setLoading(true); setErr('')
    try {
      const table = profileType === 'tiler' ? 'tilers' : 'providers'
      const { data: profile, error: fetchErr } = await supabase
        .from(table).select('whatsapp').eq('id', profileId).single()
      if (fetchErr) throw fetchErr

      const code = String(Math.floor(10000 + Math.random() * 90000))
      const { data: claim, error: insertErr } = await supabase
        .from('claim_requests')
        .insert({ profile_id: profileId, profile_type: profileType, profile_name: profileName, user_id: user.id, whatsapp: profile.whatsapp, code })
        .select('id').single()
      if (insertErr) throw insertErr

      window.location.href = `/verify-claim?id=${claim.id}`
    } catch {
      setErr('Something went wrong — please try again.')
      setLoading(false)
    }
  }

  async function sendLink(e) {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) { setErr('Enter a valid email address'); return }
    setErr('')
    localStorage.setItem(CLAIM_KEY, JSON.stringify({ profileId, profileType, profileName }))
    const { error } = await signInWithOtp(email.trim())
    if (error) { setErr(error.message); return }
    setSent(true)
  }

  const panelStyle = {
    marginTop: 10, padding: '16px', background: '#f8fafc',
    border: '1.5px solid #e2e8f0', borderRadius: 14,
  }

  if (user) {
    return (
      <div style={panelStyle}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 8 }}>Is this your profile?</div>
        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 10, lineHeight: 1.6 }}>
          Claim it to manage it from your dashboard. We'll verify your identity via the WhatsApp number on this profile.
        </p>
        {err && <p style={{ fontSize: 11, color: '#dc2626', marginBottom: 8 }}>⚠ {err}</p>}
        <button
          onClick={claimDirectly}
          disabled={loading}
          style={{ width: '100%', padding: '10px', background: loading ? '#94a3b8' : '#1B3A6B', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? '⏳ Starting…' : '✋ Claim this Profile'}
        </button>
      </div>
    )
  }

  if (!showPanel) {
    return (
      <button
        onClick={() => setShowPanel(true)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', marginTop: 10, padding: '9px 14px', background: 'transparent', border: '1.5px dashed #cbd5e1', borderRadius: 10, fontSize: 12, fontWeight: 600, color: '#94a3b8', cursor: 'pointer' }}
      >
        ✋ Is this you? Claim this profile
      </button>
    )
  }

  return (
    <div style={panelStyle}>
      {sent ? (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📬</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Check your inbox</div>
          <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
            Click the link in your email to continue. We'll then verify via the WhatsApp number on <strong>{profileName}</strong>'s profile.
          </p>
        </div>
      ) : (
        <form onSubmit={sendLink}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Claim <em>{profileName}</em></div>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12, lineHeight: 1.6 }}>
            Enter your email to get started. After signing in, we'll send a verification code to the WhatsApp number on this profile.
          </p>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setErr('') }}
            placeholder="your@email.com"
            style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${err ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 10, fontSize: 13, outline: 'none', fontFamily: 'inherit', marginBottom: 8, boxSizing: 'border-box' }}
          />
          {err && <p style={{ fontSize: 11, color: '#dc2626', marginBottom: 8 }}>⚠ {err}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={{ flex: 1, padding: '9px', background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Send Sign-in Link →
            </button>
            <button type="button" onClick={() => setShowPanel(false)} style={{ padding: '9px 12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontSize: 12, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
          <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 8, textAlign: 'center' }}>
            No password — we use secure one-click email links.
          </p>
        </form>
      )}
    </div>
  )
}
