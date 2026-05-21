import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export function Logo({ onClick }) {
  return (
    <Link to="/" className="nav-logo" onClick={onClick}>
      <div className="logo-grid">
        {[0,1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className={`logo-tile${i === 8 ? ' empty' : ''}`} />
        ))}
      </div>
      <span className="logo-wordmark">TILERS<span>HUB</span></span>
    </Link>
  )
}

export function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav>
      <Logo />
      <div className="nav-actions">
        <button
          className={`nav-btn${location.pathname === '/explore' ? ' active' : ''}`}
          onClick={() => navigate('/explore')}
        >
          ටයිලර් සොයන්න
        </button>
        {user ? (
          <>
            <button className="nav-btn" onClick={() => navigate(profile?.role === 'tiler' ? '/dashboard' : '/explore')}>
              {profile?.full_name?.split(' ')[0] || 'ගිණුම'}
            </button>
            <button className="nav-btn ghost" onClick={async () => { await signOut(); navigate('/') }}>
              ඉවත් වන්න
            </button>
          </>
        ) : (
          <>
            <button className="nav-btn ghost" onClick={() => navigate('/login')}>
              පිවිසෙන්න
            </button>
            <button className="nav-btn fill" onClick={() => navigate('/register')}>
              ලියාපදිංචි වන්න
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

export function Footer() {
  return (
    <footer>
      <strong>TILERSHUB</strong> · ශ්‍රී ලංකාවේ විශ්වාසනීය ටයිල් සේවා වේදිකාව
      <br />
      <span>© 2025 TilersHub · Powered by Supabase · Hosted on Cloudflare</span>
    </footer>
  )
}

export function StarRating({ rating, size = 14 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: size, color: i <= Math.round(rating) ? '#c9a84c' : '#d9c8a8' }}>★</span>
      ))}
    </span>
  )
}

export function Spinner() {
  return <span className="spinner" />
}

export function ServiceCheckGrid({ services, selected, onChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 10 }}>
      {services.map(s => {
        const checked = selected.includes(s)
        return (
          <label
            key={s}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: checked ? 'rgba(193,96,58,0.07)' : 'var(--cream)',
              border: `1.5px solid ${checked ? 'var(--terracotta)' : 'var(--cream-dark)'}`,
              borderRadius: 8, padding: '10px 14px', cursor: 'pointer',
              fontSize: 12, fontWeight: checked ? 600 : 400,
              color: checked ? 'var(--terracotta)' : 'var(--text-mid)',
              transition: 'all 0.15s'
            }}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => {
                onChange(checked ? selected.filter(x => x !== s) : [...selected, s])
              }}
              style={{ accentColor: 'var(--terracotta)', width: 14, height: 14 }}
            />
            {s}
          </label>
        )
      })}
    </div>
  )
}
