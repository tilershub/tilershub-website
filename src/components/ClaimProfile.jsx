import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const CLAIM_KEY = 'tilershub_pending_claim'

export default function ClaimProfile({ profileId, profileType, profileName, isClaimed }) {
  const [user, setUser]     = useState(null)
  const [ready, setReady]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [claimed, setClaimed] = useState(isClaimed)
  const [err, setErr]       = useState('')

  async function claimDirectly(u) {
    const activeUser = u || user
    if (!activeUser?.id) return
    setLoading(true); setErr('')
    try {
      const table = profileType === 'tiler' ? 'tilers' : 'providers'
      const { data: profile, error: fetchErr } = await supabase
        .from(table).select('whatsapp,phone').eq('id', profileId).single()
      if (fetchErr) throw fetchErr

      const whatsapp = profile.whatsapp || profile.phone || null
      if (!whatsapp) {
        setErr('No WhatsApp number is linked to this profile yet. Contact TilersHub to claim it.')
        setLoading(false)
        return
      }

      const code = String(Math.floor(10000 + Math.random() * 90000))
      const { data: claim, error: insertErr } = await supabase
        .from('claim_requests')
        .insert({ profile_id: profileId, profile_type: profileType, profile_name: profileName, user_id: activeUser.id, whatsapp, code })
        .select('id').single()
      if (insertErr) throw insertErr

      window.location.href = `/verify-claim?id=${claim.id}`
    } catch {
      setErr('Something went wrong — please try again.')
      setLoading(false)
    }
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u)
      setReady(true)
      if (u) {
        const raw = localStorage.getItem(CLAIM_KEY)
        if (raw) {
          localStorage.removeItem(CLAIM_KEY)
          claimDirectly(u)
        }
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  if (!ready || claimed) return null

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
          onClick={() => claimDirectly()}
          disabled={loading}
          style={{ width: '100%', padding: '10px', background: loading ? '#94a3b8' : '#1B3A6B', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? '⏳ Starting…' : '✋ Claim this Profile'}
        </button>
      </div>
    )
  }

  return (
    <div style={panelStyle}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Is this your profile?</div>
      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12, lineHeight: 1.6 }}>
        Sign in with Google to claim <strong>{profileName}</strong> and manage it from your dashboard.
      </p>
      {err && <p style={{ fontSize: 11, color: '#dc2626', marginBottom: 8 }}>⚠ {err}</p>}
      <button
        onClick={() => {
          localStorage.setItem(CLAIM_KEY, JSON.stringify({ profileId, profileType, profileName }))
          supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback?claim_return=${encodeURIComponent(window.location.pathname)}`,
            },
          })
        }}
        style={{ width: '100%', padding: '10px', background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24"><path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Sign in with Google to Claim
      </button>
    </div>
  )
}
