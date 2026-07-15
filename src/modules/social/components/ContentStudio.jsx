import { useState } from 'react'
import { generatePosts, ANGLES } from '../lib/claudeApi.js'
import { saveToLocalQueue, copyRowToClipboard, copyAllToClipboard } from '../lib/contentQueue.js'
import { useSupabaseStats } from '../hooks/useSupabaseStats.js'

const NAVY  = '#0F766E'
const GOLD  = '#E8B341'
const ORANGE = '#E8580A'

// ─── Shared helpers ───────────────────────────────────────────────────────────

function lbl(extra = {}) {
  return { display: 'block', fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 7, ...extra }
}
function card(extra = {}) {
  return { background: '#fff', border: '1px solid #E5E9F0', borderRadius: 14, padding: 20, ...extra }
}

function ToggleGroup({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {options.map(o => {
        const active = value === o.value
        return (
          <button key={o.value} onClick={() => onChange(o.value)} style={{
            padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
            background: active ? NAVY : '#f1f5f9', color: active ? '#fff' : '#334155', transition: 'all 0.12s',
          }}>{o.label}</button>
        )
      })}
    </div>
  )
}

function StatPill({ label, value, loading }) {
  return (
    <div style={{ textAlign: 'center', padding: '10px 18px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: NAVY, lineHeight: 1 }}>{loading ? '…' : value}</div>
      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  )
}

// ─── Single generated post card ───────────────────────────────────────────────

function PostCard({ post, index, campaign, onSave, onDiscard, onRegenerate, saved, regenerating }) {
  const [caption, setCaption]   = useState(post.caption || '')
  const [date,    setDate]      = useState(post.date || '')
  const [time,    setTime]      = useState(post.suggested_time || '09:00')
  const [copied,  setCopied]    = useState(false)

  const iUser = campaign === 'user'
  const campColor = iUser ? '#3B82F6' : ORANGE
  const campLabel = iUser ? '🏠 User' : '🔨 Provider'
  const fmtLabel  = post.format === 'carousel' ? '🎴 Carousel' : post.format === 'reel' ? '🎬 Reel' : '🖼 Single'

  async function handleCopy() {
    await copyRowToClipboard({ ...post, caption, date, suggested_time: time })
    setCopied(true); setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div style={card({ marginBottom: 16 })}>
      {/* Header badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: campColor + '18', color: campColor }}>{campLabel}</span>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#f1f5f9', color: '#64748b' }}>{fmtLabel}</span>
        <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto' }}>#{index + 1}</span>
      </div>

      {/* Hook */}
      {post.hook && (
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', background: '#eff6ff', borderRadius: 8, padding: '8px 12px', marginBottom: 10, borderLeft: `3px solid ${NAVY}` }}>
          🪝 {post.hook}
        </div>
      )}

      {/* Caption — editable */}
      <div style={lbl({ marginBottom: 6 })}>Caption</div>
      <textarea value={caption} onChange={e => setCaption(e.target.value)} rows={5}
        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.6, marginBottom: 10 }} />

      {/* CTA */}
      {post.cta && (
        <div style={{ fontSize: 12, color: '#334155', marginBottom: 8 }}>
          <strong>CTA:</strong> {post.cta}
        </div>
      )}

      {/* Image brief */}
      {post.image_description && (
        <div style={{ fontSize: 12, color: '#64748b', background: '#f8fafc', borderRadius: 8, padding: '8px 12px', marginBottom: 10, lineHeight: 1.6 }}>
          🖼 <strong>Visual brief:</strong> {post.image_description}
        </div>
      )}

      {/* Carousel slides */}
      {post.slides?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={lbl({ marginBottom: 8 })}>Slides</div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {post.slides.map((s, i) => (
              <div key={i} style={{ flex: '0 0 150px', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 11px', fontSize: 11 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Slide {i + 1}</div>
                <div style={{ fontWeight: 700, color: NAVY, marginBottom: 3, lineHeight: 1.3 }}>{s.headline}</div>
                <div style={{ color: '#64748b', lineHeight: 1.4, marginBottom: 4 }}>{s.body}</div>
                {s.design_note && <div style={{ fontSize: 10, color: '#94a3b8', fontStyle: 'italic' }}>{s.design_note}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reel script */}
      {post.script && (
        <div style={{ fontSize: 12, color: '#334155', background: '#f8fafc', borderRadius: 8, padding: '10px 12px', marginBottom: 10, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
          🎬 <strong>Script:</strong><br />{post.script}
        </div>
      )}

      {/* Date / Time */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={lbl({ marginBottom: 5 })}>Date</div>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={lbl({ marginBottom: 5 })}>Time</div>
          <input type="time" value={time} onChange={e => setTime(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => onSave({ ...post, caption, date, suggested_time: time })} disabled={saved}
          style={{ padding: '7px 14px', background: saved ? '#D1FAE5' : NAVY, color: saved ? '#065F46' : '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: saved ? 'default' : 'pointer' }}>
          {saved ? '✓ Saved' : '💾 Save to Queue'}
        </button>
        <button onClick={handleCopy}
          style={{ padding: '7px 14px', background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          {copied ? '✓ Copied!' : '📋 Copy Row'}
        </button>
        <button onClick={() => onRegenerate(index)} disabled={regenerating}
          style={{ padding: '7px 14px', background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: regenerating ? 0.6 : 1 }}>
          {regenerating ? '⏳' : '🔄'} Regenerate
        </button>
        <button onClick={() => onDiscard(index)}
          style={{ padding: '7px 14px', background: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          🗑 Discard
        </button>
      </div>
    </div>
  )
}

// ─── Main ContentStudio ────────────────────────────────────────────────────────

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1umnpXIFhPT8-D31_dbiS_Iz5Ebw9ZfexwrBPD7YPENw/edit'

function todayISO() { return new Date().toISOString().slice(0, 10) }

function scheduleDates(startISO, count) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(startISO); d.setDate(d.getDate() + i * 2)
    return d.toISOString().slice(0, 10)
  })
}

export default function ContentStudio() {
  const { stats, loading: statsLoading, error: statsError, refresh: refreshStats } = useSupabaseStats()

  const [campaign,      setCampaign]      = useState('user')
  const [format,        setFormat]        = useState('single')
  const [platform,      setPlatform]      = useState('FB+IG')
  const [angle,         setAngle]         = useState('social_proof')
  const [numPosts,      setNumPosts]      = useState(3)
  const [scheduleDate,  setScheduleDate]  = useState(todayISO)

  const [generating,    setGenerating]    = useState(false)
  const [regenIdx,      setRegenIdx]      = useState(null)
  const [error,         setError]         = useState(null)
  const [posts,         setPosts]         = useState([])
  const [savedIds,      setSavedIds]      = useState(new Set())
  const [copyAllMsg,    setCopyAllMsg]    = useState('')

  const missingKey = !import.meta.env.VITE_ANTHROPIC_API_KEY && !import.meta.env.PUBLIC_ANTHROPIC_API_KEY

  async function handleGenerate() {
    setGenerating(true); setError(null); setPosts([]); setSavedIds(new Set())
    try {
      const results = await generatePosts({ campaign, format, platform, angle, numPosts, stats })
      const dates = scheduleDates(scheduleDate, results.length)
      setPosts(results.map((p, i) => ({ ...p, id: `gen_${Date.now()}_${i}`, campaign, format, date: dates[i] })))
    } catch (e) {
      setError(e.message === 'MISSING_KEY' ? null : e.message)
    }
    setGenerating(false)
  }

  async function handleRegenerate(index) {
    setRegenIdx(index); setError(null)
    try {
      const [result] = await generatePosts({ campaign, format, platform, angle, numPosts: 1, stats })
      setPosts(prev => prev.map((p, i) => i === index ? { ...result, id: p.id, campaign, format, date: p.date } : p))
      setSavedIds(prev => { const s = new Set(prev); s.delete(posts[index].id); return s })
    } catch (e) { setError(e.message) }
    setRegenIdx(null)
  }

  function handleSave(post) {
    saveToLocalQueue(post)
    setSavedIds(s => new Set([...s, post.id]))
  }

  function handleDiscard(index) { setPosts(prev => prev.filter((_, i) => i !== index)) }

  async function handleCopyAll() {
    await copyAllToClipboard(posts)
    setCopyAllMsg('Copied!'); setTimeout(() => setCopyAllMsg(''), 1800)
  }

  const currentAngles = ANGLES[campaign]

  return (
    <div style={{ fontFamily: 'Montserrat, system-ui, sans-serif' }}>

      {/* Live Stats Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatPill label="Projects Posted" value={stats.projects} loading={statsLoading} />
        <StatPill label="Active Tilers"   value={stats.tilers}   loading={statsLoading} />
        <StatPill label="Bids Placed"     value={stats.bids}     loading={statsLoading} />
        <button onClick={refreshStats} title="Refresh stats"
          style={{ padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: 10, fontSize: 12, color: '#64748b', cursor: 'pointer', alignSelf: 'center' }}>
          ↻ Refresh
        </button>
        {statsError && <span style={{ fontSize: 11, color: '#ef4444', alignSelf: 'center' }}>Stats unavailable</span>}
      </div>

      {/* API Key Warning */}
      {missingKey && (
        <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: '#92400E', marginBottom: 6 }}>⚠️ Anthropic API Key Not Configured</div>
          <div style={{ fontSize: 12, color: '#78350F', lineHeight: 1.6 }}>
            Add to your <code style={{ background: '#fff', padding: '1px 6px', borderRadius: 4 }}>.env</code> file:<br />
            <code style={{ background: '#fff', padding: '4px 8px', borderRadius: 6, display: 'inline-block', marginTop: 4 }}>VITE_ANTHROPIC_API_KEY=sk-ant-api03-...</code><br />
            Then restart the dev server and redeploy.
          </div>
        </div>
      )}

      {/* Config Form */}
      <div style={card({ marginBottom: 20 })}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 18 }}>⚙️ Content Configuration</div>

        {/* Campaign */}
        <div style={{ marginBottom: 18 }}>
          <div style={lbl()}>Campaign</div>
          <ToggleGroup
            options={[{ value: 'user', label: '🏠 User — Attract Homeowners' }, { value: 'provider', label: '🔨 Provider — Attract Tilers' }]}
            value={campaign}
            onChange={v => { setCampaign(v); setAngle(ANGLES[v][0].value) }}
          />
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
            {campaign === 'user'
              ? 'Posts aimed at homeowners to post renovation projects at tilershub.lk/post-project'
              : 'Posts aimed at tilers/contractors to join and bid for jobs at tilershub.lk/join-as-tiler'}
          </div>
        </div>

        {/* 3-column row: Format, Platform, Count */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginBottom: 18 }}>
          <div>
            <div style={lbl()}>Format</div>
            <ToggleGroup
              options={[{ value: 'single', label: '🖼 Single' }, { value: 'carousel', label: '🎴 Carousel' }, { value: 'reel', label: '🎬 Reel' }]}
              value={format} onChange={setFormat}
            />
          </div>
          <div>
            <div style={lbl()}>Platform</div>
            <ToggleGroup
              options={[{ value: 'FB+IG', label: '📱 FB + IG' }, { value: 'Facebook', label: '📘 FB' }, { value: 'Instagram', label: '📸 IG' }]}
              value={platform} onChange={setPlatform}
            />
          </div>
          <div>
            <div style={lbl()}>Number of Posts</div>
            <ToggleGroup
              options={[{ value: 1, label: '1' }, { value: 3, label: '3' }, { value: 5, label: '5' }, { value: 7, label: '7' }]}
              value={numPosts} onChange={setNumPosts}
            />
          </div>
        </div>

        {/* Angle + Date */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18, marginBottom: 20 }}>
          <div>
            <div style={lbl()}>Content Angle</div>
            <select value={angle} onChange={e => setAngle(e.target.value)}
              style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', background: '#fff', cursor: 'pointer' }}>
              {currentAngles.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>
          <div>
            <div style={lbl()}>Schedule Start Date</div>
            <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
              style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }} />
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>Posts spaced 2 days apart</div>
          </div>
        </div>

        {/* Generate button */}
        <button onClick={handleGenerate} disabled={generating || missingKey}
          style={{
            padding: '12px 28px', background: generating ? '#94a3b8' : ORANGE, color: '#fff', border: 'none',
            borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: generating || missingKey ? 'not-allowed' : 'pointer',
            boxShadow: generating ? 'none' : '0 4px 14px rgba(232,88,10,0.3)', transition: 'all 0.15s',
          }}>
          {generating ? '⏳ Generating…' : `✨ Generate ${numPosts} Post${numPosts > 1 ? 's' : ''}`}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#991B1B' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Generated Posts */}
      {posts.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Generated Posts ({posts.length})</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button onClick={handleCopyAll}
                style={{ padding: '8px 16px', background: GOLD, color: '#0f172a', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                {copyAllMsg || '📋 Copy All Rows'}
              </button>
              <a href={SHEET_URL} target="_blank" rel="noreferrer"
                style={{ padding: '8px 16px', background: '#f1f5f9', color: '#334155', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                📊 Open Sheet ↗
              </a>
            </div>
          </div>

          {posts.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              index={i}
              campaign={campaign}
              onSave={handleSave}
              onDiscard={handleDiscard}
              onRegenerate={handleRegenerate}
              saved={savedIds.has(post.id)}
              regenerating={regenIdx === i}
            />
          ))}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button onClick={handleCopyAll}
              style={{ padding: '10px 20px', background: GOLD, color: '#0f172a', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {copyAllMsg || '📋 Copy All Rows for Sheet'}
            </button>
            <a href={SHEET_URL} target="_blank" rel="noreferrer"
              style={{ padding: '10px 20px', background: NAVY, color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
              📊 Open Google Sheet ↗
            </a>
          </div>
        </>
      )}

      {/* Generating skeleton */}
      {generating && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: numPosts }).map((_, i) => (
            <div key={i} style={{ ...card(), height: 200, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', animation: 'pulse 1.5s ease infinite', backgroundSize: '200% 100%' }} />
          ))}
        </div>
      )}
    </div>
  )
}
