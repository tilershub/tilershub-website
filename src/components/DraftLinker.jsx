import { useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const DRAFT_KEY = 'tilershub_draft_token'
const CLAIM_KEY = 'tilershub_pending_claim'

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

  // 2. Create a WhatsApp-verified claim request for pending profile claims
  const claimRaw = localStorage.getItem(CLAIM_KEY)
  if (claimRaw) {
    try {
      const { profileId, profileType, profileName } = JSON.parse(claimRaw)
      const table = profileType === 'tiler' ? 'tilers' : 'providers'

      const { data: profile } = await supabase
        .from(table).select('whatsapp').eq('id', profileId).single()

      if (profile?.whatsapp) {
        const code = String(Math.floor(10000 + Math.random() * 90000))
        const { data: claim, error } = await supabase
          .from('claim_requests')
          .insert({ profile_id: profileId, profile_type: profileType, profile_name: profileName, user_id: user.id, whatsapp: profile.whatsapp, code })
          .select('id').single()

        localStorage.removeItem(CLAIM_KEY)

        if (!error && claim) {
          window.location.href = `/verify-claim?id=${claim.id}`
        }
      }
    } catch {}
  }
}

export default function DraftLinker() {
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) linkPending(user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        linkPending(session.user)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  return null
}
