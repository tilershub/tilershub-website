import { useState, useEffect } from 'react'
import { supabase, getUser, signOut, onAuthStateChange } from '../lib/supabase.js'
import ProfileEditor from './ProfileEditor.jsx'

const TYPE_ICON = {
  'Floor Tiling':'🪨','Bathroom Tiling':'🚿','Bathroom Renovation':'🛁',
  'Granite Works':'💎','Tile Cutting':'✂️','Routering':'🔧',
  'Waterproofing':'💧','Tile Shop Inquiry':'🏪',
}

function timeAgo(d) {
  if (!d) return ''
  const m = Math.floor((Date.now() - new Date(d)) / 60000)
  if (m < 60)   return `${m}m ago`
  if (m < 1440) return `${Math.floor(m/60)}h ago`
  if (m < 10080)return `${Math.floor(m/1440)}d ago`
  return new Date(d).toLocaleDateString('en-LK', { day:'numeric', month:'short' })
}

// ─── ROOT COMPONENT ────────────────────────────────────────────────

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
  const [tab, setTab]         = useState('jobs')
  const [openJobs, setOpenJobs] = useState([])
  const [jobsLoading, setJobsLoading] = useState(false)

  useEffect(() => { if (tab === 'jobs') loadOpenJobs() }, [tab])

  async function loadOpenJobs() {
    setJobsLoading(true)
    const { data } = await supabase
      .from('projects').select('*').eq('status', 'active')
      .order('created_at', { ascending: false }).limit(30)
    setOpenJobs(data || [])
    setJobsLoading(false)
  }

  const profileName = claimedProfile?.full_name || claimedProfile?.name || user.email.split('@')[0]
  const initials    = profileName.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
  const profileHref = claimedProfile?.slug
    ? `/${claimedProfileType === 'tiler' ? 'tilers' : 'providers'}/${claimedProfile.slug}`
    : null

  const TABS = [
    { key:'jobs',    label:'💼 Browse Jobs'  },
    ...(claimedProfile ? [{ key:'profile', label:'✏️ My Profile' }] : []),
    { key:'listing', label:'📋 My Listing'   },
  ]

  return (
    <div style={{ minHeight:'100dvh', background:'#f8fafc', paddingBottom:80 }}>

      {/* ── Provider header ── */}
      <div style={{ background:'linear-gradient(135deg,#0F1E35 0%,#1A2B4A 100%)', paddingBottom:0 }}>
        <div style={{ maxWidth:860, margin:'0 auto', padding:'20px 16px 0' }}>

          {showClaimedBanner && (
            <div style={{ padding:'10px 14px', background:'rgba(22,163,74,0.15)', border:'1px solid rgba(22,163,74,0.3)', borderRadius:10, marginBottom:14 }}>
              <span style={{ fontSize:13, color:'#4ade80', fontWeight:600 }}>✓ Profile claimed! Edit it in the My Profile tab.</span>
            </div>
          )}

          {/* Identity row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:52, height:52, borderRadius:14, background:'rgba(212,175,55,0.14)', border:'2px solid rgba(212,175,55,0.3)', color:'#D4AF37', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, flexShrink:0 }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.38)', letterSpacing:2, textTransform:'uppercase', marginBottom:2 }}>Provider Dashboard</div>
                <div style={{ fontSize:16, fontWeight:700, color:'#fff' }}>{profileName}</div>
                {claimedProfile && (
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.38)', marginTop:1 }}>
                    {claimedProfile.city || claimedProfile.district || ''}
                    {claimedProfile.verification_status === 'th_master' && <span style={{ marginLeft:6, color:'#D4AF37' }}>· 🛡️ TH Master</span>}
                    {claimedProfile.is_verified && claimedProfile.verification_status !== 'th_master' && <span style={{ marginLeft:6, color:'#4ade80' }}>· ✓ Verified</span>}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {profileHref && (
                <a href={profileHref} style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.55)', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, padding:'7px 13px', textDecoration:'none' }}>
                  🔗 View Listing
                </a>
              )}
              <button
                onClick={async () => { await signOut(); window.location.href = '/' }}
                style={{ fontSize:12, color:'rgba(255,255,255,0.45)', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, padding:'7px 14px', cursor:'pointer', fontWeight:600 }}
              >Sign Out</button>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display:'flex' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding:'10px 18px', fontSize:13, fontWeight:600, border:'none', cursor:'pointer',
                background:'transparent',
                color: tab === t.key ? '#fff' : 'rgba(255,255,255,0.4)',
                borderBottom: tab === t.key ? '2.5px solid #D4AF37' : '2.5px solid transparent',
                transition:'all 0.15s', whiteSpace:'nowrap',
              }}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div style={{ maxWidth:860, margin:'0 auto', padding:'24px 16px' }}>
        {tab === 'jobs'    && <BrowseJobsTab openJobs={openJobs} loading={jobsLoading} />}
        {tab === 'profile' && claimedProfile && (
          <ProfileEditor profile={claimedProfile} profileType={claimedProfileType} userId={user.id} />
        )}
        {tab === 'listing' && <ListingTab submission={submission} />}
      </div>
    </div>
  )
}

function BrowseJobsTab({ openJobs, loading }) {
  if (loading) return <Spinner />

  if (openJobs.length === 0) return (
    <div style={{ textAlign:'center', padding:'48px 20px', background:'#fff', borderRadius:16, border:'1px solid var(--border)' }}>
      <div style={{ fontSize:40, marginBottom:12 }}>💼</div>
      <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:8 }}>No open projects right now</div>
      <p style={{ fontSize:13, color:'var(--text-3)', lineHeight:1.7 }}>New projects are posted daily — check back soon.</p>
    </div>
  )

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:8 }}>
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:'var(--text)', marginBottom:2 }}>Open Projects</div>
          <div style={{ fontSize:12, color:'var(--text-3)' }}>{openJobs.length} active · tap a project to view details and submit your bid</div>
        </div>
        <a href="/jobs" style={{ fontSize:12, fontWeight:600, color:'var(--navy)', textDecoration:'none' }}>Browse all →</a>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {openJobs.map(job => (
          <a key={job.id} href={`/job?id=${job.id}`} style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px', background:'#fff', border:'1px solid var(--border)', borderRadius:14, textDecoration:'none', color:'inherit', boxShadow:'var(--shadow-sm)', transition:'box-shadow 0.15s, border-color 0.15s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor='var(--navy)'; e.currentTarget.style.boxShadow='var(--shadow)' }}
            onMouseOut={e  => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='var(--shadow-sm)' }}
          >
            <div style={{ width:44, height:44, borderRadius:12, background:'var(--navy-50)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
              {TYPE_ICON[job.project_type] || '🏠'}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:2 }}>{job.project_type}</div>
              <div style={{ fontSize:12, color:'var(--text-3)' }}>
                📍 {job.city || job.district}
                {job.budget_range && <span style={{ marginLeft:8, color:'var(--green)', fontWeight:600 }}>· {job.budget_range}</span>}
                <span style={{ marginLeft:8, color:'var(--text-4)' }}>· {timeAgo(job.created_at)}</span>
              </div>
              {job.description && (
                <div style={{ fontSize:12, color:'var(--text-4)', marginTop:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {job.description}
                </div>
              )}
            </div>
            <div style={{ flexShrink:0, padding:'8px 16px', background:'var(--navy)', color:'#fff', borderRadius:9, fontSize:12, fontWeight:700, whiteSpace:'nowrap' }}>
              Bid →
            </div>
          </a>
        ))}
      </div>

      <div style={{ textAlign:'center', marginTop:16 }}>
        <a href="/jobs" style={{ fontSize:13, color:'var(--navy)', fontWeight:700, textDecoration:'none' }}>Browse all open projects →</a>
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
    { key:'projects', label:'📋 My Projects' },
    { key:'find',     label:'👷 Find Tilers'  },
  ]

  return (
    <div style={{ minHeight:'100dvh', background:'#f8fafc', paddingBottom:80 }}>

      {/* ── Consumer header ── */}
      <div style={{ background:'#fff', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:800, margin:'0 auto', padding:'20px 16px 0' }}>

          {showClaimedBanner && (
            <div style={{ padding:'10px 14px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, marginBottom:14 }}>
              <span style={{ fontSize:13, color:'#15803d', fontWeight:600 }}>✓ Profile claimed successfully!</span>
            </div>
          )}

          {/* Identity row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:52, height:52, borderRadius:14, background:'var(--terra-50)', border:'2px solid rgba(224,90,43,0.2)', color:'var(--terra)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, flexShrink:0 }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-4)', letterSpacing:2, textTransform:'uppercase', marginBottom:2 }}>My Dashboard</div>
                <div style={{ fontSize:16, fontWeight:700, color:'var(--text)' }}>Welcome back</div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginTop:1 }}>{user.email}</div>
              </div>
            </div>

            <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
              <a href="/post-project" style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:13, fontWeight:700, color:'#fff', background:'var(--terra)', borderRadius:9, padding:'8px 16px', textDecoration:'none' }}>
                📋 Post Project
              </a>
              <button
                onClick={async () => { await signOut(); window.location.href = '/' }}
                style={{ fontSize:12, color:'var(--text-3)', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:8, padding:'7px 14px', cursor:'pointer', fontWeight:600 }}
              >Sign Out</button>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display:'flex' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding:'10px 18px', fontSize:13, fontWeight:600, border:'none', cursor:'pointer',
                background:'transparent',
                color: tab === t.key ? 'var(--navy)' : 'var(--text-3)',
                borderBottom: tab === t.key ? '2.5px solid var(--terra)' : '2.5px solid transparent',
                transition:'all 0.15s', whiteSpace:'nowrap',
              }}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div style={{ maxWidth:800, margin:'0 auto', padding:'24px 16px' }}>
        {dataLoading ? <Spinner /> : tab === 'projects' ? (
          <ProjectsTab projects={projects} bids={bids} />
        ) : (
          <FindTilersTab />
        )}

        {/* Become a provider CTA */}
        <div style={{ marginTop:28, padding:'20px 22px', background:'var(--navy-50)', border:'1px solid var(--navy-100)', borderRadius:14 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'var(--navy)', marginBottom:4 }}>Are you a tiler or contractor?</div>
          <p style={{ fontSize:12, color:'var(--text-3)', marginBottom:12, lineHeight:1.65 }}>
            Get listed on TilersHub — homeowners find and contact you directly via WhatsApp.
          </p>
          <a href="/join-tilershub" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 18px', background:'var(--navy)', color:'#fff', borderRadius:9, fontSize:12, fontWeight:700, textDecoration:'none' }}>
            ✅ Apply as Provider
          </a>
        </div>
      </div>
    </div>
  )
}

function FindTilersTab() {
  const QUICK = [
    { label:'All Tilers',          href:'/providers?type=tiler',            icon:'👷', desc:'Browse all verified tilers'            },
    { label:'Bathroom Renovation',  href:'/providers?q=Bathroom+Renovation', icon:'🚿', desc:'Full bathroom renovation specialists'   },
    { label:'Floor Tiling',         href:'/providers?q=Floor+Tiling',        icon:'🪨', desc:'Floor and wall tiling experts'          },
    { label:'Waterproofing',        href:'/providers?q=Waterproofing',       icon:'💧', desc:'Certified waterproofing contractors'    },
    { label:'Tile Cutting',         href:'/providers?q=Tile+Cutting',        icon:'✂️', desc:'Professional tile cutting workshops'    },
    { label:'Workshops',            href:'/providers?type=workshop',         icon:'🏭', desc:'Tile cutting and fabrication workshops' },
    { label:'Tile Shops',           href:'/providers?type=tile_shop',        icon:'🏪', desc:'Buy tiles directly from shops'          },
    { label:'Suppliers',            href:'/providers?type=supplier',         icon:'📦', desc:'Building material suppliers'            },
  ]

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:16, fontWeight:700, color:'var(--text)', marginBottom:4 }}>Find Tiling Professionals</div>
        <div style={{ fontSize:13, color:'var(--text-3)' }}>Browse verified providers across Sri Lanka</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
        {QUICK.map(q => (
          <a key={q.href} href={q.href} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'#fff', border:'1.5px solid var(--border)', borderRadius:12, textDecoration:'none', color:'var(--text)', transition:'border-color 0.15s, box-shadow 0.15s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor='var(--navy)'; e.currentTarget.style.boxShadow='var(--shadow-sm)' }}
            onMouseOut={e  => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none' }}
          >
            <div style={{ width:40, height:40, borderRadius:10, background:'var(--navy-50)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, flexShrink:0 }}>{q.icon}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{q.label}</div>
              <div style={{ fontSize:11, color:'var(--text-3)', marginTop:1 }}>{q.desc}</div>
            </div>
          </a>
        ))}
      </div>

      <div style={{ marginTop:14, textAlign:'center' }}>
        <a href="/providers" style={{ fontSize:13, color:'var(--navy)', fontWeight:700, textDecoration:'none' }}>Browse all providers →</a>
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
        <p style={{ fontSize:13, color:'var(--text-3)' }}>Loading…</p>
      </div>
    </div>
  )
}

function SignInPrompt() {
  return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ textAlign:'center', maxWidth:380 }}>
        <div style={{ fontSize:56, marginBottom:14 }}>🔒</div>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:'var(--text)', marginBottom:10 }}>Sign in to your dashboard</h2>
        <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.7, marginBottom:24 }}>
          Providers: browse jobs and manage your profile.<br/>Homeowners: track projects and bids.
        </p>
        <a href="/login" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'12px 28px', background:'var(--navy)', color:'#fff', borderRadius:12, fontSize:14, fontWeight:700, textDecoration:'none' }}>
          Sign In →
        </a>
      </div>
    </div>
  )
}

function BidsPanel({ projectBids }) {
  const [open, setOpen] = useState(false)

  if (!projectBids?.length) return (
    <div style={{ marginTop:12, padding:'12px 14px', background:'#f8fafc', borderRadius:10, fontSize:12, color:'#94a3b8' }}>
      💬 No bids yet — your project is live and visible to all providers.
    </div>
  )

  const newCount = projectBids.filter(b => b.status === 'new').length

  return (
    <div style={{ marginTop:12 }}>
      <button onClick={() => setOpen(o => !o)} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', padding:0, fontSize:13, fontWeight:700, color:'#1B3A6B' }}>
        <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', background: newCount > 0 ? '#f59e0b' : '#e2e8f0', color: newCount > 0 ? '#fff' : '#64748b', borderRadius:20, padding:'2px 8px', fontSize:11, fontWeight:700 }}>
          {projectBids.length}
        </span>
        {projectBids.length} Bid{projectBids.length !== 1 ? 's' : ''} Received
        {newCount > 0 && <span style={{ fontSize:11, color:'#f59e0b', fontWeight:700 }}>· {newCount} new</span>}
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
                  💬 Contact on WhatsApp
                </a>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ProjectsTab({ projects, bids }) {
  const STATUS_COLOR = {
    pending_review: { bg:'#FEF3C7', color:'#92400E', label:'Under Review' },
    active:         { bg:'#F0FDF4', color:'#166534', label:'Active'        },
    matched:        { bg:'#EFF6FF', color:'#1E40AF', label:'Matched'       },
    completed:      { bg:'#F3F4F6', color:'#374151', label:'Completed'     },
  }

  if (projects.length === 0) return (
    <div style={{ textAlign:'center', padding:'48px 20px', background:'#fff', borderRadius:16, border:'1px solid var(--border)' }}>
      <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
      <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:8 }}>No projects yet</div>
      <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:20, lineHeight:1.7 }}>
        Post a tiling project and providers will bid. You choose who to contact.
      </p>
      <a href="/post-project" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'11px 22px', background:'var(--terra)', color:'#fff', borderRadius:10, fontSize:13, fontWeight:700, textDecoration:'none' }}>
        📋 Post a Project
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
            {p.budget_range && <div style={{ fontSize:11, color:'var(--text-4)', marginTop:8 }}>💰 Budget: {p.budget_range}</div>}
            {p.created_at   && <div style={{ fontSize:11, color:'var(--text-4)', marginTop:4 }}>Posted {new Date(p.created_at).toLocaleDateString('en-LK',{day:'numeric',month:'short',year:'numeric'})}</div>}
            <BidsPanel projectBids={bids[p.id] || []} />
          </div>
        )
      })}
      <div style={{ textAlign:'center', paddingTop:8 }}>
        <a href="/post-project" style={{ fontSize:13, color:'var(--navy)', fontWeight:600, textDecoration:'none' }}>+ Post another project</a>
      </div>
    </div>
  )
}

function ListingTab({ submission }) {
  const STATUS = {
    pending_review: { bg:'#FEF3C7', color:'#92400E', label:'Under Review', desc:'Your application is being reviewed. We will contact you on WhatsApp within 1–2 business days.' },
    approved:       { bg:'#F0FDF4', color:'#166534', label:'Approved',      desc:'Your application was approved. Your listing is being set up.'                                   },
    listed:         { bg:'#EFF6FF', color:'#1E40AF', label:'Listed',         desc:'You are live on TilersHub! Customers can find and contact you.'                                },
    rejected:       { bg:'#FEF2F2', color:'#991B1B', label:'Not Approved',  desc:'Your application was not approved. Contact us for details.'                                    },
  }

  if (!submission) return (
    <div style={{ textAlign:'center', padding:'48px 20px', background:'#fff', borderRadius:16, border:'1px solid var(--border)' }}>
      <div style={{ fontSize:40, marginBottom:12 }}>👷</div>
      <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:8 }}>Not listed yet</div>
      <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:20, lineHeight:1.7 }}>
        Apply to get listed on TilersHub for free and start receiving inquiries.
      </p>
      <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
        <a href="/join-tilershub" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'11px 22px', background:'var(--navy)', color:'#fff', borderRadius:10, fontSize:13, fontWeight:700, textDecoration:'none' }}>✅ Apply as Provider</a>
        <a href="/providers"      style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'11px 22px', background:'var(--surface-3)', color:'var(--text-2)', border:'1px solid var(--border)', borderRadius:10, fontSize:13, fontWeight:600, textDecoration:'none' }}>Browse Directory</a>
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
          <div style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Services</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {submission.services.map(sv => <span key={sv} className="chip chip-navy" style={{ fontSize:11 }}>{sv}</span>)}
          </div>
        </div>
      )}
      <div style={{ marginTop:18, paddingTop:16, borderTop:'1px solid var(--border)' }}>
        <a href={`https://wa.me/94774503744?text=Hi TilersHub, I applied as a provider (${submission.name}) and want to check my listing status.`} target="_blank" rel="noopener" style={{ fontSize:12, fontWeight:600, color:'#16a34a', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:5 }}>
          💬 Contact TilersHub on WhatsApp
        </a>
      </div>
    </div>
  )
}
