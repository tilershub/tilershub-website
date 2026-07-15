import { useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const DRAFT_KEY = 'tilershub_draft_token'

async function linkPending(user) {
  // Link anonymous draft project to signed-in account
  const token = localStorage.getItem(DRAFT_KEY)
  if (token) {
    await supabase
      .from('projects')
      .update({ user_id: user.id, session_token: null })
      .eq('session_token', token)
      .is('user_id', null)
    localStorage.removeItem(DRAFT_KEY)
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
