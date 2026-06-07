import { useState, useEffect } from 'react'
import { supabase, getUser } from '../lib/supabase.js'

const CACHE_KEY = 'tilershub_role'      // 'provider' | '' (guest)
const NAME_KEY  = 'tilershub_pname'

export default function HomeHero({ heroImg }) {
  // Read cache immediately so there's no layout shift on return visits
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
    ? <><ProviderHero name={providerName} /><ProviderActions /></>
    : <><GuestHero heroImg={heroImg} /><GuestActions /></>
}

// ─── PROVIDER HERO ────────────────────────────────────────────────

function ProviderHero({ name }) {
  return (
    <div style={{ position:'relative', minHeight:320, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', padding:'44px 20px 40px', background:'linear-gradient(135deg,#0F1E35 0%,#1A2B4A 100%)' }}>
      {/* grid overlay */}
      <div style={{ position:'absolute', inset:0, opacity:0.035, backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.8) 39px,rgba(255,255,255,0.8) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.8) 39px,rgba(255,255,255,0.8) 40px)', pointerEvents:'none' }} />
      {/* glow */}
      <div style={{ position:'absolute', top:'-80px', left:'50%', transform:'translateX(-50%)', width:600, height:400, background:'radial-gradient(ellipse,rgba(212,175,55,0.09) 0%,transparent 70%)', pointerEvents:'none' }} />

      <div style={{ position:'relative', textAlign:'center', maxWidth:580, width:'100%' }}>
        {/* eyebrow */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.22)', borderRadius:20, padding:'5px 16px', marginBottom:16 }}>
          <span style={{ fontSize:9, fontWeight:700, color:'#D4AF37', letterSpacing:'2.5px', textTransform:'uppercase' }}>👷 Provider Portal</span>
        </div>

        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(22px,4.5vw,40px)', fontWeight:700, color:'#fff', lineHeight:1.15, marginBottom:12 }}>
          {name ? <>Welcome back,<br /><span style={{ color:'#D4AF37' }}>{name}.</span></> : <>Find Projects.<br /><span style={{ color:'#D4AF37' }}>Grow Your Business.</span></>}
        </h1>

        <p style={{ fontSize:'clamp(12px,1.6vw,14px)', color:'rgba(255,255,255,0.55)', marginBottom:24, lineHeight:1.8 }}>
          Browse open tiling projects islandwide — submit your bid and get hired.
        </p>

        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          <a href="/jobs" style={{ display:'inline-flex', alignItems:'center', gap:7, background:'#D4AF37', color:'#0c0804', borderRadius:12, padding:'12px 24px', fontSize:14, fontWeight:800, textDecoration:'none', boxShadow:'0 4px 20px rgba(212,175,55,0.35)' }}>
            💼 Browse Open Jobs
          </a>
          <a href="/dashboard" style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(255,255,255,0.1)', color:'#fff', border:'1.5px solid rgba(255,255,255,0.25)', borderRadius:12, padding:'12px 20px', fontSize:13, fontWeight:600, textDecoration:'none' }}>
            📊 My Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}

function ProviderActions() {
  const ACTIONS = [
    { icon:'💼', label:'Browse Jobs',  sub:'Find open projects', href:'/jobs',       bg:'#f0fdf4', ibg:'rgba(22,163,74,0.14)'   },
    { icon:'✏️', label:'My Profile',   sub:'Edit your listing', href:'/dashboard',   bg:'#eef2fb', ibg:'rgba(26,43,74,0.12)'    },
    { icon:'📋', label:'My Listing',   sub:'Application status', href:'/dashboard',  bg:'#fffbeb', ibg:'rgba(245,158,11,0.14)'  },
    { icon:'📐', label:'Estimator',    sub:'Cost calculator',    href:'/estimator',  bg:'#fff4f0', ibg:'rgba(224,90,43,0.12)'   },
  ]
  return <QuickActionsGrid actions={ACTIONS} />
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
  const ACTIONS = [
    { icon:'📋', label:'Post Project',  sub:'Free, no login',   href:'/post-project',        bg:'#fff4f0', ibg:'rgba(224,90,43,0.14)'  },
    { icon:'👷', label:'Find Tilers',   sub:'Islandwide',       href:'/providers?type=tiler', bg:'#eef2fb', ibg:'rgba(26,43,74,0.12)'   },
    { icon:'💼', label:'Browse Jobs',   sub:'Active projects',  href:'/jobs',                 bg:'#fffbeb', ibg:'rgba(245,158,11,0.14)' },
    { icon:'📐', label:'Estimator',     sub:'Cost calculator',  href:'/estimator',            bg:'#f0fdf4', ibg:'rgba(22,163,74,0.13)'  },
  ]
  return <QuickActionsGrid actions={ACTIONS} />
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
