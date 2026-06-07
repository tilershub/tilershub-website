import { useState, useEffect, useCallback } from 'react'
import { supabase, signInWithOtp } from '../lib/supabase.js'

// ─── Design tokens ────────────────────────────────────────────────────────────
const NAVY  = '#1B3A6B'
const TERRA = '#E05A2B'
const S = {
  page:    { display: 'flex', minHeight: '100vh' },
  sidebar: { width: 220, background: NAVY, color: '#fff', flexShrink: 0, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' },
  main:    { flex: 1, padding: '28px 32px', overflowX: 'auto' },
  card:    { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20 },
  h2:      { fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 18, marginTop: 0 },
  badge:   (bg, color) => ({ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: bg, color }),
  btn:     (bg, color='#fff') => ({ padding: '6px 14px', background: bg, color, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }),
  th:      { fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #f1f5f9', whiteSpace: 'nowrap' },
  td:      { padding: '10px 12px', fontSize: 13, color: '#334155', borderBottom: '1px solid #f8fafc', verticalAlign: 'top' },
}

const STATUS_BADGE = {
  pending_review: ['#FEF3C7','#92400E'],
  approved:       ['#D1FAE5','#065F46'],
  listed:         ['#DBEAFE','#1E40AF'],
  rejected:       ['#FEE2E2','#991B1B'],
  active:         ['#D1FAE5','#065F46'],
  matched:        ['#EDE9FE','#5B21B6'],
  completed:      ['#F3F4F6','#374151'],
  pending_code:   ['#FEF3C7','#92400E'],
  verified:       ['#D1FAE5','#065F46'],
  new:            ['#FEF3C7','#92400E'],
  seen:           ['#F3F4F6','#374151'],
}

function StatusBadge({ status }) {
  const [bg, color] = STATUS_BADGE[status] || ['#f1f5f9','#64748b']
  return <span style={S.badge(bg, color)}>{status?.replace(/_/g,' ')}</span>
}

function timeAgo(ts) {
  if (!ts) return '—'
  const d = Math.floor((Date.now() - new Date(ts)) / 86400000)
  return d === 0 ? 'Today' : d === 1 ? '1 day ago' : `${d} days ago`
}

function Table({ heads, children, empty }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead><tr>{heads.map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
      {empty && <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8', fontSize: 13 }}>{empty}</div>}
    </div>
  )
}

function Pagination({ page, setPage, count, perPage }) {
  const total = Math.ceil(count / perPage)
  if (total <= 1) return null
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14, alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: '#64748b' }}>Page {page + 1} of {total}</span>
      <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={S.btn('#f1f5f9','#334155')}>← Prev</button>
      <button onClick={() => setPage(p => Math.min(total - 1, p + 1))} disabled={page >= total - 1} style={S.btn('#f1f5f9','#334155')}>Next →</button>
    </div>
  )
}

// ─── Sign-in screen ───────────────────────────────────────────────────────────
function SignIn() {
  const [email, setEmail] = useState('')
  const [sent, setSent]   = useState(false)
  const [err, setErr]     = useState('')
  const [loading, setLoading] = useState(false)

  async function send(e) {
    e.preventDefault()
    if (!email.includes('@')) { setErr('Enter a valid email'); return }
    setLoading(true); setErr('')
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } })
    setLoading(false)
    if (error) { setErr(error.message); return }
    setSent(true)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
      <div style={{ ...S.card, maxWidth: 380, width: '100%', textAlign: 'center', padding: 36 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🔐</div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>TilersHub Admin</h1>
        {sent ? (
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>Magic link sent to <strong>{email}</strong>. Click it to sign in.</p>
        ) : (
          <form onSubmit={send}>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErr('') }}
              placeholder="admin@email.com" autoFocus
              style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${err ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 10, fontSize: 13, outline: 'none', fontFamily: 'inherit', marginBottom: 10 }} />
            {err && <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 8 }}>⚠ {err}</p>}
            <button type="submit" disabled={loading}
              style={{ ...S.btn(loading ? '#94a3b8' : NAVY), width: '100%', padding: '11px' }}>
              {loading ? 'Sending…' : 'Send Magic Link →'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Overview tab ─────────────────────────────────────────────────────────────
function OverviewTab() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    Promise.all([
      supabase.from('provider_submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
      supabase.from('claim_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending_code'),
      supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('bids').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('projects').select('id', { count: 'exact', head: true }),
      supabase.from('provider_submissions').select('id', { count: 'exact', head: true }),
    ]).then(([pend, claims, activeProj, newBids, totalProj, totalSub]) => {
      setStats({
        pendingSubmissions: pend.count ?? 0,
        pendingClaims:      claims.count ?? 0,
        activeProjects:     activeProj.count ?? 0,
        newBids:            newBids.count ?? 0,
        totalProjects:      totalProj.count ?? 0,
        totalSubmissions:   totalSub.count ?? 0,
      })
    })
  }, [])

  const cards = stats ? [
    { label: 'Pending Submissions', value: stats.pendingSubmissions, color: stats.pendingSubmissions > 0 ? TERRA : '#64748b', emoji: '📝' },
    { label: 'Pending Claims',      value: stats.pendingClaims,      color: stats.pendingClaims > 0 ? '#f59e0b' : '#64748b', emoji: '📲' },
    { label: 'Active Projects',     value: stats.activeProjects,     color: '#16a34a', emoji: '📋' },
    { label: 'New Bids',            value: stats.newBids,            color: stats.newBids > 0 ? TERRA : '#64748b', emoji: '💬' },
    { label: 'Total Projects',      value: stats.totalProjects,      color: '#64748b', emoji: '📊' },
    { label: 'Total Submissions',   value: stats.totalSubmissions,   color: '#64748b', emoji: '👥' },
  ] : []

  return (
    <div>
      <h2 style={S.h2}>Overview</h2>
      {!stats ? <p style={{ color: '#94a3b8' }}>Loading…</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14 }}>
          {cards.map(c => (
            <div key={c.label} style={{ ...S.card, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{c.emoji}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: c.color }}>{c.value}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{c.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Submissions tab ──────────────────────────────────────────────────────────
function SubmissionsTab() {
  const [rows, setRows]       = useState([])
  const [filter, setFilter]   = useState('pending_review')
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(0)
  const [count, setCount]     = useState(0)
  const PER = 20

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('provider_submissions').select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PER, page * PER + PER - 1)
    if (filter !== 'all') q = q.eq('status', filter)
    const { data, count: c } = await q
    setRows(data || [])
    setCount(c || 0)
    setLoading(false)
  }, [filter, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(0) }, [filter])

  async function update(id, patch) {
    await supabase.from('provider_submissions').update(patch).eq('id', id)
    load()
  }

  const FILTERS = ['all','pending_review','approved','listed','rejected']

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <h2 style={{ ...S.h2, marginBottom: 0 }}>Provider Submissions</h2>
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ ...S.btn(filter === f ? NAVY : '#f1f5f9', filter === f ? '#fff' : '#334155') }}>
              {f === 'all' ? 'All' : f.replace(/_/g,' ')}
            </button>
          ))}
        </div>
      </div>
      {loading ? <p style={{ color: '#94a3b8' }}>Loading…</p> : (
        <>
          <div style={S.card}>
            <Table
              heads={['Name','City','Services','WhatsApp','Status','Applied','Actions']}
              empty={rows.length === 0 ? 'No submissions found' : null}
            >
              {rows.map(r => (
                <tr key={r.id}>
                  <td style={S.td}><strong>{r.name}</strong></td>
                  <td style={S.td}>{r.city}{r.district ? `, ${r.district}` : ''}</td>
                  <td style={S.td}><div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {(r.services || []).slice(0,3).map(s => <span key={s} style={{ fontSize: 10, padding: '2px 7px', background: '#eef3fb', color: NAVY, borderRadius: 10, fontWeight: 600 }}>{s}</span>)}
                    {(r.services || []).length > 3 && <span style={{ fontSize: 10, color: '#94a3b8' }}>+{r.services.length - 3}</span>}
                  </div></td>
                  <td style={S.td}><a href={`https://wa.me/${r.whatsapp?.replace(/\D/g,'')}`} target="_blank" rel="noopener" style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none', fontSize: 12 }}>{r.whatsapp}</a></td>
                  <td style={S.td}><StatusBadge status={r.status} /></td>
                  <td style={S.td}>{timeAgo(r.created_at)}</td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {r.status !== 'listed'    && <button onClick={() => update(r.id, { status: 'listed' })}    style={S.btn('#16a34a')}>✓ List</button>}
                      {r.status !== 'approved'  && <button onClick={() => update(r.id, { status: 'approved' })}  style={S.btn(NAVY)}>Approve</button>}
                      {r.status !== 'rejected'  && <button onClick={() => update(r.id, { status: 'rejected' })}  style={S.btn('#dc2626')}>Reject</button>}
                      {r.status !== 'pending_review' && <button onClick={() => update(r.id, { status: 'pending_review' })} style={S.btn('#94a3b8')}>Reset</button>}
                    </div>
                    {r.description && (
                      <p style={{ fontSize: 11, color: '#64748b', marginTop: 6, maxWidth: 260, lineHeight: 1.5 }}>{r.description.slice(0, 120)}{r.description.length > 120 ? '…' : ''}</p>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </div>
          <Pagination page={page} setPage={setPage} count={count} perPage={PER} />
        </>
      )}
    </div>
  )
}

// ─── Claims tab ───────────────────────────────────────────────────────────────
function ClaimsTab() {
  const [rows, setRows]       = useState([])
  const [showAll, setShowAll] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('claim_requests').select('*').order('created_at', { ascending: false })
    if (!showAll) q = q.eq('status', 'pending_code')
    const { data } = await q.limit(100)
    setRows(data || [])
    setLoading(false)
  }, [showAll])

  useEffect(() => { load() }, [load])

  function waLink(whatsapp, code, profileName) {
    const num = (whatsapp || '').replace(/\D/g, '')
    const normalized = num.startsWith('94') ? num : '94' + num.replace(/^0/, '')
    const msg = encodeURIComponent(`Hi ${profileName}, someone is claiming your TilersHub profile. Your verification code is: *${code}*\n\nOnly share this if you started the claim at tilershub.lk`)
    return `https://wa.me/${normalized}?text=${msg}`
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
        <h2 style={{ ...S.h2, marginBottom: 0 }}>Claim Requests</h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', cursor: 'pointer', marginLeft: 'auto' }}>
          <input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} />
          Show all (including verified)
        </label>
      </div>
      {loading ? <p style={{ color: '#94a3b8' }}>Loading…</p> : (
        <div style={S.card}>
          <Table
            heads={['Profile','Type','WhatsApp (send code to)','Code','Status','Requested','Action']}
            empty={rows.length === 0 ? (showAll ? 'No claim requests yet' : 'No pending claims 🎉') : null}
          >
            {rows.map(r => (
              <tr key={r.id}>
                <td style={S.td}><strong>{r.profile_name}</strong></td>
                <td style={S.td}><span style={{ fontSize: 11, padding: '2px 8px', background: '#f1f5f9', borderRadius: 8 }}>{r.profile_type}</span></td>
                <td style={S.td}><span style={{ fontFamily: 'monospace', fontSize: 13 }}>{r.whatsapp}</span></td>
                <td style={S.td}>
                  <span style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 800, color: NAVY, letterSpacing: '0.1em' }}>{r.code}</span>
                </td>
                <td style={S.td}><StatusBadge status={r.status} /></td>
                <td style={S.td}>{timeAgo(r.created_at)}</td>
                <td style={S.td}>
                  {r.status === 'pending_code' && (
                    <a href={waLink(r.whatsapp, r.code, r.profile_name)} target="_blank" rel="noopener"
                      style={{ ...S.btn('#25D366'), display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
                      💬 Send Code
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  )
}

// ─── Projects tab ─────────────────────────────────────────────────────────────
function ProjectsTab() {
  const [rows, setRows]       = useState([])
  const [filter, setFilter]   = useState('all')
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(0)
  const [count, setCount]     = useState(0)
  const [bidCounts, setBidCounts] = useState({})
  const PER = 20

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('projects').select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PER, page * PER + PER - 1)
    if (filter !== 'all') q = q.eq('status', filter)
    const { data, count: c } = await q
    const proj = data || []
    setRows(proj); setCount(c || 0)

    if (proj.length > 0) {
      const ids = proj.map(p => p.id)
      const { data: bids } = await supabase.from('bids').select('job_id').in('job_id', ids)
      const bc = {}
      for (const b of bids || []) bc[b.job_id] = (bc[b.job_id] || 0) + 1
      setBidCounts(bc)
    }
    setLoading(false)
  }, [filter, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(0) }, [filter])

  async function setStatus(id, status) {
    await supabase.from('projects').update({ status }).eq('id', id)
    load()
  }
  async function del(id) {
    if (!confirm('Delete this project?')) return
    await supabase.from('projects').delete().eq('id', id)
    load()
  }

  const STATUSES = ['all','pending_review','active','matched','completed']

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <h2 style={{ ...S.h2, marginBottom: 0 }}>Projects</h2>
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', flexWrap: 'wrap' }}>
          {STATUSES.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={S.btn(filter === f ? NAVY : '#f1f5f9', filter === f ? '#fff' : '#334155')}>
              {f === 'all' ? 'All' : f.replace(/_/g,' ')}
            </button>
          ))}
        </div>
      </div>
      {loading ? <p style={{ color: '#94a3b8' }}>Loading…</p> : (
        <>
          <div style={S.card}>
            <Table
              heads={['Title','Location','Customer','WhatsApp','Budget','Status','Bids','Posted','Actions']}
              empty={rows.length === 0 ? 'No projects found' : null}
            >
              {rows.map(r => (
                <tr key={r.id}>
                  <td style={S.td}><strong>{r.project_type}</strong></td>
                  <td style={S.td}>{r.city}{r.district ? `, ${r.district}` : ''}</td>
                  <td style={S.td}>{r.customer_name}</td>
                  <td style={S.td}><a href={`https://wa.me/${(r.whatsapp||'').replace(/\D/g,'')}`} target="_blank" rel="noopener" style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none', fontSize: 12 }}>{r.whatsapp}</a></td>
                  <td style={S.td}>{r.budget_range || '—'}</td>
                  <td style={S.td}><StatusBadge status={r.status} /></td>
                  <td style={{ ...S.td, textAlign: 'center', fontWeight: 700, color: NAVY }}>{bidCounts[r.id] || 0}</td>
                  <td style={S.td}>{timeAgo(r.created_at)}</td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      <select onChange={e => e.target.value && setStatus(r.id, e.target.value)} defaultValue=""
                        style={{ padding: '5px 8px', borderRadius: 7, border: '1px solid #e2e8f0', fontSize: 12, cursor: 'pointer' }}>
                        <option value="" disabled>Set status…</option>
                        {['pending_review','active','matched','completed'].map(s =>
                          <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
                        )}
                      </select>
                      <button onClick={() => del(r.id)} style={S.btn('#fef2f2','#dc2626')}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
          <Pagination page={page} setPage={setPage} count={count} perPage={PER} />
        </>
      )}
    </div>
  )
}

// ─── Bids tab ─────────────────────────────────────────────────────────────────
function BidsTab() {
  const [rows, setRows]       = useState([])
  const [projects, setProjects] = useState({})
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(0)
  const [count, setCount]     = useState(0)
  const PER = 20

  const load = useCallback(async () => {
    setLoading(true)
    const { data, count: c } = await supabase.from('bids').select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PER, page * PER + PER - 1)
    const bids = data || []
    setRows(bids); setCount(c || 0)

    if (bids.length > 0) {
      const ids = [...new Set(bids.map(b => b.job_id))]
      const { data: proj } = await supabase.from('projects').select('id,project_type,city').in('id', ids)
      const pm = {}; for (const p of proj || []) pm[p.id] = p
      setProjects(pm)
    }
    setLoading(false)
  }, [page])

  useEffect(() => { load() }, [load])

  async function del(id) {
    if (!confirm('Delete this bid?')) return
    await supabase.from('bids').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <h2 style={S.h2}>Bids</h2>
      {loading ? <p style={{ color: '#94a3b8' }}>Loading…</p> : (
        <>
          <div style={S.card}>
            <Table
              heads={['Project','Bidder','Type','WhatsApp','Quote','Timeline','Message','Status','Date','Del']}
              empty={rows.length === 0 ? 'No bids yet' : null}
            >
              {rows.map(r => {
                const proj = projects[r.job_id]
                return (
                  <tr key={r.id}>
                    <td style={S.td}>{proj ? <span>{proj.project_type}<br /><span style={{ fontSize: 11, color: '#94a3b8' }}>{proj.city}</span></span> : '—'}</td>
                    <td style={S.td}><strong>{r.bidder_name}</strong></td>
                    <td style={S.td}><span style={{ fontSize: 11, padding: '2px 7px', background: '#f1f5f9', borderRadius: 8 }}>{r.bidder_type}</span></td>
                    <td style={S.td}><a href={`https://wa.me/${(r.bidder_whatsapp||'').replace(/\D/g,'')}`} target="_blank" rel="noopener" style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none', fontSize: 12 }}>{r.bidder_whatsapp}</a></td>
                    <td style={S.td}>{r.quote_amount ? `Rs. ${r.quote_amount.toLocaleString()}` : '—'}</td>
                    <td style={S.td}>{r.timeline || '—'}</td>
                    <td style={{ ...S.td, maxWidth: 200 }}>{r.message?.slice(0, 80)}{r.message?.length > 80 ? '…' : ''}</td>
                    <td style={S.td}><StatusBadge status={r.status} /></td>
                    <td style={S.td}>{timeAgo(r.created_at)}</td>
                    <td style={S.td}><button onClick={() => del(r.id)} style={S.btn('#fef2f2','#dc2626')}>🗑</button></td>
                  </tr>
                )
              })}
            </Table>
          </div>
          <Pagination page={page} setPage={setPage} count={count} perPage={PER} />
        </>
      )}
    </div>
  )
}

// ─── Reviews tab ──────────────────────────────────────────────────────────────
function ReviewsTab() {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(0)
  const [count, setCount]     = useState(0)
  const PER = 20

  const load = useCallback(async () => {
    setLoading(true)
    const { data, count: c } = await supabase.from('reviews').select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PER, page * PER + PER - 1)
    setRows(data || []); setCount(c || 0)
    setLoading(false)
  }, [page])

  useEffect(() => { load() }, [load])

  async function del(id) {
    if (!confirm('Delete this review?')) return
    await supabase.from('reviews').delete().eq('id', id)
    load()
  }

  function Stars({ n }) {
    return <span style={{ color: '#f59e0b' }}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>
  }

  return (
    <div>
      <h2 style={S.h2}>Reviews</h2>
      {loading ? <p style={{ color: '#94a3b8' }}>Loading…</p> : (
        <>
          <div style={S.card}>
            <Table
              heads={['Reviewer','Rating','Job Type','Comment','Profile','Date','Del']}
              empty={rows.length === 0 ? 'No reviews yet' : null}
            >
              {rows.map(r => (
                <tr key={r.id}>
                  <td style={S.td}><strong>{r.reviewer_name}</strong></td>
                  <td style={S.td}><Stars n={r.rating} /></td>
                  <td style={S.td}>{r.job_type || '—'}</td>
                  <td style={{ ...S.td, maxWidth: 260 }}>{r.comment?.slice(0, 120)}{r.comment?.length > 120 ? '…' : ''}</td>
                  <td style={S.td}>
                    {r.tiler_id && <span style={{ fontSize: 11, color: '#64748b' }}>Tiler</span>}
                    {r.provider_id && <span style={{ fontSize: 11, color: '#64748b' }}>Provider</span>}
                  </td>
                  <td style={S.td}>{timeAgo(r.created_at)}</td>
                  <td style={S.td}><button onClick={() => del(r.id)} style={S.btn('#fef2f2','#dc2626')}>🗑</button></td>
                </tr>
              ))}
            </Table>
          </div>
          <Pagination page={page} setPage={setPage} count={count} perPage={PER} />
        </>
      )}
    </div>
  )
}

// ─── Main AdminDashboard ───────────────────────────────────────────────────────
const TABS = [
  { key: 'overview',     label: '📊 Overview' },
  { key: 'submissions',  label: '📝 Submissions' },
  { key: 'claims',       label: '📲 Claims' },
  { key: 'projects',     label: '📋 Projects' },
  { key: 'bids',         label: '💬 Bids' },
  { key: 'reviews',      label: '⭐ Reviews' },
]

export default function AdminDashboard() {
  const [loading,   setLoading]   = useState(true)
  const [user,      setUser]      = useState(null)
  const [isAdmin,   setIsAdmin]   = useState(null) // null=checking, true/false
  const [tab,       setTab]       = useState('overview')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      setUser(u)
      if (u) {
        const { data } = await supabase.rpc('is_admin')
        setIsAdmin(!!data)
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        const { data } = await supabase.rpc('is_admin')
        setIsAdmin(!!data)
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
          <p>Checking access…</p>
        </div>
      </div>
    )
  }

  if (!user) return <SignIn />

  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 340 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚫</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Access Denied</h2>
          <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
            <strong>{user.email}</strong> is not an admin account.
          </p>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
            style={S.btn('#f1f5f9','#334155')}>Sign Out</button>
        </div>
      </div>
    )
  }

  return (
    <div style={S.page}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        <div style={{ padding: '24px 20px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1, marginBottom: 2 }}>TILERS<span style={{ color: TERRA }}>HUB</span></div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 1 }}>ADMIN</div>
        </div>

        <nav style={{ flex: 1, padding: '0 10px' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '10px 14px', borderRadius: 10, marginBottom: 3,
                fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
                background: tab === t.key ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: tab === t.key ? '#fff' : 'rgba(255,255,255,0.55)',
                transition: 'all 0.15s',
              }}>
              {t.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8, wordBreak: 'break-all' }}>{user.email}</div>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
            style={{ ...S.btn('rgba(255,255,255,0.1)', 'rgba(255,255,255,0.7)'), width: '100%', padding: '8px' }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={S.main}>
        {tab === 'overview'    && <OverviewTab />}
        {tab === 'submissions' && <SubmissionsTab />}
        {tab === 'claims'      && <ClaimsTab />}
        {tab === 'projects'    && <ProjectsTab />}
        {tab === 'bids'        && <BidsTab />}
        {tab === 'reviews'     && <ReviewsTab />}
      </main>
    </div>
  )
}
