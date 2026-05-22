import { useStore } from '@nanostores/react'
import { $user, $profile, $authLoading, signOut } from '../lib/authStore'

export default function NavActions() {
  const user = useStore($user)
  const profile = useStore($profile)
  const loading = useStore($authLoading)
  const path = typeof window !== 'undefined' ? window.location.pathname : ''

  if (loading) return <div className="nav-actions" />

  return (
    <div className="nav-actions">
      <a href="/explore" className={`nav-btn${path === '/explore' ? ' active' : ''}`}>
        ටයිලර් සොයන්න
      </a>
      {user ? (
        <>
          <a href={profile?.role === 'tiler' ? '/dashboard' : '/explore'} className="nav-btn">
            {profile?.full_name?.split(' ')[0] || 'ගිණුම'}
          </a>
          <button
            className="nav-btn ghost"
            onClick={async () => { await signOut(); window.location.href = '/' }}
          >
            ඉවත් වන්න
          </button>
        </>
      ) : (
        <>
          <a href="/login" className="nav-btn ghost">පිවිසෙන්න</a>
          <a href="/register" className="nav-btn fill">ලියාපදිංචි වන්න</a>
        </>
      )}
    </div>
  )
}
