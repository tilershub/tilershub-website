import { useState, useEffect } from 'react'
import { supabase, getUser } from '../lib/supabase.js'

const CACHE_KEY = 'tilershub_role'
const NAME_KEY  = 'tilershub_pname'

const TYPE_ICONS = {
  'Floor Tiling':'🪨','Bathroom Tiling':'🚿','Bathroom Renovation':'🛁',
  'Granite Works':'💎','Tile Cutting':'✂️','Routering':'🔧',
  'Waterproofing':'💧','Tile Shop Inquiry':'🏪',
}
const TYPE_COLORS = {
  'Floor Tiling':'#1B3A6B','Bathroom Tiling':'#0f766e','Bathroom Renovation':'#0f766e',
  'Granite Works':'#7c3aed','Tile Cutting':'#b45309','Routering':'#b45309',
  'Waterproofing':'#0369a1','Tile Shop Inquiry':'#E05A2B',
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000)
  if (diff < 60)     return 'just now'
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(ts).toLocaleDateString('en-GB', { day:'numeric', month:'short' })
}

export default function HomeHero({ heroImg }) {
  const [role, setRole] = useState(() => {
    try { return localStorage.getItem(CACHE_KEY) || 'guest' } catch { return 'guest' }
  })
  const [providerName, setProviderName] = useState(() => {
    try { return localStorage.getItem(NAME_KEY) || '' } catch { return '' }
  })

  useEffect(() => {
    getUser().then(async u => {
      if (!u) {
        setRole('guest')
        try { localStorage.removeItem(CACHE_KEY); localStorage.removeItem(NAME_KEY) } catch {}
        return
      }
      const [{ data: t }, { data: p }] = await Promise.all([
        supabase.from('tilers').select('full_name').eq('user_id', u.id).maybeSingle(),
        supabase.from('providers').select('name').eq('user_id', u.id).maybeSingle(),
      ])
      const name = t?.full_name || p?.name || u.email.split('@')[0]
      if (t || p) {
        setRole('provider')
        setProviderName(name)
        try { localStorage.setItem(CACHE_KEY, 'provider'); localStorage.setItem(NAME_KEY, name) } catch {}
      } else {
        setRole('guest')
        try { localStorage.removeItem(CACHE_KEY); localStorage.removeItem(NAME_KEY) } catch {}
      }
    })
  }, [])

  return role === 'provider'
    ? <><ProviderHero name={providerName} /><ProviderActions /><ProviderProjectsFeed /></>
    : <><GuestHero heroImg={heroImg} /><GuestActions /><GuestProvidersPreview /></>
}

// ─── PROVIDER HERO ────────────────────────────────────────────────

function ProviderHero({ name }) {
  return (
    <div style={{ position:'relative', overflow:'hidden', padding:'24px 20px 20px', background:'linear-gradient(135deg,#0F1E35 0%,#1A2B4A 100%)' }}>
      <div style={{ position:'absolute', inset:0, opacity:0.035, backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.8) 39px,rgba(255,255,255,0.8) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.8) 39px,rgba(255,255,255,0.8) 40px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:'-60px', left:'50%', transform:'translateX(-50%)', width:500, height:260, background:'radial-gradient(ellipse,rgba(212,175,55,0.09) 0%,transparent 70%)', pointerEvents:'none' }} />

      <div style={{ position:'relative', maxWidth:860, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
        <div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.22)', borderRadius:20, padding:'4px 12px', marginBottom:8 }}>
            <span style={{ fontSize:9, fontWeight:700, color:'#D4AF37', letterSpacing:'2.5px', textTransform:'uppercase' }}>👷 Provider Portal</span>
          </div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(20px,4vw,30px)', fontWeight:700, color:'#fff', lineHeight:1.2, margin:'0 0 4px' }}>
            {name
              ? <>Welcome back, <span style={{ color:'#D4AF37' }}>{name}.</span></>
              : <>Find Projects. <span style={{ color:'#D4AF37' }}>Win Bids.</span></>}
          </h1>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.45)', margin:0, lineHeight:1.5 }}>
            Browse open tiling projects islandwide — submit your bid and get hired.
          </p>
        </div>

        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <a href="/jobs" style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#D4AF37', color:'#0c0804', borderRadius:10, padding:'10px 20px', fontSize:13, fontWeight:800, textDecoration:'none', boxShadow:'0 4px 16px rgba(212,175,55,0.35)' }}>
            💼 All Open Jobs
          </a>
          <a href="/dashboard" style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.1)', color:'#fff', border:'1.5px solid rgba(255,255,255,0.2)', borderRadius:10, padding:'10px 16px', fontSize:13, fontWeight:600, textDecoration:'none' }}>
            📊 Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}

function ProviderActions() {
  const ACTIONS = [
    { icon:'✏️', label:'My Profile',  sub:'Edit listing',      href:'/dashboard',  bg:'#eef2fb', ibg:'rgba(26,43,74,0.12)'   },
    { icon:'📋', label:'My Listing',  sub:'Status & bids',     href:'/dashboard',  bg:'#fffbeb', ibg:'rgba(245,158,11,0.14)' },
    { icon:'📐', label:'Estimator',   sub:'Cost calculator',   href:'/estimator',  bg:'#fff4f0', ibg:'rgba(224,90,43,0.12)'  },
    { icon:'💼', label:'All Jobs',    sub:'Full project board', href:'/jobs',       bg:'#f0fdf4', ibg:'rgba(22,163,74,0.14)'  },
  ]
  return <QuickActionsGrid actions={ACTIONS} />
}

// ─── PROVIDER PROJECTS FEED ───────────────────────────────────────

function ProviderProjectsFeed() {
  const [projects,  setProjects]  = useState([])
  const [bidCounts, setBidCounts] = useState({})
  const [total,     setTotal]     = useState(0)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      const { data, count } = await supabase
        .from('projects')
        .select('id,project_type,city,district,description,budget_range,created_at', { count:'exact' })
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6)

      if (data?.length) {
        setProjects(data)
        setTotal(count || 0)
        const { data: bids } = await supabase
          .from('bids')
          .select('project_id')
          .in('project_id', data.map(p => p.id))
        const counts = {}
        bids?.forEach(b => { counts[b.project_id] = (counts[b.project_id] || 0) + 1 })
        setBidCounts(counts)
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div style={{ background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>

      {/* Section header */}
      <div style={{ maxWidth:860, margin:'0 auto', padding:'16px 16px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>Open Projects</span>
          {total > 0 && (
            <span style={{ fontSize:11, fontWeight:700, color:'#D4AF37', background:'rgba(212,175,55,0.12)', border:'1px solid rgba(212,175,55,0.25)', borderRadius:20, padding:'2px 8px' }}>
              {total} active
            </span>
          )}
        </div>
        <a href="/jobs" style={{ fontSize:12, fontWeight:600, color:'#1B3A6B', textDecoration:'none' }}>See all →</a>
      </div>

      {/* Project cards */}
      <div style={{ maxWidth:860, margin:'0 auto', padding:'10px 16px 16px', display:'flex', flexDirection:'column', gap:8 }}>

        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ background:'#fff', borderRadius:12, border:'1px solid #e2e8f0', padding:'14px 16px', display:'flex', gap:12, alignItems:'center' }}>
                <div style={{ width:44, height:44, borderRadius:12, background:'#f1f5f9', flexShrink:0 }} />
                <div style={{ flex:1, display:'flex', flexDirection:'column', gap:7 }}>
                  <div style={{ height:12, background:'#f1f5f9', borderRadius:6, width:'35%' }} />
                  <div style={{ height:10, background:'#f1f5f9', borderRadius:6, width:'65%' }} />
                </div>
                <div style={{ width:52, height:34, borderRadius:10, background:'#f1f5f9', flexShrink:0 }} />
              </div>
            ))
          : projects.map(p => {
              const icon  = TYPE_ICONS[p.project_type]  || '🏠'
              const color = TYPE_COLORS[p.project_type] || '#1B3A6B'
              const bids  = bidCounts[p.id] || 0
              const excerpt = p.description?.length > 100
                ? p.description.slice(0, 100) + '…'
                : p.description

              return (
                <a key={p.id} href={`/job?id=${p.id}`}
                  style={{ display:'flex', alignItems:'center', gap:12, background:'#fff', borderRadius:12, border:'1px solid #e2e8f0', padding:'14px 16px', textDecoration:'none', color:'inherit', transition:'box-shadow 0.15s,border-color 0.15s' }}
                  onMouseOver={e => { e.currentTarget.style.boxShadow='0 4px 14px rgba(0,0,0,0.07)'; e.currentTarget.style.borderColor='#cbd5e1' }}
                  onMouseOut={e  => { e.currentTarget.style.boxShadow=''; e.currentTarget.style.borderColor='#e2e8f0' }}
                >
                  {/* type icon */}
                  <div style={{ width:44, height:44, borderRadius:12, background:`${color}12`, border:`1.5px solid ${color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{icon}</div>

                  {/* details */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{p.project_type}</span>
                      <span style={{ fontSize:11, color:'#94a3b8' }}>·</span>
                      <span style={{ fontSize:11, color:'#64748b' }}>📍 {p.city}{p.district && p.district !== p.city ? `, ${p.district}` : ''}</span>
                      <span style={{ fontSize:11, color:'#94a3b8', marginLeft:'auto', whiteSpace:'nowrap' }}>{timeAgo(p.created_at)}</span>
                    </div>
                    {excerpt && (
                      <p style={{ fontSize:12, color:'#64748b', margin:'0 0 6px', lineHeight:1.5, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{excerpt}</p>
                    )}
                    <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                      {p.budget_range && (
                        <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:'#f0fdf4', color:'#15803d', fontWeight:600, border:'1px solid #bbf7d0' }}>💰 {p.budget_range}</span>
                      )}
                      {bids > 0 && (
                        <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:'#eff6ff', color:'#1d4ed8', fontWeight:600, border:'1px solid #bfdbfe' }}>💬 {bids} bid{bids !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>

                  {/* bid CTA */}
                  <div style={{ flexShrink:0, background:'#E05A2B', color:'#fff', borderRadius:10, padding:'8px 14px', fontSize:12, fontWeight:700 }}>
                    Bid →
                  </div>
                </a>
              )
            })
        }

        {!loading && projects.length === 0 && (
          <div style={{ textAlign:'center', padding:'28px 16px', color:'#94a3b8', fontSize:13 }}>
            No active projects right now — check back soon.
          </div>
        )}

        {!loading && projects.length > 0 && (
          <a href="/jobs" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'12px', borderRadius:12, border:'1.5px dashed #cbd5e1', color:'#64748b', fontSize:13, fontWeight:600, textDecoration:'none', background:'transparent', transition:'border-color 0.15s,color 0.15s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor='#1B3A6B'; e.currentTarget.style.color='#1B3A6B' }}
            onMouseOut={e  => { e.currentTarget.style.borderColor='#cbd5e1'; e.currentTarget.style.color='#64748b' }}
          >
            💼 View all {total} open jobs →
          </a>
        )}
      </div>
    </div>
  )
}

// ─── GUEST / CONSUMER HERO ────────────────────────────────────────

function GuestHero({ heroImg }) {
  function doSearch() {
    const v = document.getElementById('hero-search-r')?.value || ''
    document.location = '/providers?q=' + encodeURIComponent(v)
  }

  return (
    <div style={{ position:'relative', minHeight:360, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', padding:'52px 20px 48px', background:'#0a121f' }}>
      <img src={heroImg} alt="" width="1400" height="800"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center', opacity:0.22 }}
        loading="eager" fetchpriority="high" decoding="sync"
      />
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(160deg,rgba(10,18,31,0.75) 0%,rgba(26,43,74,0.6) 100%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', inset:0, opacity:0.035, backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.8) 39px,rgba(255,255,255,0.8) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.8) 39px,rgba(255,255,255,0.8) 40px)', pointerEvents:'none' }} />

      <div style={{ position:'relative', textAlign:'center', maxWidth:580, width:'100%' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:20, padding:'5px 16px', marginBottom:16 }}>
          <span style={{ fontSize:9, fontWeight:700, color:'#F59E0B', letterSpacing:'2.5px', textTransform:'uppercase' }}>🇱🇰 Sri Lanka's Tile & Bathroom Marketplace</span>
        </div>

        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(24px,5vw,44px)', fontWeight:700, color:'#fff', lineHeight:1.15, marginBottom:12 }}>
          Post. Get Bids.<br /><span style={{ color:'#F59E0B' }}>Build with Confidence.</span>
        </h1>

        <p style={{ fontSize:'clamp(12px,1.8vw,14px)', color:'rgba(255,255,255,0.6)', marginBottom:22, lineHeight:1.8 }}>
          Post free — verified tilers bid, you compare and choose.
        </p>

        {/* Search */}
        <div style={{ position:'relative', maxWidth:480, margin:'0 auto 18px' }}>
          <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:17, pointerEvents:'none', zIndex:1 }}>🔍</span>
          <input id="hero-search-r" type="text" placeholder="Search tilers, services, locations…"
            style={{ width:'100%', height:48, padding:'0 108px 0 44px', border:'none', borderRadius:12, fontSize:13, fontFamily:'inherit', outline:'none', background:'rgba(255,255,255,0.96)', color:'#0f172a', boxShadow:'0 8px 32px rgba(0,0,0,0.3)' }}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
          />
          <button onClick={doSearch}
            style={{ position:'absolute', right:5, top:5, bottom:5, padding:'0 16px', background:'#E05A2B', color:'#fff', border:'none', borderRadius:9, fontSize:13, fontWeight:700, cursor:'pointer' }}>
            Search
          </button>
        </div>

        {/* CTAs */}
        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          <a href="/post-project" style={{ display:'inline-flex', alignItems:'center', gap:7, background:'#E05A2B', color:'#fff', borderRadius:12, padding:'12px 24px', fontSize:14, fontWeight:700, textDecoration:'none', boxShadow:'0 4px 20px rgba(224,90,43,0.45)' }}>
            📋 Post a Project
          </a>
          <a href="/providers?type=tiler" style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(255,255,255,0.12)', color:'#fff', border:'1.5px solid rgba(255,255,255,0.3)', borderRadius:12, padding:'12px 20px', fontSize:13, fontWeight:600, textDecoration:'none' }}>
            👷 Find Tilers
          </a>
          <a href="/jobs" style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(255,255,255,0.12)', color:'#fff', border:'1.5px solid rgba(255,255,255,0.3)', borderRadius:12, padding:'12px 20px', fontSize:13, fontWeight:600, textDecoration:'none' }}>
            💼 Browse Projects
          </a>
        </div>
      </div>
    </div>
  )
}

function GuestActions() {
  return (
    <div style={{ background:'#fff', padding:'16px', borderBottom:'1px solid #E5E7EB' }}>
      {/* Two primary action cards */}
      <div style={{ maxWidth:560, margin:'0 auto 12px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <a href="/post-project"
          style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'22px 16px', borderRadius:16, textDecoration:'none', background:'linear-gradient(135deg,#E05A2B 0%,#c94d22 100%)', boxShadow:'0 4px 20px rgba(224,90,43,0.32)', transition:'transform 0.15s,box-shadow 0.15s' }}
          onMouseOver={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(224,90,43,0.4)' }}
          onMouseOut={e  => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 4px 20px rgba(224,90,43,0.32)' }}
        >
          <span style={{ fontSize:30 }}>📋</span>
          <div style={{ fontSize:14, fontWeight:800, color:'#fff', textAlign:'center', lineHeight:1.2 }}>Post a Project</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.75)', textAlign:'center', lineHeight:1.4 }}>Free — verified tilers bid, you choose</div>
          <div style={{ fontSize:12, fontWeight:700, color:'#fff', background:'rgba(255,255,255,0.2)', borderRadius:20, padding:'5px 14px', marginTop:2 }}>Start Free →</div>
        </a>

        <a href="/providers?type=tiler"
          style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'22px 16px', borderRadius:16, textDecoration:'none', background:'linear-gradient(135deg,#0F1E35 0%,#1A2B4A 100%)', boxShadow:'0 4px 20px rgba(15,30,53,0.25)', transition:'transform 0.15s,box-shadow 0.15s' }}
          onMouseOver={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(15,30,53,0.35)' }}
          onMouseOut={e  => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 4px 20px rgba(15,30,53,0.25)' }}
        >
          <span style={{ fontSize:30 }}>👷</span>
          <div style={{ fontSize:14, fontWeight:800, color:'#fff', textAlign:'center', lineHeight:1.2 }}>Find Tilers</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)', textAlign:'center', lineHeight:1.4 }}>Browse islandwide professionals</div>
          <div style={{ fontSize:12, fontWeight:700, color:'#D4AF37', background:'rgba(212,175,55,0.15)', borderRadius:20, padding:'5px 14px', marginTop:2, border:'1px solid rgba(212,175,55,0.3)' }}>Browse All →</div>
        </a>
      </div>

      {/* Secondary quick links */}
      <div style={{ maxWidth:560, margin:'0 auto', display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
        <a href="/jobs"      style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'8px 14px', borderRadius:10, fontSize:12, fontWeight:600, color:'#64748b', background:'#f8fafc', border:'1px solid #e2e8f0', textDecoration:'none' }}>💼 Browse Projects</a>
        <a href="/estimator" style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'8px 14px', borderRadius:10, fontSize:12, fontWeight:600, color:'#64748b', background:'#f8fafc', border:'1px solid #e2e8f0', textDecoration:'none' }}>📐 Estimator</a>
        <a href="/providers" style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'8px 14px', borderRadius:10, fontSize:12, fontWeight:600, color:'#64748b', background:'#f8fafc', border:'1px solid #e2e8f0', textDecoration:'none' }}>🔍 All Providers</a>
      </div>
    </div>
  )
}

// ─── GUEST PROVIDERS PREVIEW ──────────────────────────────────────

function GuestProvidersPreview() {
  const [tilers,  setTilers]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('tilers')
      .select('id,full_name,slug,city,is_verified,avg_rating,experience_years')
      .eq('featured', true)
      .order('avg_rating', { ascending: false })
      .limit(8)
      .then(({ data }) => { setTilers(data || []); setLoading(false) })
  }, [])

  return (
    <div style={{ background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>

      {/* Header */}
      <div style={{ maxWidth:860, margin:'0 auto', padding:'16px 16px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>Featured Tilers</span>
        <a href="/providers?type=tiler" style={{ fontSize:12, fontWeight:600, color:'#1B3A6B', textDecoration:'none' }}>View all →</a>
      </div>

      {/* Horizontal scrollable cards */}
      <div style={{ overflowX:'auto', padding:'10px 16px 16px', display:'flex', gap:10, scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }}>

        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ width:158, flexShrink:0, background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', padding:'16px 14px', display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:'#f1f5f9' }} />
                <div style={{ height:12, background:'#f1f5f9', borderRadius:6, width:'75%' }} />
                <div style={{ height:10, background:'#f1f5f9', borderRadius:6, width:'55%' }} />
                <div style={{ height:10, background:'#f1f5f9', borderRadius:6, width:'40%' }} />
              </div>
            ))
          : tilers.map(t => (
              <a key={t.id} href={`/tilers/${t.slug || t.id}`}
                style={{ width:158, flexShrink:0, background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', padding:'16px 14px', textDecoration:'none', color:'inherit', display:'flex', flexDirection:'column', gap:6, transition:'box-shadow 0.15s,border-color 0.15s' }}
                onMouseOver={e => { e.currentTarget.style.boxShadow='0 4px 14px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor='#cbd5e1' }}
                onMouseOut={e  => { e.currentTarget.style.boxShadow=''; e.currentTarget.style.borderColor='#e2e8f0' }}
              >
                <div style={{ width:44, height:44, borderRadius:12, background:'#eef2fb', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>👷</div>

                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#0f172a', lineHeight:1.2, marginBottom:3 }}>{t.full_name}</div>
                  <div style={{ fontSize:11, color:'#64748b' }}>📍 {t.city}</div>
                </div>

                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                  {t.is_verified && (
                    <span style={{ fontSize:9, fontWeight:700, color:'#0369a1', background:'#e0f2fe', borderRadius:20, padding:'2px 7px', border:'1px solid #bae6fd' }}>✓ Verified</span>
                  )}
                  {t.experience_years > 0 && (
                    <span style={{ fontSize:9, fontWeight:600, color:'#64748b', background:'#f1f5f9', borderRadius:20, padding:'2px 7px' }}>{t.experience_years}+ yrs</span>
                  )}
                </div>

                {t.avg_rating > 0 && (
                  <div style={{ fontSize:11, color:'#F59E0B', fontWeight:600 }}>
                    ⭐ {t.avg_rating.toFixed(1)}
                  </div>
                )}

                <div style={{ marginTop:'auto', paddingTop:4, fontSize:11, fontWeight:700, color:'#E05A2B' }}>View Profile →</div>
              </a>
            ))
        }

        {/* View more card */}
        {!loading && (
          <a href="/providers?type=tiler"
            style={{ width:140, flexShrink:0, background:'transparent', borderRadius:14, border:'1.5px dashed #cbd5e1', padding:'16px 14px', textDecoration:'none', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}
            onMouseOver={e => e.currentTarget.style.borderColor='#1B3A6B'}
            onMouseOut={e  => e.currentTarget.style.borderColor='#cbd5e1'}
          >
            <div style={{ width:44, height:44, borderRadius:12, background:'#eef2fb', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🔍</div>
            <div style={{ fontSize:12, fontWeight:600, color:'#64748b', textAlign:'center', lineHeight:1.3 }}>View all tilers</div>
          </a>
        )}
      </div>
    </div>
  )
}

// ─── SHARED QUICK ACTIONS GRID ────────────────────────────────────

function QuickActionsGrid({ actions }) {
  return (
    <div style={{ background:'#fff', padding:'16px', borderBottom:'1px solid #E5E7EB' }}>
      <div style={{ maxWidth:480, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
        {actions.map(a => (
          <a key={a.href + a.label} href={a.href}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'14px 6px 12px', borderRadius:14, textDecoration:'none', color:'inherit', background:a.bg, border:'1.5px solid transparent', transition:'transform 0.15s, box-shadow 0.15s' }}
            onMouseOver={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)' }}
            onMouseOut={e  => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}
          >
            <div style={{ width:44, height:44, borderRadius:12, background:a.ibg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, marginBottom:2 }}>{a.icon}</div>
            <div style={{ fontSize:11, fontWeight:700, color:'#111827', lineHeight:1.2, textAlign:'center' }}>{a.label}</div>
            <div style={{ fontSize:9, color:'#9CA3AF', lineHeight:1.2, textAlign:'center' }}>{a.sub}</div>
          </a>
        ))}
      </div>
    </div>
  )
}
