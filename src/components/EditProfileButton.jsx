import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

export default function EditProfileButton({ ownerId, profileType, profileSlug }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && ownerId && user.id === ownerId) setShow(true)
    })
  }, [])

  if (!show) return null

  return (
    <a
      href="/provider?tab=profile"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: '#1B3A6B', color: '#fff', borderRadius: 12,
        padding: '10px 18px', fontSize: 13, fontWeight: 700,
        textDecoration: 'none', marginTop: 12,
        boxShadow: '0 2px 10px rgba(27,58,107,0.25)',
      }}
    >
      ✏️ Edit My Profile
    </a>
  )
}
