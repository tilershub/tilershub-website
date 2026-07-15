import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

export default function VerifyClaimForm() {
  const [status, setStatus]   = useState('loading') // loading | pending | verified | expired | error
  const [info, setInfo]       = useState(null)       // { profile_name, masked_whatsapp }
  const [claimId, setClaimId] = useState(null)
  const [code, setCode]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr]         = useState('')

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id')
    if (!id) { setStatus('error'); return }
    setClaimId(id)

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        // Not signed in — magic link hasn't been clicked yet; tell them to check email
        setStatus('awaiting_auth')
        return
      }
      const { data, error: rpcErr } = await supabase.rpc('get_claim_status', { p_claim_id: id })
      if (rpcErr) { setStatus('error'); return }
      if (!data) { setStatus('expired'); return }
      if (data.status === 'verified') { setStatus('verified'); return }
      if (data.status === 'pending_code') {
        setInfo(data)
        setStatus('pending')
      } else {
        setStatus('expired')
      }
    })
  }, [])

  async function submit(e) {
    e.preventDefault()
    const trimmed = code.trim()
    if (trimmed.length !== 5 || !/^\d+$/.test(trimmed)) { setErr('Enter the 5-digit code from WhatsApp'); return }
    setSubmitting(true); setErr('')
    const { data: result, error } = await supabase.rpc('verify_claim', { p_claim_id: claimId, p_code: trimmed })
    setSubmitting(false)
    if (error) { setErr('Something went wrong. Please try again.'); return }
    if (result === 'ok') { window.location.href = '/provider?claimed=1'; return }
    if (result === 'wrong_code') { setErr('That code is incorrect. Check the WhatsApp message and try again.'); return }
    if (result === 'not_found') { setStatus('expired'); return }
    setErr('Unexpected error. Please try again.')
  }

  const box = { maxWidth: 480, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '36px 28px', textAlign: 'center' }

  if (status === 'loading') {
    return <div style={box}><div style={{ fontSize: 24, marginBottom: 12 }}>⏳</div><p style={{ color: '#64748b', fontSize: 14 }}>Loading…</p></div>
  }

  if (status === 'awaiting_auth') {
    return (
      <div style={box}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Sign in to continue</h2>
        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, marginBottom: 20 }}>
          You need to be signed in to complete this profile claim. Sign in with Google to pick up where you left off.
        </p>
        <button
          onClick={() => {
            supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: `${window.location.origin}/auth/callback?verify_return=${encodeURIComponent(window.location.pathname + window.location.search)}`
              }
            })
          }}
          style={{ width: '100%', padding: '11px', background: '#0F766E', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 10 }}
        >
          Sign in with Google →
        </button>
        <a href="/providers" style={{ display: 'block', fontSize: 12, color: '#94a3b8', textDecoration: 'none', textAlign: 'center' }}>← Browse Profiles</a>
      </div>
    )
  }

  if (status === 'verified') {
    return (
      <div style={box}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Profile already claimed</h2>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20, lineHeight: 1.7 }}>This profile has already been verified and linked to an account.</p>
        <a href="/provider" style={{ padding: '10px 22px', background: '#0F766E', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>Go to Dashboard →</a>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div style={box}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Something went wrong</h2>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20, lineHeight: 1.7 }}>
          We couldn't load your claim details. Please refresh and try again.
        </p>
        <button onClick={() => window.location.reload()} style={{ padding: '10px 22px', background: '#0F766E', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Try Again →</button>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div style={box}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⏱</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Link expired or not found</h2>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20, lineHeight: 1.7 }}>
          This verification link has expired or is invalid. Go back to the profile page to start a new claim.
        </p>
        <a href="/providers" style={{ padding: '10px 22px', background: '#0F766E', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>Browse Profiles →</a>
      </div>
    )
  }

  // status === 'pending'
  return (
    <div style={{ ...box, textAlign: 'left' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>📲</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
          Verify your claim
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>
          We're claiming <strong>{info?.profile_name}</strong>. Our team will WhatsApp a 5-digit code to the number on this profile ({info?.masked_whatsapp}). Enter it below once you receive it.
        </p>
      </div>

      <div style={{ padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, marginBottom: 24 }}>
        <p style={{ fontSize: 12, color: '#92400e', margin: 0, lineHeight: 1.6 }}>
          ⏳ <strong>Waiting for our team</strong> — codes are usually sent within a few hours during business hours (8am–8pm SL time).
        </p>
      </div>

      <form onSubmit={submit}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
          5-digit verification code
        </label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          value={code}
          onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setErr('') }}
          placeholder="_ _ _ _ _"
          style={{ width: '100%', padding: '14px', border: `2px solid ${err ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 12, fontSize: 22, fontWeight: 700, textAlign: 'center', letterSpacing: '0.3em', outline: 'none', fontFamily: 'inherit', background: err ? '#fef2f2' : '#fff', boxSizing: 'border-box', marginBottom: 8 }}
        />
        {err && <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 10 }}>⚠ {err}</p>}
        <button
          type="submit"
          disabled={submitting || code.length !== 5}
          style={{ width: '100%', padding: '13px', background: (submitting || code.length !== 5) ? '#94a3b8' : '#D97706', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: (submitting || code.length !== 5) ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
        >
          {submitting ? '⏳ Verifying…' : 'Verify & Claim Profile →'}
        </button>
      </form>

      <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
        Didn't receive a code? Contact us at{' '}
        <a href="https://wa.me/94774503744" style={{ color: '#64748b' }}>WhatsApp</a>.
        This link expires in 48 hours.
      </p>
    </div>
  )
}
