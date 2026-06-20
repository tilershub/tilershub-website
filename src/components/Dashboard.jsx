import { useState, useEffect } from 'react'
import { supabase, getUser, signOut, onAuthStateChange } from '../lib/supabase.js'
import ProfileEditor from './ProfileEditor.jsx'
import PortfolioEditor from './PortfolioEditor.jsx'

const TYPE_ICON = {
  'Floor Tiling':'🪨','Bathroom Tiling':'🚿','Bathroom Renovation':'🛁',
  'Granite Works':'💎','Tile Cutting':'✂️','Routering':'🔧',
  'Waterproofing':'💧','Tile Shop Inquiry':'🏪',
}

function timeAgo(d) {
  if (!d) return ''
  const m = Math.floor((Date.now() - new Date(d)) / 60000)
  if (m < 60)   return `${m}මිනි`
  if (m < 1440) return `${Math.floor(m/60)}පැය`
  if (m < 10080)return `${Math.floor(m/1440)}දින`
  return new Date(d).toLocaleDateString('si-LK', { day:'numeric', month:'short' })
}

// ─── ROOT COMPONENT ────────────────────────────────────────────────

const MOBILE_STYLES = `
  .db-tab-bar::-webkit-scrollbar { display: none; }
  .db-tab-bar { -ms-overflow-style: none; scrollbar-width: none; }
  @media (max-width: 480px) {
    .db-identity-actions { width: 100%; justify-content: flex-start !important; }
    .db-header-pad { padding: 16px 14px 0 !important; }
    .db-content-pad { padding: 16px 14px 64px !important; }
    .db-avatar { width: 44px !important; height: 44px !important; font-size: 15px !important; }
    .db-profile-name { font-size: 14px !important; }
  }
`

export default function Dashboard() {
  const [user, setUser]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [projects, setProjects]       = useState([])
  const [bids, setBids]               = useState({})
  const [submission, setSubmission]   = useState(null)
  const [claimedProfile, setClaimedProfile]       = useState(null)
  const [claimedProfileType, setClaimedProfileType] = useState(null)
  const [dataLoading, setDataLoading] = useState(false)

  useEffect(() => {
    getUser().then(u => { setUser(u); setLoading(false); if (u) loadData(u) })
    onAuthStateChange(u => { setUser(u); if (u) loadData(u); else setLoading(false) })
  }, [])

  async function loadData(u) {
    setDataLoading(true)
    const [{ data: proj }, { data: sub }, { data: tilerRow }, { data: providerRow }] = await Promise.all([
      supabase.from('projects').select('*').eq('user_id', u.id).order('created_at', { ascending: false }),
      supabase.from('provider_submissions').select('*').eq('user_id', u.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('tilers').select('*').eq('user_id', u.id).maybeSingle(),
      supabase.from('providers').select('*').eq('user_id', u.id).maybeSingle(),
    ])
    const userProjects = proj || []
    setProjects(userProjects)
    setSubmission(sub)
    if (tilerRow)        { setClaimedProfile(tilerRow);    setClaimedProfileType('tiler')    }
    else if (providerRow){ setClaimedProfile(providerRow); setClaimedProfileType('provider') }

    if (userProjects.length > 0) {
      const { data: bidData } = await supabase
        .from('bids').select('*').in('job_id', userProjects.map(p => p.id)).order('created_at', { ascending: false })
      const byJob = {}
      for (const b of bidData || []) { if (!byJob[b.job_id]) byJob[b.job_id] = []; byJob[b.job_id].push(b) }
      setBids(byJob)
    }
    setDataLoading(false)
  }

  if (loading) return <Spinner full />
  if (!user)   return <SignInPrompt />

  const isProvider = !!claimedProfile ||
    (submission && ['pending_review','approved','listed'].includes(submission?.status))

  const showClaimedBanner =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('claimed') &&
    !!claimedProfile

  return isProvider
    ? <ProviderDashboard user={user} claimedProfile={claimedProfile} claimedProfileType={claimedProfileType} submission={submission} showClaimedBanner={showClaimedBanner} />
    : <ConsumerDashboard user={user} projects={projects} bids={bids} submission={submission} dataLoading={dataLoading} showClaimedBanner={showClaimedBanner} />
}

// ═══════════════════════════════════════════════════════════════════
// PROVIDER DASHBOARD
// ═══════════════════════════════════════════════════════════════════

function ProviderDashboard({ user, claimedProfile, claimedProfileType, submission, showClaimedBanner }) {
  const initialTab = typeof window !== 'undefined'
    ? (new URLSearchParams(window.location.search).get('tab') || 'projects')
    : 'projects'
  const [tab, setTab]           = useState(initialTab)
  const [myProjects, setMyProjects] = useState([])
  const [myBids, setMyBids]     = useState({})
  const [dataLoading, setDataLoading] = useState(false)
  const [dataLoaded, setDataLoaded]   = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('tab')) {
      const t = params.get('tab')
      setTab(t)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  useEffect(() => {
    if ((tab === 'projects' || tab === 'bids') && !dataLoaded) loadMyData()
  }, [tab])

  async function loadMyData() {
    setDataLoading(true)
    const { data: proj } = await supabase
      .from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    const userProjects = proj || []
    setMyProjects(userProjects)
    if (userProjects.length > 0) {
      const { data: bidData } = await supabase
        .from('bids').select('*').in('job_id', userProjects.map(p => p.id)).order('created_at', { ascending: false })
      const byJob = {}
      for (const b of bidData || []) { if (!byJob[b.job_id]) byJob[b.job_id] = []; byJob[b.job_id].push(b) }
      setMyBids(byJob)
    }
    setDataLoaded(true)
    setDataLoading(false)
  }

  const profileName = claimedProfile?.full_name || claimedProfile?.name || user.email.split('@')[0]
  const initials    = profileName.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
  const profileHref = claimedProfile?.slug
    ? `/${claimedProfileType === 'tiler' ? 'tilers' : 'providers'}/${claimedProfile.slug}`
    : null

  const totalBids = Object.values(myBids).reduce((s, arr) => s + arr.length, 0)
  const newBids   = Object.values(myBids).flat().filter(b => b.status === 'new').length

  const TABS = [
    { key:'projects',  label:'📋 මගේ ව්‍යාපෘති'  },
    { key:'bids',      label:`💰 ලංසු${newBids > 0 ? ` (${newBids})` : ''}` },
    ...(claimedProfile ? [{ key:'portfolio', label:'📸 ගැලරිය'  }] : []),
    ...(claimedProfile ? [{ key:'profile',   label:'✏️ මගේ පැතිකඩ' }] : []),
    { key:'listing',   label:'📋 ලිස්ටිං'   },
  ]

  return (
    <div style={{ minHeight:'100dvh', background:'#f8fafc', paddingBottom:80 }}>
      <style>{MOBILE_STYLES}</style>

      {/* ── Provider header ── */}
      <div style={{ background:'linear-gradient(135deg,#0F1E35 0%,#1A2B4A 100%)', paddingBottom:0 }}>
        <div className="db-header-pad" style={{ maxWidth:860, margin:'0 auto', padding:'20px 16px 0' }}>

          {showClaimedBanner && (
            <div style={{ padding:'10px 14px', background:'rgba(22,163,74,0.15)', border:'1px solid rgba(22,163,74,0.3)', borderRadius:10, marginBottom:14 }}>
              <span style={{ fontSize:13, color:'#4ade80', fontWeight:600 }}>✓ පැතිකඩ ඉල්ලා සිටි! මගේ පැතිකඩ ටැබ් හි සංස්කරණය කරන්න.</span>
            </div>
          )}

          {/* Identity row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div className="db-avatar" style={{ width:52, height:52, borderRadius:14, background:'rgba(212,175,55,0.14)', border:'2px solid rgba(212,175,55,0.3)', color:'#D4AF37', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, flexShrink:0 }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.38)', letterSpacing:2, textTransform:'uppercase', marginBottom:2 }}>සේවා සපයන්නා</div>
                <div className="db-profile-name" style={{ fontSize:16, fontWeight:700, color:'#fff', lineHeight:1.2 }}>{profileName}</div>
                {claimedProfile && (
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.38)', marginTop:1 }}>
                    {claimedProfile.city || claimedProfile.district || ''}
                    {claimedProfile.verification_status === 'th_master' && <span style={{ marginLeft:6, color:'#D4AF37' }}>· 🛡️ TH Master</span>}
                    {claimedProfile.is_verified && claimedProfile.verification_status !== 'th_master' && <span style={{ marginLeft:6, color:'#4ade80' }}>· ✓ සත්‍යාපිත</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="db-identity-actions" style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {profileHref && (
                <a href={profileHref} style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.55)', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, padding:'6px 12px', textDecoration:'none', whiteSpace:'nowrap' }}>
                  🔗 ලිස්ටිං බලන්න
                </a>
              )}
              <button
                onClick={async () => { await signOut(); window.location.href = '/' }}
                style={{ fontSize:12, color:'rgba(255,255,255,0.45)', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontWeight:600, whiteSpace:'nowrap' }}
              >ගිණුමෙන් ඉවත් වන්න</button>
            </div>
          </div>

          {/* Tab bar — scrollable on mobile */}
          <div className="db-tab-bar" style={{ display:'flex', overflowX:'auto', WebkitOverflowScrolling:'touch', marginLeft:-14, marginRight:-14, paddingLeft:14 }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding:'10px 14px', fontSize:13, fontWeight:600, border:'none', cursor:'pointer',
                background:'transparent', flexShrink:0,
                color: tab === t.key ? '#fff' : 'rgba(255,255,255,0.4)',
                borderBottom: tab === t.key ? '2.5px solid #D4AF37' : '2.5px solid transparent',
                transition:'all 0.15s', whiteSpace:'nowrap',
              }}>{t.label}</button>
            ))}
            {/* Trailing spacer so last tab isn't flush against edge */}
            <div style={{ flexShrink:0, width:14 }} />
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="db-content-pad" style={{ maxWidth:860, margin:'0 auto', padding:'20px 16px' }}>
        {tab === 'projects'  && (dataLoading ? <Spinner /> : <ProjectsTab projects={myProjects} bids={myBids} isProvider />)}
        {tab === 'bids'      && (dataLoading ? <Spinner /> : <ProviderBidsTab projects={myProjects} bids={myBids} />)}
        {tab === 'portfolio' && claimedProfile && (
          <PortfolioEditor profile={claimedProfile} profileType={claimedProfileType} userId={user.id} />
        )}
        {tab === 'profile'   && claimedProfile && (
          <ProfileEditor profile={claimedProfile} profileType={claimedProfileType} userId={user.id} />
        )}
        {tab === 'listing'   && <ListingTab submission={submission} />}
      </div>
    </div>
  )
}

function ProviderBidsTab({ projects, bids }) {
  const allBids = projects.flatMap(p =>
    (bids[p.id] || []).map(b => ({ ...b, project: p }))
  ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  if (allBids.length === 0) return (
    <div style={{ textAlign:'center', padding:'48px 20px', background:'#fff', borderRadius:16, border:'1px solid var(--border)' }}>
      <div style={{ fontSize:40, marginBottom:12 }}>💰</div>
      <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:8 }}>ලංසු නොමැත</div>
      <p style={{ fontSize:13, color:'var(--text-3)', lineHeight:1.7 }}>
        {projects.length === 0
          ? 'පළමුව ව්‍යාපෘතියක් ලිය කරන්න — සේවා සපයන්නන් ලංසු දෙන විට ඔබට ඔවුන් හා සම්බන්ධ වීමට හැකිය.'
          : 'ඔබේ ව්‍යාපෘතිය සජීවී ය. සේවා සපයන්නන් ශීඝ්‍රයෙන් ලංසු දෙනු ඇත — යාවත්කාලීන සඳහා නැවත පරීක්ෂා කරන්න.'}
      </p>
      {projects.length === 0 && (
        <a href="/post-project" style={{ display:'inline-flex', alignItems:'center', gap:6, marginTop:12, padding:'11px 22px', background:'var(--terra)', color:'#fff', borderRadius:10, fontSize:13, fontWeight:700, textDecoration:'none' }}>
          📋 ව්‍යාපෘතිය ලිය කරන්න
        </a>
      )}
    </div>
  )

  const newCount = allBids.filter(b => b.status === 'new').length

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:8 }}>
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:'var(--text)', marginBottom:2 }}>ලංසු ඉතිහාසය සහ යාවත්කාලීන</div>
          <div style={{ fontSize:12, color:'var(--text-3)' }}>
            {allBids.length} ලංසු · {projects.length} ව්‍යාපෘති
            {newCount > 0 && <span style={{ marginLeft:6, fontWeight:700, color:'#f59e0b' }}>· {newCount} නව</span>}
          </div>
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {allBids.map(bid => {
          const wa   = bid.bidder_whatsapp?.replace(/\D/g,'')
          const norm = wa?.startsWith('94') ? wa : '94' + (wa?.replace(/^0/,'') || '')
          const waLink = `https://wa.me/${norm}?text=${encodeURIComponent('ආයුබෝවන්! 🙏\n\nTilersHub හරහා ඔබේ bid දැක්කා. ඔබගේ quote / message ගැන කතා කරමු.\n\nස්තූතියි!')}`
          const isNew = bid.status === 'new'
          return (
            <div key={bid.id} style={{ padding:'16px 18px', background:'#fff', borderRadius:14, border:`1.5px solid ${isNew ? '#fde68a' : 'var(--border)'}`, borderLeft:`4px solid ${isNew ? '#f59e0b' : '#e2e8f0'}`, boxShadow:'var(--shadow-sm)' }}>
              {/* project context */}
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>
                {TYPE_ICON[bid.project?.project_type] || '🏠'} {bid.project?.project_type} · 📍 {bid.project?.city || bid.project?.district}
              </div>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10, marginBottom:8 }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{bid.bidder_name}</div>
                  <div style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>
                    <span style={{ textTransform:'capitalize' }}>{bid.bidder_type}</span>
                    {bid.quote_amount && <span style={{ marginLeft:8, color:'#166534', fontWeight:700 }}>· Rs. {Number(bid.quote_amount).toLocaleString()}</span>}
                    {bid.timeline     && <span style={{ marginLeft:8 }}>· {bid.timeline}</span>}
                    <span style={{ marginLeft:8, color:'var(--text-4)' }}>· {timeAgo(bid.created_at)}</span>
                  </div>
                </div>
                {isNew && <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:'#fef3c7', color:'#92400e', whiteSpace:'nowrap', flexShrink:0 }}>නව</span>}
              </div>
              {bid.message && (
                <p style={{ fontSize:13, color:'#475569', lineHeight:1.65, margin:'0 0 12px' }}>
                  {bid.message.length > 220 ? bid.message.slice(0,220) + '…' : bid.message}
                </p>
              )}
              {wa && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700, background:'#25D366', color:'#fff', borderRadius:8, padding:'7px 14px', textDecoration:'none' }}>
                  💬 WhatsApp හරහා අමතන්න
                </a>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CONSUMER DASHBOARD
// ═══════════════════════════════════════════════════════════════════

function ConsumerDashboard({ user, projects, bids, submission, dataLoading, showClaimedBanner }) {
  const [tab, setTab] = useState('projects')
  const initials = (user.email || '?').split('@')[0].slice(0,2).toUpperCase()

  const TABS = [
    { key:'projects', label:'📋 මගේ ව්‍යාපෘති' },
    { key:'find',     label:'👷 ටයිලර් සොයන්න'  },
  ]

  return (
    <div style={{ minHeight:'100dvh', background:'#f8fafc', paddingBottom:80 }}>
      <style>{MOBILE_STYLES}</style>

      {/* ── Consumer header ── */}
      <div style={{ background:'#fff', borderBottom:'1px solid var(--border)' }}>
        <div className="db-header-pad" style={{ maxWidth:800, margin:'0 auto', padding:'20px 16px 0' }}>

          {showClaimedBanner && (
            <div style={{ padding:'10px 14px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, marginBottom:14 }}>
              <span style={{ fontSize:13, color:'#15803d', fontWeight:600 }}>✓ පැතිකඩ සාර්ථකව ඉල්ලා සිටියා!</span>
            </div>
          )}

          {/* Identity row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div className="db-avatar" style={{ width:52, height:52, borderRadius:14, background:'var(--terra-50)', border:'2px solid rgba(224,90,43,0.2)', color:'var(--terra)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, flexShrink:0 }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-4)', letterSpacing:2, textTransform:'uppercase', marginBottom:2 }}>මගේ දෑළෙ</div>
                <div className="db-profile-name" style={{ fontSize:16, fontWeight:700, color:'var(--text)', lineHeight:1.2 }}>නැවත සාදරයෙන් පිළිගනිමු</div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'180px' }}>{user.email}</div>
              </div>
            </div>

            <div className="db-identity-actions" style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
              <a href="/post-project" style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:700, color:'#fff', background:'var(--terra)', borderRadius:9, padding:'7px 14px', textDecoration:'none', whiteSpace:'nowrap' }}>
                📋 ව්‍යාපෘතිය ලිය කරන්න
              </a>
              <button
                onClick={async () => { await signOut(); window.location.href = '/' }}
                style={{ fontSize:12, color:'var(--text-3)', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontWeight:600, whiteSpace:'nowrap' }}
              >ගිණුමෙන් ඉවත් වන්න</button>
            </div>
          </div>

          {/* Tab bar — scrollable on mobile */}
          <div className="db-tab-bar" style={{ display:'flex', overflowX:'auto', WebkitOverflowScrolling:'touch', marginLeft:-14, marginRight:-14, paddingLeft:14 }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding:'10px 16px', fontSize:13, fontWeight:600, border:'none', cursor:'pointer',
                background:'transparent', flexShrink:0,
                color: tab === t.key ? 'var(--navy)' : 'var(--text-3)',
                borderBottom: tab === t.key ? '2.5px solid var(--terra)' : '2.5px solid transparent',
                transition:'all 0.15s', whiteSpace:'nowrap',
              }}>{t.label}</button>
            ))}
            <div style={{ flexShrink:0, width:14 }} />
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="db-content-pad" style={{ maxWidth:800, margin:'0 auto', padding:'20px 16px' }}>
        {dataLoading ? <Spinner /> : tab === 'projects' ? (
          <ProjectsTab projects={projects} bids={bids} />
        ) : (
          <FindTilersTab />
        )}

        {/* Become a provider CTA */}
        <div style={{ marginTop:28, padding:'20px 22px', background:'var(--navy-50)', border:'1px solid var(--navy-100)', borderRadius:14 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'var(--navy)', marginBottom:4 }}>ඔබ ටයිලර් කෙනෙකු හෝ කොන්ත්‍රාත්කරුවෙකු ද?</div>
          <p style={{ fontSize:12, color:'var(--text-3)', marginBottom:12, lineHeight:1.65 }}>
            TilersHub හි ලිස්ට් වන්න — නිවාස හිමිකරුවන් WhatsApp හරහා ඔබ සොයා කෙළින්ම අමතති.
          </p>
          <a href="/join-tilershub" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 18px', background:'var(--navy)', color:'#fff', borderRadius:9, fontSize:12, fontWeight:700, textDecoration:'none' }}>
            ✅ සේවා සපයන්නෙකු ලෙස ඉල්ලුම් කරන්න
          </a>
        </div>
      </div>
    </div>
  )
}

function FindTilersTab() {
  const QUICK = [
    { label:'සියලු ටයිලර්',          href:'/providers?type=tiler',            icon:'👷', desc:'සත්‍යාපිත ටයිලර් සොයන්න'            },
    { label:'නාන කාමර ප්‍රතිසංස්.',  href:'/providers?q=Bathroom+Renovation', icon:'🚿', desc:'නාන කාමර ප්‍රතිසංස්කරණ විශේෂඥයන්'   },
    { label:'බිම් ටයිල්',         href:'/providers?q=Floor+Tiling',        icon:'🪨', desc:'බිම් සහ බිත්ති ටයිල් විශේෂඥයන්'          },
    { label:'ජලනිරෝධය',        href:'/providers?q=Waterproofing',       icon:'💧', desc:'සහතිකලත් ජලනිරෝධ කොන්ත්‍රාත්'    },
    { label:'ටයිල් කැපීම',         href:'/providers?q=Tile+Cutting',        icon:'✂️', desc:'ව්‍යාවසායික ටයිල් කැපීම'    },
    { label:'වැඩමුළු',            href:'/providers?type=workshop',         icon:'🏭', desc:'ටයිල් කැපීම සහ නිෂ්පාදන' },
    { label:'ටයිල් සාප්පු',           href:'/providers?type=tile_shop',        icon:'🏪', desc:'සාප්පු සෙ ටයිල් මිලදී ගන්න'          },
    { label:'සැපයුම්කරුවන්',            href:'/providers?type=supplier',         icon:'📦', desc:'ගොඩනැගිලි ද්‍රව්‍ය සැපයුම්කරුවන්'            },
  ]

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:16, fontWeight:700, color:'var(--text)', marginBottom:4 }}>ටයිලිං වෘත්තිකයන් සොයන්න</div>
        <div style={{ fontSize:13, color:'var(--text-3)' }}>ශ්‍රී ලංකාවේ සත්‍යාපිත සේවා සපයන්නන් බලන්න</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10 }}>
        {QUICK.map(q => (
          <a key={q.href} href={q.href} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', background:'#fff', border:'1.5px solid var(--border)', borderRadius:12, textDecoration:'none', color:'var(--text)', transition:'border-color 0.15s, box-shadow 0.15s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor='var(--navy)'; e.currentTarget.style.boxShadow='var(--shadow-sm)' }}
            onMouseOut={e  => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none' }}
          >
            <div style={{ width:36, height:36, borderRadius:10, background:'var(--navy-50)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>{q.icon}</div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--text)', lineHeight:1.3 }}>{q.label}</div>
              <div style={{ fontSize:10, color:'var(--text-3)', marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{q.desc}</div>
            </div>
          </a>
        ))}
      </div>

      <div style={{ marginTop:14, textAlign:'center' }}>
        <a href="/providers" style={{ fontSize:13, color:'var(--navy)', fontWeight:700, textDecoration:'none' }}>සියලු සේවා සපයන්නන් →</a>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SHARED SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════

function Spinner({ full }) {
  return (
    <div style={{ ...(full ? { minHeight:'60vh' } : { padding:40 }), display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div className="spinner" style={{ margin:'0 auto 10px', borderColor:'rgba(26,43,74,0.15)', borderTopColor:'var(--navy)' }} />
        <p style={{ fontSize:13, color:'var(--text-3)' }}>පූරණය වෙමින්…</p>
      </div>
    </div>
  )
}

function SignInPrompt() {
  return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ textAlign:'center', maxWidth:380 }}>
        <div style={{ fontSize:56, marginBottom:14 }}>🔒</div>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:'var(--text)', marginBottom:10 }}>ඔබේ ගිණුමට ලොගිනය</h2>
        <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.7, marginBottom:24 }}>
          සේවා සපයන්නන්: ව්‍යාපෘති සොයා ගෙන පැතිකඩ කළමනාකරණය කරන්න.<br/>නිවාස හිමිකරුවන්: ව්‍යාපෘති සහ ලංසු නිරීක්ෂණය කරන්න.
        </p>
        <a href="/login" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'12px 28px', background:'var(--navy)', color:'#fff', borderRadius:12, fontSize:14, fontWeight:700, textDecoration:'none' }}>
          ලොගිනය →
        </a>
      </div>
    </div>
  )
}

function BidsPanel({ projectBids }) {
  const [open, setOpen] = useState(false)

  if (!projectBids?.length) return (
    <div style={{ marginTop:12, padding:'12px 14px', background:'#f8fafc', borderRadius:10, fontSize:12, color:'#94a3b8' }}>
      💬 ලංසු නොමැත — ඔබේ ව්‍යාපෘතිය සජීවීය, සියලු සේවා සපයන්නන්ට දිස් වේ.
    </div>
  )

  const newCount = projectBids.filter(b => b.status === 'new').length

  return (
    <div style={{ marginTop:12 }}>
      <button onClick={() => setOpen(o => !o)} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', padding:0, fontSize:13, fontWeight:700, color:'#1B3A6B' }}>
        <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', background: newCount > 0 ? '#f59e0b' : '#e2e8f0', color: newCount > 0 ? '#fff' : '#64748b', borderRadius:20, padding:'2px 8px', fontSize:11, fontWeight:700 }}>
          {projectBids.length}
        </span>
        {projectBids.length} ලංසු ලැබිලා
        {newCount > 0 && <span style={{ fontSize:11, color:'#f59e0b', fontWeight:700 }}>· {newCount} නව</span>}
        <span style={{ fontSize:14, color:'#94a3b8' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:10 }}>
          {projectBids.map(bid => {
            const wa = bid.bidder_whatsapp?.replace(/\D/g,'')
            const norm = wa?.startsWith('94') ? wa : '94' + (wa?.replace(/^0/,'') || '')
            const waLink = `https://wa.me/${norm}?text=${encodeURIComponent('ආයුබෝවන්! 🙏\n\nTilersHub හරහා ඔබේ bid දැක්කා. ඔබගේ quote / message ගැන කතා කරමු.\n\nස්තූතියි!')}`
            return (
              <div key={bid.id} style={{ padding:'14px 16px', background:'#fff', borderRadius:12, border:`1.5px solid ${bid.status==='new'?'#fde68a':'#e2e8f0'}`, borderLeft:`4px solid ${bid.status==='new'?'#f59e0b':'#e2e8f0'}` }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10, marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{bid.bidder_name}</div>
                    <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>
                      <span style={{ textTransform:'capitalize' }}>{bid.bidder_type}</span>
                      {bid.quote_amount && <span style={{ marginLeft:8, color:'#166534', fontWeight:600 }}>· Rs. {bid.quote_amount.toLocaleString()}</span>}
                      {bid.timeline     && <span style={{ marginLeft:8 }}>· {bid.timeline}</span>}
                    </div>
                  </div>
                  {bid.status === 'new' && <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:'#fef3c7', color:'#92400e', whiteSpace:'nowrap' }}>New</span>}
                </div>
                <p style={{ fontSize:12, color:'#475569', lineHeight:1.6, margin:'0 0 10px' }}>
                  {bid.message.length > 200 ? bid.message.slice(0,200)+'…' : bid.message}
                </p>
                <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700, background:'#25D366', color:'#fff', borderRadius:8, padding:'7px 14px', textDecoration:'none' }}>
                  💬 WhatsApp හරහා අමතන්න
                </a>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ProjectsTab({ projects, bids, isProvider }) {
  const STATUS_COLOR = {
    pending_review: { bg:'#FEF3C7', color:'#92400E', label:'සමාලෝචනය යටතේ' },
    active:         { bg:'#F0FDF4', color:'#166534', label:'ක්‍රියාකාරී'        },
    matched:        { bg:'#EFF6FF', color:'#1E40AF', label:'ගලපා ගෙන'       },
    completed:      { bg:'#F3F4F6', color:'#374151', label:'සම්පූර්ණ'     },
  }

  if (projects.length === 0) return (
    <div style={{ textAlign:'center', padding:'48px 20px', background:'#fff', borderRadius:16, border:'1px solid var(--border)' }}>
      <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
      <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:8 }}>ව්‍යාපෘති නොමැත</div>
      <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:20, lineHeight:1.7 }}>
        {isProvider
          ? "ඔබ ව්‍යාපෘති ලිය කර නැත. ඔබට ටයිලිං ව්‍යාපෘතියක් ලිය කර ලංසු ලබා ගත හැකිය."
          : 'ටයිලිං ව්‍යාපෘතියක් ලිය කරන්න — සේවා සපයන්නන් ලංසු දෙති. ඔබ කා හා සම්බන්ධ වන්නද යන්න ඔබ තෝරා ගනී.'}
      </p>
      <a href="/post-project" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'11px 22px', background:'var(--terra)', color:'#fff', borderRadius:10, fontSize:13, fontWeight:700, textDecoration:'none' }}>
        📋 ව්‍යාපෘතිය ලිය කරන්න
      </a>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {projects.map(p => {
        const s = STATUS_COLOR[p.status] || STATUS_COLOR.pending_review
        return (
          <div key={p.id} style={{ padding:20, background:'#fff', border:'1px solid var(--border)', borderRadius:16, boxShadow:'var(--shadow-sm)' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:10 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:3 }}>{p.project_type}</div>
                <div style={{ fontSize:12, color:'var(--text-3)' }}>📍 {p.city}{p.district?`, ${p.district}`:''}</div>
              </div>
              <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:s.bg, color:s.color, whiteSpace:'nowrap', flexShrink:0 }}>{s.label}</span>
            </div>
            <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.6, margin:0 }}>{p.description}</p>
            {p.budget_range && <div style={{ fontSize:11, color:'var(--text-4)', marginTop:8 }}>💰 අයවැය: {p.budget_range}</div>}
            {p.created_at   && <div style={{ fontSize:11, color:'var(--text-4)', marginTop:4 }}>Posted {new Date(p.created_at).toLocaleDateString('en-LK',{day:'numeric',month:'short',year:'numeric'})}</div>}
            <BidsPanel projectBids={bids[p.id] || []} />
          </div>
        )
      })}
      <div style={{ textAlign:'center', paddingTop:8 }}>
        <a href="/post-project" style={{ fontSize:13, color:'var(--navy)', fontWeight:600, textDecoration:'none' }}>+ තවත් ව්‍යාපෘතියක් ලිය කරන්න</a>
      </div>
    </div>
  )
}

function ListingTab({ submission }) {
  const STATUS = {
    pending_review: { bg:'#FEF3C7', color:'#92400E', label:'සමාලෝචනය යටතේ', desc:'ඔබේ ඉල්ලුම සමාලෝචනය කෙරෙමින් ඇත. ව්‍යාපාරික දින 1-2 ඇතුළත WhatsApp හරහා සම්බන්ධ වෙමු.' },
    approved:       { bg:'#F0FDF4', color:'#166534', label:'අනුමත',      desc:'ඔබේ ඉල්ලුම අනුමත කෙරිණ. ලිස්ටිං සකස් කෙරෙමින් ඇත.'                                   },
    listed:         { bg:'#EFF6FF', color:'#1E40AF', label:'ලිස්ට් කෙරිණ',         desc:'ඔබ TilersHub හි සජීවී ය! ගනුදෙනුකරුවන්ට ඔබව සොයා සම්බන්ධ වීමට හැකිය.'                                },
    rejected:       { bg:'#FEF2F2', color:'#991B1B', label:'අනුමත නොකෙරිණ',  desc:'ඔබේ ඉල්ලුම අනුමත නොකෙරිණ. විස්තර සඳහා අප අමතන්න.'                                    },
  }

  if (!submission) return (
    <div style={{ textAlign:'center', padding:'48px 20px', background:'#fff', borderRadius:16, border:'1px solid var(--border)' }}>
      <div style={{ fontSize:40, marginBottom:12 }}>👷</div>
      <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:8 }}>ලිස්ට් කෙරී නැත</div>
      <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:20, lineHeight:1.7 }}>
        TilersHub හි නොමිලේ ලිස්ට් වී විමසීම් ලැබෙන්නට ඉල්ලුම් කරන්න.
      </p>
      <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
        <a href="/join-tilershub" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'11px 22px', background:'var(--navy)', color:'#fff', borderRadius:10, fontSize:13, fontWeight:700, textDecoration:'none' }}>✅ සේවා සපයන්නෙකු ලෙස ඉල්ලුම් කරන්න</a>
        <a href="/providers"      style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'11px 22px', background:'var(--surface-3)', color:'var(--text-2)', border:'1px solid var(--border)', borderRadius:10, fontSize:13, fontWeight:600, textDecoration:'none' }}>නාමාවලිය</a>
      </div>
    </div>
  )

  const s = STATUS[submission.status] || STATUS.pending_review

  return (
    <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:16, padding:24, boxShadow:'var(--shadow-sm)' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:16 }}>
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:'var(--text)', marginBottom:4 }}>{submission.name}</div>
          <div style={{ fontSize:12, color:'var(--text-3)' }}>📍 {submission.city}{submission.district?`, ${submission.district}`:''}</div>
        </div>
        <span style={{ fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:20, background:s.bg, color:s.color, whiteSpace:'nowrap' }}>{s.label}</span>
      </div>
      <div style={{ padding:'12px 16px', background:s.bg, borderRadius:10, marginBottom:16 }}>
        <p style={{ fontSize:13, color:s.color, margin:0, lineHeight:1.6 }}>{s.desc}</p>
      </div>
      {(submission.services||[]).length > 0 && (
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>සේවාවන්</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {submission.services.map(sv => <span key={sv} className="chip chip-navy" style={{ fontSize:11 }}>{sv}</span>)}
          </div>
        </div>
      )}
      <div style={{ marginTop:18, paddingTop:16, borderTop:'1px solid var(--border)' }}>
        <a href={`https://wa.me/94774503744?text=Hi TilersHub, I applied as a provider (${submission.name}) and want to check my listing status.`} target="_blank" rel="noopener" style={{ fontSize:12, fontWeight:600, color:'#16a34a', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:5 }}>
          💬 TilersHub WhatsApp හරහා අමතන්න
        </a>
      </div>
    </div>
  )
}
