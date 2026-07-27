import { useState, useEffect } from 'react'
import { planWeek, ANGLES } from '../lib/claudeApi.js'
import { getQueue, saveToLocalQueue } from '../lib/contentQueue.js'
import { useSupabaseStats } from '../hooks/useSupabaseStats.js'

const NAVY   = '#2563EB'
const GOLD   = '#E8B341'
const ORANGE = '#E8580A'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getWeekDates() {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00')
  return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`
}

function CampaignDot({ campaign }) {
  return (
    <span style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
      background: campaign === 'user' ? '#3B82F6' : ORANGE, flexShrink: 0,
    }} />
  )
}

function PostSlot({ post }) {
  const iUser = post.campaign === 'user'
  return (
    <div style={{
      padding: '6px 8px', borderRadius: 8, marginBottom: 4, fontSize: 11,
      background: iUser ? '#EFF6FF' : '#EFF6FF',
      border: `1px solid ${iUser ? '#BFDBFE' : '#FED7AA'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
        <CampaignDot campaign={post.campaign} />
        <span style={{ fontWeight: 700, color: iUser ? '#1E40AF' : '#C2410C' }}>
          {post.suggested_time || post.time || '—'}
        </span>
        <span style={{ color: '#94A3B8', marginLeft: 'auto' }}>{post.platform || ''}</span>
      </div>
      <div style={{ color: '#334155', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {post.note || post.caption?.slice(0, 60) || '—'}
      </div>
      <div style={{ marginTop: 3 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 20,
          background: post.status === 'POSTED' ? '#D1FAE5' : post.status === 'READY' ? '#DBEAFE' : '#F3F4F6',
          color: post.status === 'POSTED' ? '#065F46' : post.status === 'READY' ? '#1E40AF' : '#64748B',
        }}>{post.status || 'PLAN'}</span>
      </div>
    </div>
  )
}

function AddSlotModal({ date, onAdd, onClose }) {
  const [campaign, setCampaign] = useState('user')
  const [format,   setFormat]   = useState('single')
  const [platform, setPlatform] = useState('FB+IG')
  const [angle,    setAngle]    = useState('social_proof')
  const [time,     setTime]     = useState('09:00')
  const [note,     setNote]     = useState('')

  function handleAdd() {
    onAdd({ date, campaign, format, platform, angle, suggested_time: time, note, status: 'PLAN' })
    onClose()
  }

  const sel = v => ({ padding: '7px 10px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', width: '100%', background: '#fff', boxSizing: 'border-box' })

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Add Slot — {formatDate(date)}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: 5 }}>Campaign</div>
            <select value={campaign} onChange={e => { setCampaign(e.target.value); setAngle(ANGLES[e.target.value][0].value) }} style={sel()}>
              <option value="user">🏠 User</option>
              <option value="provider">🔨 Provider</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: 5 }}>Time</div>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} style={sel()} />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: 5 }}>Format</div>
            <select value={format} onChange={e => setFormat(e.target.value)} style={sel()}>
              <option value="single">🖼 Single Image</option>
              <option value="carousel">🎴 Carousel</option>
              <option value="reel">🎬 Reel</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: 5 }}>Platform</div>
            <select value={platform} onChange={e => setPlatform(e.target.value)} style={sel()}>
              <option value="FB+IG">📱 FB + IG</option>
              <option value="Facebook">📘 Facebook</option>
              <option value="Instagram">📸 Instagram</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: 5 }}>Angle</div>
          <select value={angle} onChange={e => setAngle(e.target.value)} style={sel()}>
            {ANGLES[campaign].map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: 5 }}>Note (optional)</div>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Quick content idea…"
            style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleAdd}
            style={{ flex: 1, padding: '10px', background: NAVY, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Add to Calendar
          </button>
          <button onClick={onClose}
            style={{ padding: '10px 16px', background: '#F1F5F9', color: '#334155', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ContentCalendar() {
  const { stats } = useSupabaseStats()
  const [weekDates, setWeekDates]   = useState(getWeekDates)
  const [queue,     setQueue]       = useState([])
  const [planning,  setPlanning]    = useState(false)
  const [planCampaign, setPlanCampaign] = useState('user')
  const [planResult,   setPlanResult]   = useState([])
  const [planError,    setPlanError]    = useState(null)
  const [addSlotDay,   setAddSlotDay]   = useState(null)

  useEffect(() => { setQueue(getQueue()) }, [])

  function refreshQueue() { setQueue(getQueue()) }

  async function handleAutoPlan() {
    setPlanning(true); setPlanError(null); setPlanResult([])
    try {
      const result = await planWeek({ campaign: planCampaign, stats })
      setPlanResult(result)
    } catch (e) {
      setPlanError(e.message)
    }
    setPlanning(false)
  }

  function acceptPlanSlot(slot) {
    saveToLocalQueue({ ...slot, status: 'PLAN' })
    setPlanResult(prev => prev.filter(s => s.date !== slot.date || s.time !== slot.time))
    refreshQueue()
  }

  function handleAddSlot(slot) {
    saveToLocalQueue(slot)
    refreshQueue()
  }

  // Group queue items and plan results by date
  function postsForDate(date) {
    const q = queue.filter(p => p.date === date)
    const p = planResult.filter(p => p.date === date)
    return { queued: q, planned: p }
  }

  const prevWeek = () => {
    setWeekDates(prev => prev.map(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n.toISOString().slice(0, 10) }))
  }
  const nextWeek = () => {
    setWeekDates(prev => prev.map(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n.toISOString().slice(0, 10) }))
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div style={{ fontFamily: 'Montserrat, system-ui, sans-serif' }}>

      {/* Header controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={prevWeek}
            style={{ padding: '7px 12px', background: '#F1F5F9', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#334155' }}>←</button>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', minWidth: 180, textAlign: 'center' }}>
            {formatDate(weekDates[0])} – {formatDate(weekDates[6])}
          </span>
          <button onClick={nextWeek}
            style={{ padding: '7px 12px', background: '#F1F5F9', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#334155' }}>→</button>
          <button onClick={() => setWeekDates(getWeekDates())}
            style={{ padding: '7px 12px', background: '#F1F5F9', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 11, color: '#64748B' }}>This Week</button>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <select value={planCampaign} onChange={e => setPlanCampaign(e.target.value)}
            style={{ padding: '7px 10px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', background: '#fff' }}>
            <option value="user">🏠 User Campaign</option>
            <option value="provider">🔨 Provider Campaign</option>
          </select>
          <button onClick={handleAutoPlan} disabled={planning}
            style={{ padding: '8px 16px', background: planning ? '#94A3B8' : GOLD, color: '#0F172A', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: planning ? 'not-allowed' : 'pointer' }}>
            {planning ? '⏳ Planning…' : '🤖 Auto-plan Week'}
          </button>
        </div>
      </div>

      {planError && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#991B1B' }}>
          ⚠️ {planError}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 14, fontSize: 11, color: '#64748B' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><CampaignDot campaign="user" /> User Campaign</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><CampaignDot campaign="provider" /> Provider Campaign</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: '#E8B341', display: 'inline-block' }} /> AI Suggested
        </span>
      </div>

      {/* 7-day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8 }}>
        {weekDates.map((date, i) => {
          const { queued, planned } = postsForDate(date)
          const isToday = date === today
          return (
            <div key={date} style={{
              background: '#fff', border: `1px solid ${isToday ? NAVY : '#E5E9F0'}`,
              borderRadius: 12, padding: '10px 8px', minHeight: 180,
            }}>
              {/* Day header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: isToday ? NAVY : '#94A3B8', textTransform: 'uppercase' }}>{DAY_LABELS[i]}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: isToday ? NAVY : '#0F172A', lineHeight: 1 }}>{formatDate(date).split(' ')[0]}</div>
                  <div style={{ fontSize: 10, color: '#94A3B8' }}>{formatDate(date).split(' ')[1]}</div>
                </div>
                {isToday && <span style={{ fontSize: 9, fontWeight: 700, background: NAVY, color: '#fff', padding: '2px 7px', borderRadius: 20 }}>TODAY</span>}
              </div>

              {/* Queued posts */}
              {queued.map((p, j) => <PostSlot key={j} post={p} />)}

              {/* AI suggestions */}
              {planned.map((p, j) => (
                <div key={j} style={{
                  padding: '6px 8px', borderRadius: 8, marginBottom: 4, fontSize: 11,
                  background: '#EFF6FF', border: `1px dashed ${GOLD}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                    <span style={{ fontSize: 10 }}>🤖</span>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>{p.time}</span>
                  </div>
                  <div style={{ color: '#1E293B', lineHeight: 1.4, marginBottom: 5 }}>{p.note}</div>
                  <button onClick={() => acceptPlanSlot(p)}
                    style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', background: GOLD, color: '#0F172A', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                    + Add
                  </button>
                </div>
              ))}

              {/* Add slot button */}
              <button onClick={() => setAddSlotDay(date)}
                style={{ width: '100%', padding: '5px', background: 'transparent', border: '1px dashed #E2E8F0', borderRadius: 8, fontSize: 11, color: '#94A3B8', cursor: 'pointer', marginTop: 4 }}>
                + Add Slot
              </button>
            </div>
          )
        })}
      </div>

      {/* Add Slot Modal */}
      {addSlotDay && <AddSlotModal date={addSlotDay} onAdd={handleAddSlot} onClose={() => setAddSlotDay(null)} />}
    </div>
  )
}
