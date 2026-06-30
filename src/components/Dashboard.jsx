import { useState, useEffect } from 'react'
import { supabase, getUser, signOut, onAuthStateChange, buildWhatsAppLink } from '../lib/supabase.js'
import ProfileEditor from './ProfileEditor.jsx'
import PortfolioEditor from './PortfolioEditor.jsx'
import { useLang } from '../lib/useLang.js'

const TYPE_ICON = {
  'Floor Tiling':'🪨','Bathroom Tiling':'🚿','Bathroom Renovation':'🛁',
  'Granite Works':'💎','Tile Cutting':'✂️','Routering':'🔧',
  'Waterproofing':'💧','Tile Shop Inquiry':'🏪',
}

function timeAgo(d) {
  if (!d) return ''
  const m = Math.floor((Date.now() - new Date(d)) / 60000)
  if (m < 60)   return `${m}m`
  if (m < 1440) return `${Math.floor(m/60)}h`
  if (m < 10080)return `${Math.floor(m/1440)}d`
  return new Date(d).toLocaleDateString('en-LK', { day:'numeric', month:'short' })
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

export default function Dashboard({ initialUser, initialProjects, initialProvider, initialBids }) {
  const [user, setUser]               = useState(initialUser ?? null)
  const [loading, setLoading]         = useState(!initialUser)
  const [loadError, setLoadError]     = useState(null)
  const [projects, setProjects]       = useState(initialProjects || [])
  const [claimedProfile, setClaimedProfile] = useState(initialProvider ?? null)
  const [dataLoading, setDataLoading] = useState(false)
  const [submission, setSubmission]   = useState(null)

  // Build bids map from flat array
  const buildBidsMap = (flatBids) => {
    const byJob = {}
    for (const b of flatBids || []) { if (!byJob[b.job_id]) byJob[b.job_id] = []; byJob[b.job_id].push(b) }
    return byJob
  }
  const [bids, setBids] = useState(() => buildBidsMap(initialBids))

  useEffect(() => {
    if (initialUser) {
      // Load submission status (not passed from server yet)
      supabase.from('provider_submissions').select('*').eq('user_id', initialUser.id)
        .order('created_at', { ascending: false }).limit(1).maybeSingle()
        .then(({ data }) => setSubmission(data))
      return
    }
    getUser().then(u => { setUser(u); setLoading(false); if (u) loadData(u) })
    onAuthStateChange(u => { setUser(u); if (u) loadData(u); else setLoading(false) })
  }, [])

  async function loadData(u) {
    setDataLoading(true)
    setLoadError(null)
    const [projRes, subRes, providerRes] = await Promise.all([
      supabase.from('projects').select('*').eq('user_id', u.id).order('created_at', { ascending: false }),
      supabase.from('provider_submissions').select('*').eq('user_id', u.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('providers').select('*').eq('user_id', u.id).maybeSingle(),
    ])
    if (projRes.error || subRes.error || providerRes.error) {
      const err = projRes.error || subRes.error || providerRes.error
      console.error('dashboard load error:', err)
      setLoadError(err.message)
      setDataLoading(false)
      return
    }
    const userProjects = projRes.data || []
    setProjects(userProjects)
    setSubmission(subRes.data)
    if (providerRes.data) setClaimedProfile(providerRes.data)

    if (userProjects.length > 0) {
      const { data: bidData } = await supabase
        .from('bids').select('*').in('job_id', userProjects.map(p => p.id)).order('created_at', { ascending: false })
      setBids(buildBidsMap(bidData))
    }
    setDataLoading(false)
  }

  if (loading) return <Spinner full />
  if (!user)   return <SignInPrompt />
  if (loadError) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>Could not load your dashboard</h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>{loadError}</p>
        <button onClick={() => window.location.reload()} style={{ padding: '10px 24px', background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Try Again
        </button>
      </div>
    </div>
  )

  const isProvider = !!claimedProfile ||
    (submission && ['pending_review','approved','listed'].includes(submission?.status))

  const showClaimedBanner =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('claimed') &&
    !!claimedProfile

  const showWelcomeBanner =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('welcome') &&
    !claimedProfile

  return isProvider
    ? <ProviderDashboard user={user} claimedProfile={claimedProfile} submission={submission} showClaimedBanner={showClaimedBanner} showWelcomeBanner={showWelcomeBanner} />
    : <ConsumerDashboard user={user} projects={projects} bids={bids} submission={submission} dataLoading={dataLoading} showClaimedBanner={showClaimedBanner} />
}

// ═══════════════════════════════════════════════════════════════════
// PROVIDER DASHBOARD
// ═══════════════════════════════════════════════════════════════════

function ProviderDashboard({ user, claimedProfile, submission, showClaimedBanner, showWelcomeBanner }) {
  const lang = useLang()
  const initialTab = typeof window !== 'undefined'
    ? (new URLSearchParams(window.location.search).get('tab') || 'explore')
    : 'explore'
  const [tab, setTab]                   = useState(initialTab)
  const [exploreProjects, setExploreProjects] = useState([])
  const [submittedBids, setSubmittedBids]     = useState([])
  const [savedProjects, setSavedProjects]     = useState([])
  const [reviews, setReviews]                 = useState([])
  const [dataLoaded, setDataLoaded]           = useState({ explore:false, quotes:false, saved:false, reviews:false })
  const [dataLoading, setDataLoading]         = useState(false)
  const [pendingClaim, setPendingClaim]       = useState(null)
  const [claimLoading, setClaimLoading]       = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('tab')) {
      setTab(params.get('tab'))
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  useEffect(() => {
    if (tab === 'explore'  && !dataLoaded.explore)  loadExploreData()
    if (tab === 'quotes'   && !dataLoaded.quotes)   loadQuotesData()
    if (tab === 'saved'    && !dataLoaded.saved)    loadSavedData()
    if (tab === 'reviews'  && !dataLoaded.reviews)  loadReviewsData()
    if (tab === 'profile'  && !claimedProfile && pendingClaim === null) loadPendingClaim()
  }, [tab])

  async function loadExploreData() {
    setDataLoading(true)
    const { data } = await supabase
      .from('projects').select('*').eq('status', 'active')
      .order('created_at', { ascending: false })
    setExploreProjects(data || [])
    setDataLoaded(p => ({ ...p, explore: true }))
    setDataLoading(false)
  }

  async function loadQuotesData() {
    setDataLoading(true)
    const providerWA = claimedProfile?.whatsapp || claimedProfile?.phone
    if (providerWA) {
      const { data: subBidData } = await supabase
        .from('bids').select('*').eq('bidder_whatsapp', providerWA).order('created_at', { ascending: false })
      if (subBidData?.length > 0) {
        const jobIds = [...new Set(subBidData.map(b => b.job_id))]
        const { data: jobProjects } = await supabase
          .from('projects').select('id,project_type,city,district,description').in('id', jobIds)
        const projById = {}
        for (const p of jobProjects || []) projById[p.id] = p
        setSubmittedBids(subBidData.map(b => ({ ...b, project: projById[b.job_id] || null })))
      } else {
        setSubmittedBids([])
      }
    }
    setDataLoaded(p => ({ ...p, quotes: true }))
    setDataLoading(false)
  }

  async function loadSavedData() {
    setDataLoading(true)
    const { data, error } = await supabase
      .from('saved_projects')
      .select('id,project_id,created_at,projects(*)')
      .eq('provider_id', user.id)
      .order('created_at', { ascending: false })
    if (!error) setSavedProjects(data || [])
    setDataLoaded(p => ({ ...p, saved: true }))
    setDataLoading(false)
  }

  async function loadReviewsData() {
    if (!claimedProfile?.id) { setDataLoaded(p => ({ ...p, reviews: true })); return }
    setDataLoading(true)
    const { data, error } = await supabase
      .from('reviews').select('*').eq('provider_id', claimedProfile.id)
      .order('created_at', { ascending: false })
    if (!error) setReviews(data || [])
    setDataLoaded(p => ({ ...p, reviews: true }))
    setDataLoading(false)
  }

  async function loadPendingClaim() {
    setClaimLoading(true)
    const { data } = await supabase
      .from('claim_requests')
      .select('id, profile_name, created_at')
      .eq('user_id', user.id)
      .eq('status', 'pending_code')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    setPendingClaim(data || false)
    setClaimLoading(false)
  }

  const T = { explore:'🔍 Explore', quotes:'💬 My Quotes', saved:'🔖 Saved', profile:'👤 Profile', reviews:'⭐ Reviews', provider:'Provider', signOut:'Sign Out', viewListing:'🔗 View Listing' }

  const TABS = [
    { key:'explore',  label: T.explore  },
    { key:'quotes',   label: T.quotes   },
    { key:'saved',    label: T.saved    },
    { key:'profile',  label: T.profile  },
    { key:'reviews',  label: T.reviews  },
  ]

  const profileName = claimedProfile?.name || user.email.split('@')[0]
  const initials    = profileName.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
  const profileHref = claimedProfile?.slug ? `/providers/${claimedProfile.slug}` : null

  return (
    <div style={{ minHeight:'100dvh', background:'#f8fafc', paddingBottom:80 }}>
      <style>{MOBILE_STYLES}</style>

      {/* ── Provider header ── */}
      <div style={{ background:'linear-gradient(135deg,#0F1E35 0%,#1A2B4A 100%)', paddingBottom:0 }}>
        <div className="db-header-pad" style={{ maxWidth:860, margin:'0 auto', padding:'20px 16px 0' }}>

          {showClaimedBanner && (
            <div style={{ padding:'10px 14px', background:'rgba(22,163,74,0.15)', border:'1px solid rgba(22,163,74,0.3)', borderRadius:10, marginBottom:14 }}>
              <span style={{ fontSize:13, color:'#4ade80', fontWeight:600 }}>✓ Profile claimed! Edit your profile in the Profile tab.</span>
            </div>
          )}

          {showWelcomeBanner && (
            <div style={{ padding:'12px 16px', background:'rgba(22,163,74,0.15)', border:'1px solid rgba(22,163,74,0.3)', borderRadius:10, marginBottom:14 }}>
              <div style={{ fontSize:13, color:'#4ade80', fontWeight:700, marginBottom:3 }}>🎉 Application submitted!</div>
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.65)' }}>Our team will review within 1–2 business days and contact you on WhatsApp. Go to the <strong style={{ color:'rgba(255,255,255,0.85)' }}>Profile tab</strong> to add photos and more details.</span>
            </div>
          )}

          {/* Identity row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div className="db-avatar" style={{ width:52, height:52, borderRadius:14, background:'rgba(212,175,55,0.14)', border:'2px solid rgba(212,175,55,0.3)', color:'#D4AF37', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, flexShrink:0 }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.38)', letterSpacing:2, textTransform:'uppercase', marginBottom:2 }}>{T.provider}</div>
                <div className="db-profile-name" style={{ fontSize:16, fontWeight:700, color:'#fff', lineHeight:1.2 }}>{profileName}</div>
                {claimedProfile && (
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.38)', marginTop:1 }}>
                    {claimedProfile.city || claimedProfile.district || ''}
                    {claimedProfile.verification_status === 'th_master' && <span style={{ marginLeft:6, color:'#D4AF37' }}>· 🛡️ TH Master</span>}
                    {claimedProfile.is_verified && claimedProfile.verification_status !== 'th_master' && <span style={{ marginLeft:6, color:'#4ade80' }}>· ✓ Verified</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="db-identity-actions" style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {profileHref && (
                <a href={profileHref} style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.55)', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, padding:'6px 12px', textDecoration:'none', whiteSpace:'nowrap' }}>
                  {T.viewListing}
                </a>
              )}
              <button
                onClick={async () => { await signOut(); window.location.href = '/' }}
                style={{ fontSize:12, color:'rgba(255,255,255,0.45)', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontWeight:600, whiteSpace:'nowrap' }}
              >{T.signOut}</button>
            </div>
          </div>

          {/* Tab bar */}
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
            <div style={{ flexShrink:0, width:14 }} />
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="db-content-pad" style={{ maxWidth:860, margin:'0 auto', padding:'20px 16px' }}>
        {tab === 'explore' && (dataLoading ? <Spinner /> : <ExploreTab projects={exploreProjects} user={user} lang={lang} />)}
        {tab === 'quotes'  && (dataLoading ? <Spinner /> : <MyQuotesTab submittedBids={submittedBids} lang={lang} />)}
        {tab === 'saved'   && (dataLoading ? <Spinner /> : <SavedTab savedProjects={savedProjects} user={user} setSavedProjects={setSavedProjects} lang={lang} />)}
        {tab === 'profile' && <ProfileTab user={user} claimedProfile={claimedProfile} submission={submission} profileHref={profileHref} lang={lang} pendingClaim={pendingClaim} claimLoading={claimLoading} />}
        {tab === 'reviews' && (dataLoading ? <Spinner /> : <ReviewsTab reviews={reviews} profileHref={profileHref} lang={lang} />)}
      </div>
    </div>
  )
}

// ── Explore Projects Tab ──────────────────────────────────────────────────────
function ExploreTab({ projects, user, lang }) {
  const [typeFilter, setTypeFilter] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')
  const [savedIds, setSavedIds] = useState(new Set())
  const [saving, setSaving] = useState(null)

  const T = { empty:'No projects found', allTypes:'All services', allDist:'All districts', contact:'📞 Contact', save:'🔖 Save', saved:'🔖 Saved' }

  useEffect(() => {
    if (!user?.id) return
    supabase.from('saved_projects').select('project_id').eq('provider_id', user.id)
      .then(({ data }) => { if (data) setSavedIds(new Set(data.map(s => s.project_id))) })
  }, [user?.id])

  async function toggleSave(e, projectId) {
    e.preventDefault()
    if (!user?.id) return
    setSaving(projectId)
    if (savedIds.has(projectId)) {
      await supabase.from('saved_projects').delete().eq('provider_id', user.id).eq('project_id', projectId)
      setSavedIds(prev => { const n = new Set(prev); n.delete(projectId); return n })
    } else {
      await supabase.from('saved_projects').insert({ provider_id: user.id, project_id: projectId })
      setSavedIds(prev => new Set([...prev, projectId]))
    }
    setSaving(null)
  }

  const types     = [...new Set(projects.map(p => p.project_type).filter(Boolean))]
  const districts = [...new Set(projects.map(p => p.district).filter(Boolean))]
  const filtered  = projects.filter(p =>
    (!typeFilter || p.project_type === typeFilter) &&
    (!districtFilter || p.district === districtFilter)
  )

  return (
    <div>
      {/* Filters */}
      {projects.length > 0 && (
        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            style={{ padding:'8px 12px', borderRadius:10, border:'1px solid var(--border)', fontSize:13, background:'#fff', color:'var(--text)', cursor:'pointer' }}>
            <option value="">{T.allTypes}</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}
            style={{ padding:'8px 12px', borderRadius:10, border:'1px solid var(--border)', fontSize:13, background:'#fff', color:'var(--text)', cursor:'pointer' }}>
            <option value="">{T.allDist}</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'48px 20px', background:'#fff', borderRadius:16, border:'1px solid var(--border)' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
          <div style={{ fontSize:15, fontWeight:700, color:'var(--text)' }}>{T.empty}</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {filtered.map(p => {
            const icon  = TYPE_ICON[p.project_type] || '🏠'
            const isSaved = savedIds.has(p.id)
            const phone = p.whatsapp
            const excerpt = p.description?.length > 120 ? p.description.slice(0,120)+'…' : p.description
            return (
              <div key={p.id} style={{ background:'#fff', borderRadius:16, border:'1px solid var(--border)', padding:'16px 18px', boxShadow:'var(--shadow-sm)' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10, marginBottom:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:20 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{p.project_type}</div>
                      {(p.city || p.district) && <div style={{ fontSize:11, color:'var(--text-3)' }}>📍 {p.city}{p.district && p.district !== p.city ? `, ${p.district}` : ''}</div>}
                    </div>
                  </div>
                  <span style={{ fontSize:11, color:'var(--text-4)', whiteSpace:'nowrap', flexShrink:0 }}>{timeAgo(p.created_at)}</span>
                </div>
                {excerpt && <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.6, margin:'0 0 10px' }}>{excerpt}</p>}
                {p.budget_range && <div style={{ fontSize:11, color:'#166534', fontWeight:600, marginBottom:10 }}>💰 {p.budget_range}</div>}
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {phone && (
                    <a href={buildWhatsAppLink(phone, p.customer_name || '')} target="_blank" rel="noopener noreferrer"
                      style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#25D366', color:'#fff', borderRadius:8, padding:'8px 14px', fontSize:12, fontWeight:700, textDecoration:'none' }}>
                      {T.contact}
                    </a>
                  )}
                  <button
                    onClick={e => toggleSave(e, p.id)}
                    disabled={saving === p.id}
                    style={{ display:'inline-flex', alignItems:'center', gap:5, background: isSaved ? '#eef3fb' : '#f8fafc', color: isSaved ? '#1B3A6B' : 'var(--text-3)', border:`1px solid ${isSaved ? '#d5e2f5' : 'var(--border)'}`, borderRadius:8, padding:'7px 12px', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                    {isSaved ? T.saved : T.save}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── My Quotes Tab ─────────────────────────────────────────────────────────────
function MyQuotesTab({ submittedBids, lang }) {
  const T = { title:'Quotes You Submitted', empty:'No quotes yet', emptyDesc:'Browse the Explore tab and submit quotes to active projects.' }

  if (submittedBids.length === 0) return (
    <div style={{ textAlign:'center', padding:'48px 20px', background:'#fff', borderRadius:16, border:'1px solid var(--border)' }}>
      <div style={{ fontSize:40, marginBottom:12 }}>💬</div>
      <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:8 }}>{T.empty}</div>
      <p style={{ fontSize:13, color:'var(--text-3)', lineHeight:1.7 }}>{T.emptyDesc}</p>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ fontSize:12, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>{T.title} ({submittedBids.length})</div>
      {submittedBids.map(bid => {
        const isNew = bid.status === 'new'
        const statusLabel = bid.status === 'accepted' ? '✓ Accepted' : bid.status === 'rejected' ? '✗ Rejected' : 'New'
        return (
          <div key={bid.id} style={{ padding:'16px 18px', background:'#fff', borderRadius:14, border:`1.5px solid ${isNew ? '#fde68a' : 'var(--border)'}`, borderLeft:`4px solid ${isNew ? '#f59e0b' : '#e2e8f0'}`, boxShadow:'var(--shadow-sm)' }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>
              {TYPE_ICON[bid.project?.project_type] || '🏠'} {bid.project?.project_type || '—'} · 📍 {bid.project?.city || bid.project?.district || '—'}
            </div>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10, marginBottom:6 }}>
              <div>
                {bid.quote_amount && <span style={{ fontSize:14, fontWeight:700, color:'#166534' }}>Rs. {Number(bid.quote_amount).toLocaleString()}</span>}
                {bid.timeline && <span style={{ fontSize:12, color:'var(--text-3)', marginLeft:10 }}>· {bid.timeline}</span>}
                <span style={{ fontSize:11, color:'var(--text-4)', marginLeft:8 }}>· {timeAgo(bid.created_at)}</span>
              </div>
              <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background: isNew ? '#fef3c7' : '#f1f5f9', color: isNew ? '#92400e' : '#64748b', whiteSpace:'nowrap', flexShrink:0 }}>{statusLabel}</span>
            </div>
            {bid.message && <p style={{ fontSize:13, color:'#475569', lineHeight:1.6, margin:0 }}>{bid.message.length > 200 ? bid.message.slice(0,200)+'…' : bid.message}</p>}
          </div>
        )
      })}
    </div>
  )
}

// ── Saved Projects Tab ────────────────────────────────────────────────────────
function SavedTab({ savedProjects, user, setSavedProjects, lang }) {
  const T = { empty:'No saved projects', emptyDesc:'Tap 🔖 on any project in the Explore tab to save it here.', remove:'Remove', contact:'📞 Contact' }

  async function removeSaved(projectId) {
    await supabase.from('saved_projects').delete().eq('provider_id', user.id).eq('project_id', projectId)
    setSavedProjects(prev => prev.filter(s => s.project_id !== projectId))
  }

  if (savedProjects.length === 0) return (
    <div style={{ textAlign:'center', padding:'48px 20px', background:'#fff', borderRadius:16, border:'1px solid var(--border)' }}>
      <div style={{ fontSize:40, marginBottom:12 }}>🔖</div>
      <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:8 }}>{T.empty}</div>
      <p style={{ fontSize:13, color:'var(--text-3)', lineHeight:1.7 }}>{T.emptyDesc}</p>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {savedProjects.map(sp => {
        const p = sp.projects || {}
        const icon = TYPE_ICON[p.project_type] || '🏠'
        const phone = p.whatsapp
        const excerpt = p.description?.length > 100 ? p.description.slice(0,100)+'…' : p.description
        return (
          <div key={sp.id} style={{ background:'#fff', borderRadius:16, border:'1px solid var(--border)', padding:'16px 18px', boxShadow:'var(--shadow-sm)' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10, marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:20 }}>{icon}</span>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{p.project_type || '—'}</div>
                  {(p.city || p.district) && <div style={{ fontSize:11, color:'var(--text-3)' }}>📍 {p.city}{p.district && p.district !== p.city ? `, ${p.district}` : ''}</div>}
                </div>
              </div>
              <button onClick={() => removeSaved(sp.project_id)} style={{ fontSize:11, color:'#dc2626', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:7, padding:'4px 10px', cursor:'pointer', whiteSpace:'nowrap', fontWeight:600 }}>{T.remove}</button>
            </div>
            {excerpt && <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.6, margin:'0 0 10px' }}>{excerpt}</p>}
            {p.budget_range && <div style={{ fontSize:11, color:'#166534', fontWeight:600, marginBottom:10 }}>💰 {p.budget_range}</div>}
            {phone && (
              <a href={buildWhatsAppLink(phone, p.customer_name || '')} target="_blank" rel="noopener noreferrer"
                style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#25D366', color:'#fff', borderRadius:8, padding:'8px 14px', fontSize:12, fontWeight:700, textDecoration:'none' }}>
                {T.contact}
              </a>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileTab({ user, claimedProfile, submission, profileHref, lang, pendingClaim, claimLoading }) {
  const [showEditor, setShowEditor]     = useState(false)
  const [showPortfolio, setShowPortfolio] = useState(false)

  const T = { viewProfile:'🔗 View Listing', editProfile:'✏️ Edit Profile', managePhotos:'📸 Photos', noProfile:'Not Listed', noProfileDesc:'Get listed on TilersHub to receive project enquiries.', join:'✅ Apply as Provider' }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {claimedProfile ? (
        <div style={{ background:'#fff', borderRadius:16, border:'1px solid var(--border)', padding:'20px 18px', boxShadow:'var(--shadow-sm)' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:16, flexWrap:'wrap' }}>
            <div>
              <div style={{ fontSize:16, fontWeight:700, color:'var(--text)', marginBottom:3 }}>{claimedProfile.name}</div>
              {(claimedProfile.city || claimedProfile.district) && <div style={{ fontSize:12, color:'var(--text-3)' }}>📍 {claimedProfile.city || claimedProfile.district}</div>}
              {claimedProfile.avg_rating > 0 && <div style={{ fontSize:12, color:'#f59e0b', marginTop:3 }}>⭐ {Number(claimedProfile.avg_rating).toFixed(1)}</div>}
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {profileHref && <a href={profileHref} target="_blank" rel="noopener" style={{ fontSize:12, fontWeight:600, color:'var(--navy)', background:'var(--navy-50)', border:'1px solid var(--navy-100)', borderRadius:8, padding:'7px 12px', textDecoration:'none', whiteSpace:'nowrap' }}>{T.viewProfile}</a>}
              {claimedProfile && <button onClick={() => setShowEditor(true)} style={{ fontSize:12, fontWeight:600, color:'#fff', background:'var(--navy)', border:'none', borderRadius:8, padding:'7px 12px', cursor:'pointer', whiteSpace:'nowrap' }}>{T.editProfile}</button>}
              {claimedProfile && <button onClick={() => setShowPortfolio(true)} style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:8, padding:'7px 12px', cursor:'pointer', whiteSpace:'nowrap' }}>{T.managePhotos}</button>}
            </div>
          </div>
          {showEditor && <ProfileEditor profile={claimedProfile} profileType="provider" userId={user.id} />}
          {showPortfolio && <PortfolioEditor profile={claimedProfile} profileType="provider" userId={user.id} />}
        </div>
      ) : (
        <>
          {claimLoading && (
            <div style={{ padding:'14px 16px', background:'#f8fafc', borderRadius:12, border:'1px solid var(--border)', fontSize:13, color:'var(--text-3)' }}>
              ⏳ Checking for pending claims…
            </div>
          )}
          {!claimLoading && pendingClaim && (
            <div style={{ background:'#fffbeb', border:'1.5px solid #fcd34d', borderLeft:'4px solid #f59e0b', borderRadius:14, padding:'16px' }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#92400e', marginBottom:6 }}>⏳ Claim In Progress</div>
              <p style={{ fontSize:13, color:'#78350f', marginBottom:14, lineHeight:1.6 }}>
                You started claiming <strong>{pendingClaim.profile_name}</strong>. Enter the 5-digit code sent to the WhatsApp number on that profile to complete verification.
              </p>
              <a
                href={`/verify-claim?id=${pendingClaim.id}`}
                style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'10px 18px', background:'#f59e0b', color:'#fff', borderRadius:10, fontSize:13, fontWeight:700, textDecoration:'none' }}
              >
                Enter PIN &amp; Complete Claim →
              </a>
            </div>
          )}
          <div style={{ textAlign:'center', padding:'36px 20px', background:'#fff', borderRadius:16, border:'1px solid var(--border)' }}>
            <div style={{ fontSize:36, marginBottom:12 }}>👷</div>
            <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:8 }}>{T.noProfile}</div>
            <p style={{ fontSize:13, color:'var(--text-3)', lineHeight:1.7, marginBottom:16 }}>{T.noProfileDesc}</p>
            <a href="/join-tilershub" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'10px 20px', background:'var(--navy)', color:'#fff', borderRadius:10, fontSize:13, fontWeight:700, textDecoration:'none' }}>{T.join}</a>
          </div>
        </>
      )}
      <ListingTab submission={submission} />
    </div>
  )
}

// ── Reviews Tab ───────────────────────────────────────────────────────────────
function ReviewsTab({ reviews, profileHref, lang }) {
  const T = { empty:'No reviews yet', emptyDesc:'Share your profile link to receive reviews from customers.', shareProfile:'🔗 Share Profile' }

  if (reviews.length === 0) return (
    <div style={{ textAlign:'center', padding:'48px 20px', background:'#fff', borderRadius:16, border:'1px solid var(--border)' }}>
      <div style={{ fontSize:40, marginBottom:12 }}>⭐</div>
      <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:8 }}>{T.empty}</div>
      <p style={{ fontSize:13, color:'var(--text-3)', lineHeight:1.7, marginBottom:16 }}>{T.emptyDesc}</p>
      {profileHref && <a href={profileHref} target="_blank" rel="noopener" style={{ fontSize:13, fontWeight:600, color:'var(--navy)', textDecoration:'none' }}>{T.shareProfile}</a>}
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {reviews.map(r => {
        const stars = r.rating || r.stars || 5
        const name = r.reviewer_name || r.customer_name || 'Customer'
        const comment = r.comment || r.review_text || r.message || ''
        return (
          <div key={r.id} style={{ background:'#fff', borderRadius:14, border:'1px solid var(--border)', padding:'16px 18px', boxShadow:'var(--shadow-sm)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
              <span style={{ color:'#f59e0b', fontSize:14 }}>{'⭐'.repeat(Math.min(stars, 5))}</span>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text)' }}>{name}</span>
              <span style={{ fontSize:11, color:'var(--text-4)', marginLeft:'auto' }}>{timeAgo(r.created_at)}</span>
            </div>
            {comment && <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.6, margin:0 }}>{comment}</p>}
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CONSUMER DASHBOARD
// ═══════════════════════════════════════════════════════════════════

function SavedProvidersTab({ userId }) {
  const [items, setItems] = useState(null)
  const [removing, setRemoving] = useState(null)

  useEffect(() => {
    supabase.from('saved_providers')
      .select('id, provider_id, providers(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems(data || []))
  }, [userId])

  async function remove(savedId) {
    setRemoving(savedId)
    await supabase.from('saved_providers').delete().eq('id', savedId)
    setItems(prev => prev.filter(i => i.id !== savedId))
    setRemoving(null)
  }

  if (items === null) return <Spinner />

  if (items.length === 0) return (
    <div style={{ textAlign:'center', padding:'48px 20px', background:'#fff', borderRadius:16, border:'1px solid var(--border)' }}>
      <div style={{ fontSize:40, marginBottom:12 }}>❤️</div>
      <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:8 }}>No saved providers yet</div>
      <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:20, lineHeight:1.7 }}>Browse providers and tap ❤️ to save them here.</p>
      <a href="/providers" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'11px 22px', background:'var(--navy)', color:'#fff', borderRadius:10, fontSize:13, fontWeight:700, textDecoration:'none' }}>
        Browse Providers →
      </a>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {items.map(item => {
        const p = item.providers
        if (!p) return null
        const rating = p.avg_rating
        return (
          <div key={item.id} style={{ background:'#fff', borderRadius:14, border:'1px solid var(--border)', padding:'14px 16px', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:48, height:48, borderRadius:12, background:'#1B3A6B', flexShrink:0, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'#fff' }}>
              {p.profile_image
                ? <img src={p.profile_image} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : (p.name || '?')[0].toUpperCase()
              }
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
              <div style={{ fontSize:11, color:'var(--text-3)', marginTop:2, display:'flex', flexWrap:'wrap', gap:'0 8px' }}>
                {rating > 0
                  ? <span style={{ color:'#b45309' }}>⭐ {Number(rating).toFixed(1)} ({p.review_count || 0})</span>
                  : <span style={{ color:'#94a3b8' }}>⭐ New · No reviews yet</span>
                }
                {p.city && <span>📍 {p.city}</span>}
              </div>
            </div>
            <div style={{ display:'flex', gap:8, flexShrink:0 }}>
              {p.slug && (
                <a href={`/providers/${p.slug}`} style={{ fontSize:12, fontWeight:700, color:'var(--navy)', background:'#eef3fb', borderRadius:8, padding:'6px 12px', textDecoration:'none', whiteSpace:'nowrap' }}>
                  View →
                </a>
              )}
              <button
                onClick={() => remove(item.id)}
                disabled={removing === item.id}
                style={{ fontSize:12, fontWeight:700, color:'#dc2626', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, padding:'6px 10px', cursor:'pointer' }}
              >
                {removing === item.id ? '…' : '✕'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ConsumerDashboard({ user, projects, bids, submission, dataLoading, showClaimedBanner }) {
  const initials = (user.email || '?').split('@')[0].slice(0,2).toUpperCase()
  const [consumerTab, setConsumerTab] = useState('projects')

  const CONSUMER_TABS = [
    { id:'projects', label:'📋 My Projects' },
    { id:'saved',    label:'❤️ Saved Providers' },
  ]

  return (
    <div style={{ minHeight:'100dvh', background:'#f8fafc', paddingBottom:80 }}>
      <style>{MOBILE_STYLES}</style>

      {/* ── Consumer header ── */}
      <div style={{ background:'#fff', borderBottom:'1px solid var(--border)' }}>
        <div className="db-header-pad" style={{ maxWidth:800, margin:'0 auto', padding:'20px 16px 0' }}>

          {showClaimedBanner && (
            <div style={{ padding:'10px 14px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, marginBottom:14 }}>
              <span style={{ fontSize:13, color:'#15803d', fontWeight:600 }}>✓ Profile claimed successfully!</span>
            </div>
          )}

          {/* Identity row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div className="db-avatar" style={{ width:52, height:52, borderRadius:14, background:'var(--terra-50)', border:'2px solid rgba(224,90,43,0.2)', color:'var(--terra)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, flexShrink:0 }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-4)', letterSpacing:2, textTransform:'uppercase', marginBottom:2 }}>My Dashboard</div>
                <div className="db-profile-name" style={{ fontSize:16, fontWeight:700, color:'var(--text)', lineHeight:1.2 }}>Welcome back</div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'180px' }}>{user.email}</div>
              </div>
            </div>

            <div className="db-identity-actions" style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
              <a href="/post-project" style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:700, color:'#fff', background:'var(--terra)', borderRadius:9, padding:'7px 14px', textDecoration:'none', whiteSpace:'nowrap' }}>
                📋 Post a Project
              </a>
              <button
                onClick={async () => { await signOut(); window.location.href = '/' }}
                style={{ fontSize:12, color:'var(--text-3)', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontWeight:600, whiteSpace:'nowrap' }}
              >Sign Out</button>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display:'flex', gap:4, borderBottom:'none' }}>
            {CONSUMER_TABS.map(t => (
              <button key={t.id} onClick={() => setConsumerTab(t.id)} style={{ padding:'8px 16px', fontSize:13, fontWeight:700, border:'none', borderBottom: consumerTab === t.id ? '2px solid var(--terra)' : '2px solid transparent', background:'none', color: consumerTab === t.id ? 'var(--terra)' : 'var(--text-3)', cursor:'pointer', borderRadius:0, transition:'color 0.15s' }}>
                {t.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* ── Content ── */}
      <div className="db-content-pad" style={{ maxWidth:800, margin:'0 auto', padding:'20px 16px' }}>
        {consumerTab === 'projects' && (
          <>
            {dataLoading ? <Spinner /> : <ProjectsTab projects={projects} bids={bids} />}
            {!submission && (
              <div style={{ marginTop:28, padding:'20px 22px', background:'var(--navy-50)', border:'1px solid var(--navy-100)', borderRadius:14 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--navy)', marginBottom:4 }}>Are you a tiler or contractor?</div>
                <p style={{ fontSize:12, color:'var(--text-3)', marginBottom:12, lineHeight:1.65 }}>
                  List your services on TilersHub — homeowners find you directly and contact you on WhatsApp.
                </p>
                <a href="/join-tilershub" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 18px', background:'var(--navy)', color:'#fff', borderRadius:9, fontSize:12, fontWeight:700, textDecoration:'none' }}>
                  ✅ Apply as a Provider →
                </a>
              </div>
            )}
          </>
        )}
        {consumerTab === 'saved' && <SavedProvidersTab userId={user.id} />}
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
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:'var(--text)', marginBottom:10 }}>Sign in to your account</h2>
        <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.7, marginBottom:24 }}>
          Providers: find projects and manage your profile.<br/>Homeowners: track your projects and quotes.
        </p>
        <a href="/login" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'12px 28px', background:'var(--navy)', color:'#fff', borderRadius:12, fontSize:14, fontWeight:700, textDecoration:'none' }}>
          Sign in →
        </a>
      </div>
    </div>
  )
}

function BidsPanel({ projectBids }) {
  const [open, setOpen] = useState(false)
  const [providerMap, setProviderMap] = useState({})

  useEffect(() => {
    if (!open) return
    const slugs = [...new Set(projectBids.map(b => b.provider_slug).filter(Boolean))]
    if (slugs.length === 0) return
    supabase.from('providers')
      .select('slug, profile_image, avg_rating, review_count, city, provider_type')
      .in('slug', slugs)
      .then(({ data }) => {
        if (data) {
          const m = {}
          for (const p of data) m[p.slug] = p
          setProviderMap(m)
        }
      })
  }, [open])

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
        {projectBids.length} bid{projectBids.length !== 1 ? 's' : ''} received
        {newCount > 0 && <span style={{ fontSize:11, color:'#f59e0b', fontWeight:700 }}>· {newCount} new</span>}
        <span style={{ fontSize:14, color:'#94a3b8' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:10 }}>
          {projectBids.map(bid => {
            const wa = bid.bidder_whatsapp?.replace(/\D/g,'')
            const norm = wa?.startsWith('94') ? wa : '94' + (wa?.replace(/^0/,'') || '')
            const waLink = `https://wa.me/${norm}?text=${encodeURIComponent('Hi! 👋\n\nI saw your bid on TilersHub. Let\'s discuss your quote.\n\nThank you!')}`
            const prov = bid.provider_slug ? providerMap[bid.provider_slug] : null
            const profileUrl = bid.provider_slug ? `/providers/${bid.provider_slug}` : null
            const CardTag = profileUrl ? 'a' : 'div'
            const cardStyle = { padding:'14px 16px', background:'#fff', borderRadius:12, border:`1.5px solid ${bid.status==='new'?'#fde68a':'#e2e8f0'}`, borderLeft:`4px solid ${bid.status==='new'?'#f59e0b':'#e2e8f0'}`, ...(profileUrl ? { cursor:'pointer', textDecoration:'none', color:'inherit', display:'block' } : {}) }
            return (
              <CardTag
                key={bid.id}
                {...(profileUrl ? { href:profileUrl, target:'_blank', rel:'noopener' } : {})}
                style={cardStyle}
                onMouseOver={profileUrl ? e => { e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'; e.currentTarget.style.background='#f8faff' } : undefined}
                onMouseOut={profileUrl ? e => { e.currentTarget.style.boxShadow=''; e.currentTarget.style.background='#fff' } : undefined}
              >
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10, marginBottom:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0 }}>
                    <div style={{ flexShrink:0 }}>
                      {prov?.profile_image
                        ? <img src={prov.profile_image} alt={bid.bidder_name} style={{ width:44, height:44, borderRadius:'50%', objectFit:'cover', border:'2px solid #e2e8f0' }} />
                        : <div style={{ width:44, height:44, borderRadius:'50%', background: profileUrl ? '#1B3A6B' : '#e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color: profileUrl ? '#fff' : '#64748b', fontWeight:700 }}>{(bid.bidder_name||'?')[0].toUpperCase()}</div>
                      }
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:700, color: profileUrl ? '#1B3A6B' : '#0f172a' }}>{bid.bidder_name}{profileUrl ? ' ↗' : ''}</div>
                      <div style={{ fontSize:11, color:'#64748b', marginTop:2, display:'flex', flexWrap:'wrap', gap:'0 8px' }}>
                        {prov && (prov.avg_rating > 0
                          ? <span style={{ color:'#b45309' }}>⭐ {Number(prov.avg_rating).toFixed(1)} ({prov.review_count || 0})</span>
                          : <span style={{ color:'#94a3b8' }}>⭐ New · No reviews yet</span>
                        )}
                        {prov?.city && <span>📍 {prov.city}</span>}
                        {!prov && <span style={{ textTransform:'capitalize' }}>{bid.bidder_type}</span>}
                        {bid.quote_amount && <span style={{ color:'#166534', fontWeight:600 }}>Rs. {bid.quote_amount.toLocaleString()}</span>}
                        {bid.timeline     && <span>· {bid.timeline}</span>}
                      </div>
                    </div>
                  </div>
                  {bid.status === 'new' && <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:'#fef3c7', color:'#92400e', whiteSpace:'nowrap' }}>New</span>}
                </div>
                {bid.message && <p style={{ fontSize:12, color:'#475569', lineHeight:1.6, margin:'0 0 10px' }}>
                  {bid.message.length > 200 ? bid.message.slice(0,200)+'…' : bid.message}
                </p>}
                <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                  <a href={waLink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700, background:'#25D366', color:'#fff', borderRadius:8, padding:'7px 14px', textDecoration:'none' }}>
                    💬 Contact via WhatsApp
                  </a>
                  {profileUrl && <span style={{ fontSize:11, color:'#94a3b8' }}>Tap card to view profile ↗</span>}
                </div>
              </CardTag>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ProjectsTab({ projects, bids, isProvider }) {
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
        {isProvider
          ? "You haven't posted any projects. Post a tiling project to receive quotes."
          : 'Post a tiling project — providers will submit quotes and you choose who to work with.'}
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
        <a href="/post-project" style={{ fontSize:13, color:'var(--navy)', fontWeight:600, textDecoration:'none' }}>+ Post Another Project</a>
      </div>
    </div>
  )
}

function ListingTab({ submission }) {
  const STATUS = {
    pending_review: { bg:'#FEF3C7', color:'#92400E', label:'Under Review', desc:"Your application is being reviewed. We'll contact you via WhatsApp within 1-2 business days." },
    approved:       { bg:'#F0FDF4', color:'#166534', label:'Approved',      desc:'Your application has been approved. Your listing is being set up.'                            },
    listed:         { bg:'#EFF6FF', color:'#1E40AF', label:'Listed',        desc:"You're live on TilersHub! Customers can find and contact you."                               },
    rejected:       { bg:'#FEF2F2', color:'#991B1B', label:'Not Approved',  desc:'Your application was not approved. Contact us for details.'                                  },
  }

  if (!submission) return (
    <div style={{ textAlign:'center', padding:'48px 20px', background:'#fff', borderRadius:16, border:'1px solid var(--border)' }}>
      <div style={{ fontSize:40, marginBottom:12 }}>👷</div>
      <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:8 }}>Not Listed</div>
      <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:20, lineHeight:1.7 }}>
        Apply to list your services on TilersHub and start receiving enquiries for free.
      </p>
      <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
        <a href="/join-tilershub" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'11px 22px', background:'var(--navy)', color:'#fff', borderRadius:10, fontSize:13, fontWeight:700, textDecoration:'none' }}>✅ Apply as a Provider</a>
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
          💬 Contact TilersHub via WhatsApp
        </a>
      </div>
    </div>
  )
}
