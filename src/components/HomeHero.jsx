import { useState, useEffect } from 'react'
import { supabase, getUser, phoneVariants } from '../lib/supabase.js'
import { jobPath, shortDate } from '../lib/jobs.js'

const CACHE_KEY = 'tilershub_role'
const NAME_KEY  = 'tilershub_pname'

const TYPE_ICONS = {
  'Floor Tiling':'🪨','Bathroom Tiling':'🚿','Bathroom Renovation':'🛁',
  'Granite Works':'💎','Tile Cutting':'✂️','Routering':'🔧',
  'Waterproofing':'💧','Tile Shop Inquiry':'🏪',
}
const TYPE_COLORS = {
  'Floor Tiling':'#C2542B','Bathroom Tiling':'#C2542B','Bathroom Renovation':'#C2542B',
  'Granite Works':'#8E3C1E','Tile Cutting':'#C2542B','Routering':'#C2542B',
  'Waterproofing':'#2F6B4F','Tile Shop Inquiry':'#C2542B',
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000)
  if (diff < 60)     return 'දැන්ම'
  if (diff < 3600)   return `${Math.floor(diff / 60)}මිනි`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}පැය`
  if (diff < 604800) return `${Math.floor(diff / 86400)}දින`
  return shortDate(ts)
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

  // Show/hide the static guest hero based on auth state
  useEffect(() => {
    const el = document.getElementById('homeowner-home')
    if (el) el.style.display = role === 'provider' ? 'none' : ''
  }, [role])

  // Guest view — static HTML in index.astro handles the display
  if (role !== 'provider') return null

  return <><ProviderHero name={providerName} /><ProviderActions /><ProviderProjectsFeed /></>
}

// ─── PROVIDER HERO ────────────────────────────────────────────────

function ProviderHero({ name }) {
  const [stats, setStats] = useState({ bids: '—' })

  useEffect(() => {
    getUser().then(async u => {
      if (!u) return
      const [{ data: t }, { data: p }] = await Promise.all([
        supabase.from('tilers').select('phone').eq('user_id', u.id).maybeSingle(),
        supabase.from('providers').select('whatsapp,phone').eq('user_id', u.id).maybeSingle(),
      ])

      // Bids carry no account reference — count them by the provider's
      // WhatsApp number in any format it may have been stored in.
      const since = new Date(Date.now() - 30 * 86400000).toISOString()
      const variants = [...new Set(
        [p?.whatsapp, p?.phone, t?.phone, u.phone].filter(Boolean).flatMap(n => phoneVariants(n))
      )]
      let bidCount = 0
      if (variants.length > 0) {
        const { count } = await supabase
          .from('bids').select('id', { count: 'exact', head: true })
          .in('bidder_whatsapp', variants).gte('created_at', since)
        bidCount = count ?? 0
      }

      setStats({ bids: String(bidCount) })
    })
  }, [])

  return (
    <div style={{ position:'relative', overflow:'hidden', padding:'24px 20px 20px', background:'linear-gradient(135deg,#14171A 0%,#14171A 100%)' }}>
      <div style={{ position:'absolute', inset:0, opacity:0.035, backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.8) 39px,rgba(255,255,255,0.8) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.8) 39px,rgba(255,255,255,0.8) 40px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:'-60px', left:'50%', transform:'translateX(-50%)', width:500, height:260, background:'radial-gradient(ellipse,rgba(96,165,250,0.09) 0%,transparent 70%)', pointerEvents:'none' }} />

      <div style={{ position:'relative', maxWidth:860, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
        <div>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.45)', margin:'0 0 4px', letterSpacing:0.5 }}>👋 නැවත සාදරයෙන් පිළිගනිමු</p>
          <h1 style={{ fontFamily:"var(--th-display)", fontSize:'clamp(20px,4vw,30px)', fontWeight:700, color:'#fff', lineHeight:1.2, margin:'0 0 12px' }}>
            හෙලෝ, <span style={{ color:'#E08A5F' }}>{name || 'ඔබ'}.</span>
          </h1>

          {/* KPI chips */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <div style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'6px 14px', minWidth:80 }}>
              <div style={{ fontSize:18, fontWeight:800, color:'#E08A5F', lineHeight:1.2 }}>{stats.bids}</div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:1, marginTop:1 }}>ක්‍රි. ලංසු</div>
            </div>
          </div>
        </div>

        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <a href="/jobs" style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#E08A5F', color:'#14171A', borderRadius:10, padding:'10px 20px', fontSize:13, fontWeight:800, textDecoration:'none', boxShadow:'0 4px 16px rgba(96,165,250,0.35)' }}>
            💼 විවෘත ව්‍යාපෘති
          </a>
          <a href="/dashboard" style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.1)', color:'#fff', border:'1.5px solid rgba(255,255,255,0.2)', borderRadius:10, padding:'10px 16px', fontSize:13, fontWeight:600, textDecoration:'none' }}>
            📊 උපකරණ පුවරුව
          </a>
        </div>
      </div>
    </div>
  )
}

function ProviderActions() {
  const ACTIONS = [
    { icon:'✏️', label:'මගේ පැතිකඩ',  sub:'ලිස්ටිං සංස්කරණය',      href:'/dashboard',  bg:'#F7EFE9', ibg:'rgba(20,23,26,0.12)'   },
    { icon:'📋', label:'මගේ ලිස්ටිං',  sub:'තත්ත්වය සහ ලංසු',     href:'/dashboard',  bg:'#F7EFE9', ibg:'rgba(194,84,43,0.14)' },
    { icon:'📐', label:'ගණනය',   sub:'පිරිවැය ගණනය',   href:'/estimator',  bg:'#F7EFE9', ibg:'rgba(194,84,43,0.12)'  },
    { icon:'💼', label:'සියලු ව්‍යාපෘති',    sub:'සම්පූර්ණ ව්‍යාපෘති', href:'/jobs',       bg:'#E9F1EC', ibg:'rgba(22,163,74,0.14)'  },
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
          .select('job_id')
          .in('job_id', data.map(p => p.id))
        const counts = {}
        bids?.forEach(b => { counts[b.job_id] = (counts[b.job_id] || 0) + 1 })
        setBidCounts(counts)
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div style={{ background:'#FBFAF8', borderBottom:'1px solid #E4E0D9' }}>

      <div style={{ maxWidth:860, margin:'0 auto', padding:'16px 16px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:14, fontWeight:700, color:'#14171A' }}>විවෘත ව්‍යාපෘති</span>
          {total > 0 && (
            <span style={{ fontSize:11, fontWeight:700, color:'#E08A5F', background:'rgba(96,165,250,0.12)', border:'1px solid rgba(96,165,250,0.25)', borderRadius:20, padding:'2px 8px' }}>
              {total} ක්‍රියාකාරී
            </span>
          )}
        </div>
        <a href="/jobs" style={{ fontSize:12, fontWeight:600, color:'#C2542B', textDecoration:'none' }}>සියල්ල බලන්න →</a>
      </div>

      <div style={{ maxWidth:860, margin:'0 auto', padding:'10px 16px 16px', display:'flex', flexDirection:'column', gap:8 }}>

        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ background:'#fff', borderRadius:12, border:'1px solid #E4E0D9', padding:'14px 16px', display:'flex', gap:12, alignItems:'center' }}>
                <div style={{ width:44, height:44, borderRadius:12, background:'#EFEBE4', flexShrink:0 }} />
                <div style={{ flex:1, display:'flex', flexDirection:'column', gap:7 }}>
                  <div style={{ height:12, background:'#EFEBE4', borderRadius:6, width:'35%' }} />
                  <div style={{ height:10, background:'#EFEBE4', borderRadius:6, width:'65%' }} />
                </div>
                <div style={{ width:52, height:34, borderRadius:10, background:'#EFEBE4', flexShrink:0 }} />
              </div>
            ))
          : projects.map(p => {
              const icon  = TYPE_ICONS[p.project_type]  || '🏠'
              const color = TYPE_COLORS[p.project_type] || '#C2542B'
              const bids  = bidCounts[p.id] || 0
              const excerpt = p.description?.length > 100
                ? p.description.slice(0, 100) + '…'
                : p.description

              return (
                <a key={p.id} href={jobPath(p)}
                  style={{ display:'flex', alignItems:'center', gap:12, background:'#fff', borderRadius:12, border:'1px solid #E4E0D9', padding:'14px 16px', textDecoration:'none', color:'inherit', transition:'box-shadow 0.15s,border-color 0.15s' }}
                  onMouseOver={e => { e.currentTarget.style.boxShadow='0 4px 14px rgba(0,0,0,0.07)'; e.currentTarget.style.borderColor='#D6D0C6' }}
                  onMouseOut={e  => { e.currentTarget.style.boxShadow=''; e.currentTarget.style.borderColor='#E4E0D9' }}
                >
                  <div style={{ width:44, height:44, borderRadius:12, background:`${color}12`, border:`1.5px solid ${color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{icon}</div>

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:'#14171A' }}>{p.project_type}</span>
                      <span style={{ fontSize:11, color:'#8A8F95' }}>·</span>
                      <span style={{ fontSize:11, color:'#6B7076' }}>📍 {p.city}{p.district && p.district !== p.city ? `, ${p.district}` : ''}</span>
                      <span style={{ fontSize:11, color:'#8A8F95', marginLeft:'auto', whiteSpace:'nowrap' }}>{timeAgo(p.created_at)}</span>
                    </div>
                    {excerpt && (
                      <p style={{ fontSize:12, color:'#6B7076', margin:'0 0 6px', lineHeight:1.5, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{excerpt}</p>
                    )}
                    <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                      {p.budget_range && (
                        <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:'#E9F1EC', color:'#285C43', fontWeight:600, border:'1px solid #C6DDCF' }}>💰 {p.budget_range}</span>
                      )}
                      {bids > 0 && (
                        <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:'#F7EFE9', color:'#8E3C1E', fontWeight:600, border:'1px solid #E7D9CE' }}>💬 {bids} ලංසු</span>
                      )}
                    </div>
                  </div>

                  <div style={{ flexShrink:0, background:'#C2542B', color:'#fff', borderRadius:10, padding:'8px 14px', fontSize:12, fontWeight:700 }}>
                    ලංසු →
                  </div>
                </a>
              )
            })
        }

        {!loading && projects.length === 0 && (
          <div style={{ textAlign:'center', padding:'28px 16px', color:'#8A8F95', fontSize:13 }}>
            දැනට ක්‍රියාකාරී ව්‍යාපෘති නොමැත — ශීඝ්‍රයෙන් නැවත පරීක්ෂා කරන්න.
          </div>
        )}

        {!loading && projects.length > 0 && (
          <a href="/jobs" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'12px', borderRadius:12, border:'1.5px dashed #D6D0C6', color:'#6B7076', fontSize:13, fontWeight:600, textDecoration:'none', background:'transparent', transition:'border-color 0.15s,color 0.15s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor='#C2542B'; e.currentTarget.style.color='#C2542B' }}
            onMouseOut={e  => { e.currentTarget.style.borderColor='#D6D0C6'; e.currentTarget.style.color='#6B7076' }}
          >
            💼 සියලු {total} ව්‍යාපෘති බලන්න →
          </a>
        )}
      </div>
    </div>
  )
}

// ─── GUEST / CONSUMER HERO ────────────────────────────────────────

function GuestHero({ heroImg }) {
  return (
    <div style={{ position:'relative', minHeight:320, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', padding:'44px 20px 40px', background:'#14171A' }}>
      <img src={heroImg} alt="" width="1400" height="800"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 30%', opacity:0.32 }}
        loading="eager" fetchpriority="high" decoding="sync"
      />
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(175deg,rgba(20,23,26,0.72) 0%,rgba(20,35,65,0.68) 100%)', pointerEvents:'none' }} />

      <div style={{ position:'relative', textAlign:'center', maxWidth:520, width:'100%' }}>
        <h1 style={{ fontFamily:"var(--th-display)", fontSize:'clamp(26px,5.5vw,42px)', fontWeight:700, color:'#fff', lineHeight:1.15, marginBottom:10 }}>
          ඔබේ ව්‍යාපෘතිය පලකරන්න,<br /><span style={{ color:'#F59E0B' }}>නොමිලේ ලංසු ලබා ගන්න.</span>
        </h1>

        <p style={{ fontSize:13, color:'rgba(255,255,255,0.62)', marginBottom:22, lineHeight:1.7 }}>
          ලොගිනය අවශ්‍ය නැත · සත්‍යාපිත ප්‍රවීණයන් පැය 24 ක් ඇතුළත ලංසු දෙති
        </p>

        {/* Single primary CTA */}
        <a href="/post-project" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'#C2542B', color:'#fff', borderRadius:24, padding:'14px 28px', fontSize:15, fontWeight:800, textDecoration:'none', boxShadow:'0 4px 20px rgba(194,84,43,0.45)', marginBottom:14 }}>
          📋 නොමිලේ ව්‍යාපෘතිය පලකරන්න
        </a>

        <div style={{ marginBottom:14 }}>
          <a href="/providers" style={{ fontSize:12, color:'rgba(255,255,255,0.45)', textDecoration:'none', fontWeight:600 }}>හෝ සේවා සපයන්නන් බලන්න →</a>
        </div>

        {/* Benefit pills */}
        <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
          {['✓ පලකිරීම නොමිලේ','✓ බහු ලංසු','✓ බැඳීමක් නැත'].map(t => (
            <span key={t} style={{ background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.78)', borderRadius:20, padding:'5px 13px', fontSize:11, fontWeight:600, border:'1px solid rgba(255,255,255,0.15)' }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── POPULAR SERVICES (4×2 icon grid) ────────────────────────────

function GuestActions() {
  const SERVICES = [
    { icon:'🚿', label:'නාන කාමර\nනල කාර්ය',   href:'/providers?q=Bathroom+Plumbing'   },
    { icon:'🪨', label:'බිම්\nටයිල්',         href:'/providers?q=Floor+Tiling'         },
    { icon:'🏗️', label:'විශාල\nටයිල්',          href:'/providers?q=Large+Tiling'          },
    { icon:'🔷', label:'මොසෙයික්\nටයිල්',         href:'/providers?q=Mosaic+Tiling'         },
    { icon:'🚿', label:'ෂවර්\nඅළු.',         href:'/providers?q=Shower+Repair'         },
    { icon:'🪟', label:'වීදුරු\nටයිල්',          href:'/providers?q=Glass+Tiling'          },
    { icon:'🛁', label:'නාන කාමර\nප්‍රතිසංස්.',   href:'/providers?q=Bathroom+Renovation'   },
    { icon:'🪞', label:'වැනිටි\nකබඩ්',       href:'/providers?q=Vanity+Cupboard'       },
  ]
  return (
    <div style={{ background:'#fff', borderBottom:'1px solid #EFEBE4', padding:'16px 16px 12px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <span style={{ fontSize:15, fontWeight:700, color:'#14171A' }}>ජනප්‍රිය සේවාවන්</span>
        <a href="/providers" style={{ fontSize:12, fontWeight:600, color:'#C2542B', textDecoration:'none' }}>සියල්ල &rsaquo;</a>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
        {SERVICES.map(s => (
          <a key={s.href} href={s.href}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:7, padding:'12px 4px 10px', borderRadius:14, background:'#FBFAF8', textDecoration:'none', border:'1px solid #EFEBE4', transition:'background 0.15s' }}
            onMouseOver={e => e.currentTarget.style.background='#F7EFE9'}
            onMouseOut={e  => e.currentTarget.style.background='#FBFAF8'}
          >
            <div style={{ width:46, height:46, borderRadius:13, background:'#fff', border:'1px solid #E4E0D9', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{s.icon}</div>
            <span style={{ fontSize:10, fontWeight:600, color:'#3A4046', textAlign:'center', lineHeight:1.35, whiteSpace:'pre-line' }}>{s.label}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

// ─── SHARED QUICK ACTIONS GRID ────────────────────────────────────

function QuickActionsGrid({ actions }) {
  return (
    <div style={{ background:'#fff', padding:'4px 16px 16px', borderBottom:'1px solid #E5E7EB' }}>
      <div style={{ maxWidth:480, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
        {actions.map(a => (
          <a key={a.href + a.label} href={a.href}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'14px 6px 12px', borderRadius:14, textDecoration:'none', color:'inherit', background:a.bg, border:'1.5px solid transparent', transition:'transform 0.15s, box-shadow 0.15s' }}
            onMouseOver={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)' }}
            onMouseOut={e  => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}
          >
            <div style={{ width:44, height:44, borderRadius:12, background:a.ibg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, marginBottom:2 }}>{a.icon}</div>
            <div style={{ fontSize:11, fontWeight:700, color:'#14171A', lineHeight:1.2, textAlign:'center' }}>{a.label}</div>
            <div style={{ fontSize:9, color:'#9CA3AF', lineHeight:1.2, textAlign:'center' }}>{a.sub}</div>
          </a>
        ))}
      </div>
    </div>
  )
}
