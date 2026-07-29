import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useLang } from '../lib/useLang.js'
import DistrictPicker from './DistrictPicker.jsx'
import AuthButton from './AuthButton.jsx'

/**
 * AppShell — the one app bar and the one bottom tab bar, for every screen.
 *
 * Chrome only. Page content stays in normal document flow underneath so the
 * footer, long-form marketing pages and scroll restoration keep working; an
 * inner scroll container would break all three on a site that is also a
 * search-traffic destination.
 *
 * The tab set follows the account's role, which the server resolves — a
 * provider never sees "Post a project" as their primary action, and a
 * homeowner never sees "Find work". Role is a fact about the account, not a
 * toggle, so there is no role switch taking up bar width.
 *
 * `path` and `role` both come from the server, so the first client render
 * matches the server HTML exactly.
 */

const T = {
  home:     { en: 'Home',      si: 'මුල්' },
  tilers:   { en: 'Tilers',    si: 'ටයිලර්' },
  post:     { en: 'Post',      si: 'දාන්න' },
  projects: { en: 'Projects',  si: 'ව්‍යාපෘති' },
  account:  { en: 'Account',   si: 'ගිණුම' },
  findwork: { en: 'Find work', si: 'රැකියා' },
  myquotes: { en: 'My quotes', si: 'මගේ ලංසු' },
  profile:  { en: 'Profile',   si: 'පැතිකඩ' },
  menu:     { en: 'Menu',      si: 'මෙනුව' },
}

const TABS = {
  client: [
    { key: 'home',     href: '/',             icon: '🏠', label: 'home' },
    { key: 'tilers',   href: '/providers',    icon: '👥', label: 'tilers' },
    { key: 'post',     href: '/post-project', label: 'post', raised: true },
    { key: 'projects', href: '/jobs',         icon: '📋', label: 'projects', badge: true },
    { key: 'account',  href: '/account',      icon: '👤', label: 'account' },
  ],
  provider: [
    { key: 'home',     href: '/',                    icon: '🏠', label: 'home' },
    { key: 'projects', href: '/jobs',                icon: '💼', label: 'findwork', badge: true },
    { key: 'quotes',   href: '/account?tab=quotes',  icon: '📋', label: 'myquotes' },
    { key: 'account',  href: '/account?tab=profile', icon: '👤', label: 'profile' },
  ],
}

// Which tab owns a given URL. Kept here so the bar is the only thing that
// knows about navigation structure.
function screenFor(path) {
  if (path === '/') return 'home'
  if (path.startsWith('/providers') || path.startsWith('/tilers')) return 'tilers'
  if (path === '/post-project') return 'post'
  if (path === '/jobs' || path.startsWith('/jobs/') || path === '/job') return 'projects'
  if (path === '/account' || path === '/provider' || path === '/dashboard') return 'account'
  return null
}

export default function AppShell({ role = 'client', path = '/', initialUser = null }) {
  const lang = useLang()
  const t = k => T[k]?.[lang] || T[k]?.en || k
  const tabs = TABS[role] || TABS.client
  const screen = screenFor(path)
  const [openCount, setOpenCount] = useState(null)

  // Active-project count, fetched after paint so no page blocks on it.
  useEffect(() => {
    let alive = true
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'active')
      .then(({ count }) => { if (alive && count > 0) setOpenCount(count) })
    return () => { alive = false }
  }, [])

  return (
    <>
      <header className="th-appbar">
        <a href="/" className="th-brand" aria-label="TilersHub home">
          <span className="site-logo-grid" aria-hidden="true">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => <span key={i} className="site-logo-tile" />)}
          </span>
          <span className="th-wordmark">TILERS<span>HUB</span></span>
        </a>

        <span className="th-appbar__spacer" />

        <DistrictPicker />
        <a href="/notifications" className="header-icon-btn header-bell" aria-label="Notifications">🔔</a>
        <AuthButton initialUser={initialUser} />
        <button
          className="header-icon-btn"
          onClick={() => window.dispatchEvent(new CustomEvent('th-drawer-open'))}
          aria-label={t('menu')}
        >☰</button>
      </header>

      <nav className="th-tabbar" aria-label="Main navigation">
        {tabs.map(tab => (
          <a
            key={tab.key}
            href={tab.href}
            className={tab.raised ? 'th-tabbar__raised' : undefined}
            aria-current={screen === tab.key ? 'page' : undefined}
            aria-label={tab.raised ? t(tab.label) : undefined}
          >
            {tab.raised ? '+' : (
              <>
                <span className="th-tabbar__icon" aria-hidden="true">
                  {tab.icon}
                  {tab.badge && openCount !== null && (
                    <span className="th-tabbar__badge">{openCount > 99 ? '99+' : openCount}</span>
                  )}
                </span>
                <span className="th-tabbar__label">{t(tab.label)}</span>
              </>
            )}
          </a>
        ))}
      </nav>
    </>
  )
}
