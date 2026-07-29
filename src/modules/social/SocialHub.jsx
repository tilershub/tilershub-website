import { useState } from 'react'
import ContentStudio   from './components/ContentStudio.jsx'
import ContentCalendar from './components/ContentCalendar.jsx'
import PostQueue       from './components/PostQueue.jsx'

const NAVY   = '#14171A'
const GOLD   = '#E8B341'
const ORANGE = '#D96234'

const SUBTABS = [
  { key: 'studio',   label: '✨ Studio',   desc: 'Generate AI posts' },
  { key: 'calendar', label: '📅 Calendar', desc: '7-day planning grid' },
  { key: 'queue',    label: '📤 Queue',    desc: 'Manage & push to sheet' },
]

export default function SocialHub() {
  const [subtab, setSubtab] = useState('studio')

  return (
    <div style={{ fontFamily: 'Montserrat, system-ui, sans-serif' }}>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#14171A', margin: 0 }}>📣 Social Hub</h2>
          <span style={{ fontSize: 11, fontWeight: 700, background: GOLD, color: '#14171A', padding: '3px 10px', borderRadius: 20 }}>NEW</span>
        </div>
        <p style={{ fontSize: 13, color: '#6B7076', margin: 0 }}>
          Generate, plan, and queue social content for two campaigns —
          <span style={{ color: '#C2542B', fontWeight: 600 }}> 🏠 attract homeowners</span> to post projects and
          <span style={{ color: ORANGE, fontWeight: 600 }}> 🔨 attract tilers</span> to join and bid.
          Make.com pushes <strong>READY</strong> posts to Facebook &amp; Instagram automatically.
        </p>
      </div>

      {/* Sub-tab nav */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '2px solid #EFEBE4', paddingBottom: 0 }}>
        {SUBTABS.map(t => (
          <button key={t.key} onClick={() => setSubtab(t.key)}
            style={{
              padding: '10px 20px', background: 'transparent', border: 'none',
              borderBottom: subtab === t.key ? `2.5px solid ${NAVY}` : '2.5px solid transparent',
              marginBottom: -2, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              color: subtab === t.key ? NAVY : '#8A8F95', transition: 'all 0.12s',
            }}>
            {t.label}
            <span style={{ fontSize: 10, fontWeight: 400, color: '#8A8F95', display: 'block', marginTop: 1 }}>{t.desc}</span>
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      <div>
        {subtab === 'studio'   && <ContentStudio />}
        {subtab === 'calendar' && <ContentCalendar />}
        {subtab === 'queue'    && <PostQueue />}
      </div>
    </div>
  )
}
