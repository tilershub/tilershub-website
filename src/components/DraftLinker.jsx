import { useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const DRAFT_KEY   = 'tilershub_draft_token'
const CLAIM_KEY   = 'tilershub_pending_claim'

async function linkPending(user) {
  // 1. Link anonymous draft project to signed-in account
  const token = localStorage.getItem(DRAFT_KEY)
  if (token) {
    await supabase
      .from('projects')
      .update({ user_id: user.id, session_token: null })
      .eq('session_token', token)
      .is('user_id', null)
    localStorage.removeItem(DRAFT_KEY)
  }

  // 2. Complete a pending profile claim
  const claimRaw = localStorage.getItem(CLAIM_KEY)
  if (claimRaw) {
    try {
      const { profileId, profileType } = JSON.parse(claimRaw)
      const table = profileType === 'tiler' ? 'tilers' : 'providers'
      const { error } = await supabase
        .from(table)
        .update({ user_id: user.id })
        .eq('id', profileId)
        .is('user_id', null)
      localStorage.removeItem(CLAIM_KEY)
      if (!error) {
        // Redirect to dashboard so they can see their claimed profile
        const params = new URLSearchParams(window.location.search)
        if (!params.has('claimed')) {
          window.location.href = '/dashboard?claimed=1'
        }
      }
    } catch {}
  }
}

export default function DraftLinker() {
  useEffect(() => {
    // Run on initial load if already signed in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) linkPending(user)
    })

    // Run whenever auth state changes (e.g. magic link click)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        linkPending(session.user)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  return null
}
