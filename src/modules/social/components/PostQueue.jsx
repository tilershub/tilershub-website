import { useState, useEffect } from 'react'
import { getQueue, updateStatus, removeFromQueue, copyRowToClipboard, copyAllToClipboard } from '../lib/contentQueue.js'

const NAVY   = '#C2542B'
const GOLD   = '#E8B341'
const ORANGE = '#D96234'
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1umnpXIFhPT8-D31_dbiS_Iz5Ebw9ZfexwrBPD7YPENw/edit'

const STATUS_COLORS = {
  DRAFT:  { bg: '#F4F1EC', color: '#3A4046' },
  PLAN:   { bg: '#F4F1EC', color: '#3A4046' },
  READY:  { bg: '#F3E7DF', color: '#7A3218' },
  POSTED: { bg: '#E9F1EC', color: '#22513B' },
}

function StatusBadge({ status }) {
  const { bg, color } = STATUS_COLORS[status] || STATUS_COLORS.DRAFT
  return (
    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: bg, color }}>
      {status || 'DRAFT'}
    </span>
  )
}

function CampaignBadge({ campaign }) {
  const isUser = campaign === 'user'
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: isUser ? '#F7EFE9' : '#F7EFE9', color: isUser ? '#7A3218' : '#C2542B',
    }}>
      {isUser ? '🏠 User' : '🔨 Provider'}
    </span>
  )
}

export default function PostQueue() {
  const [queue,      setQueue]      = useState([])
  const [filter,     setFilter]     = useState('ALL')
  const [copyAllMsg, setCopyAllMsg] = useState('')
  const [copiedId,   setCopiedId]   = useState(null)

  function refresh() { setQueue(getQueue()) }
  useEffect(() => { refresh() }, [])

  function handleStatus(id, status) { updateStatus(id, status); refresh() }
  function handleDelete(id) { if (confirm('Remove this post from the queue?')) { removeFromQueue(id); refresh() } }

  async function handleCopyRow(post) {
    await copyRowToClipboard(post)
    setCopiedId(post.id); setTimeout(() => setCopiedId(null), 1500)
  }

  async function handleCopyAll() {
    await copyAllToClipboard(filtered)
    setCopyAllMsg('Copied!'); setTimeout(() => setCopyAllMsg(''), 1800)
  }

  const filtered = filter === 'ALL' ? queue : queue.filter(p => (p.status || 'DRAFT') === filter)

  const counts = {
    ALL:    queue.length,
    DRAFT:  queue.filter(p => (p.status || 'DRAFT') === 'DRAFT' || p.status === 'PLAN').length,
    READY:  queue.filter(p => p.status === 'READY').length,
    POSTED: queue.filter(p => p.status === 'POSTED').length,
  }

  const th = { fontSize: 11, fontWeight: 700, color: '#6B7076', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #EFEBE4', whiteSpace: 'nowrap' }
  const td = { padding: '10px 12px', fontSize: 13, color: '#3A4046', borderBottom: '1px solid #FBFAF8', verticalAlign: 'top' }

  return (
    <div style={{ fontFamily: 'Montserrat, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#14171A' }}>Post Queue</div>
          <div style={{ fontSize: 12, color: '#6B7076', marginTop: 3 }}>{queue.length} post{queue.length !== 1 ? 's' : ''} in queue</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={handleCopyAll} disabled={filtered.length === 0}
            style={{ padding: '8px 16px', background: GOLD, color: '#14171A', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: filtered.length === 0 ? 0.5 : 1 }}>
            {copyAllMsg || '📋 Copy All to Sheet'}
          </button>
          <a href={SHEET_URL} target="_blank" rel="noreferrer"
            style={{ padding: '8px 16px', background: NAVY, color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
            📊 Open Google Sheet ↗
          </a>
        </div>
      </div>

      {/* Sheet info banner */}
      <div style={{ background: '#F7EFE9', border: '1px solid #E7D9CE', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 12, color: '#7A3218', lineHeight: 1.7 }}>
        📌 <strong>Workflow:</strong> Copy rows → Paste into{' '}
        <a href={SHEET_URL} target="_blank" rel="noreferrer" style={{ color: '#7A3218', fontWeight: 700 }}>Google Sheet ↗</a>
        {' '}→ Set status to <strong>READY</strong> → Make.com posts to Facebook &amp; Instagram automatically every hour.
        <br />Sheet columns: <code style={{ background: '#fff', padding: '1px 5px', borderRadius: 4 }}>date · time · platform · campaign · caption · image_url · status · post_id</code>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {[['ALL', 'All'], ['DRAFT', 'Draft / Plan'], ['READY', 'Ready'], ['POSTED', 'Posted']].map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
            style={{
              padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
              background: filter === key ? NAVY : '#EFEBE4', color: filter === key ? '#fff' : '#3A4046',
            }}>
            {label} {counts[key] != null && <span style={{ opacity: 0.7 }}>({counts[key]})</span>}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#8A8F95' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>No posts in queue</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Generate content in Studio and save posts here.</div>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #E7E2D9', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Date', 'Time', 'Campaign', 'Platform', 'Format', 'Caption', 'Status', 'Actions'].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(post => (
                  <tr key={post.id}>
                    <td style={td}>{post.date || '—'}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>{post.suggested_time || post.time || '—'}</td>
                    <td style={td}><CampaignBadge campaign={post.campaign} /></td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>{post.platform || '—'}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      {post.format === 'carousel' ? '🎴 Carousel' : post.format === 'reel' ? '🎬 Reel' : '🖼 Single'}
                    </td>
                    <td style={{ ...td, maxWidth: 280 }}>
                      <div style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', color: '#3A4046' }}>
                        {post.caption || post.note || '—'}
                      </div>
                    </td>
                    <td style={td}>
                      <select value={post.status || 'DRAFT'} onChange={e => handleStatus(post.id, e.target.value)}
                        style={{ padding: '4px 8px', border: '1.5px solid #E4E0D9', borderRadius: 7, fontSize: 12, fontFamily: 'inherit', background: '#fff', cursor: 'pointer' }}>
                        <option value="DRAFT">DRAFT</option>
                        <option value="PLAN">PLAN</option>
                        <option value="READY">READY</option>
                        <option value="POSTED">POSTED</option>
                      </select>
                    </td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleCopyRow(post)} title="Copy row as TSV"
                          style={{ padding: '5px 10px', background: '#EFEBE4', color: '#3A4046', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                          {copiedId === post.id ? '✓' : '📋'}
                        </button>
                        {post.status !== 'POSTED' && (
                          <button onClick={() => handleStatus(post.id, 'POSTED')} title="Mark as Posted"
                            style={{ padding: '5px 10px', background: '#E9F1EC', color: '#22513B', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                            ✓ Posted
                          </button>
                        )}
                        <button onClick={() => handleDelete(post.id)} title="Remove"
                          style={{ padding: '5px 10px', background: '#FBEDEB', color: '#8E2A1F', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filtered.length > 0 && (
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={handleCopyAll}
            style={{ padding: '10px 20px', background: GOLD, color: '#14171A', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {copyAllMsg || `📋 Copy ${filtered.length} Row${filtered.length !== 1 ? 's' : ''} to Sheet`}
          </button>
          <a href={SHEET_URL} target="_blank" rel="noreferrer"
            style={{ padding: '10px 20px', background: NAVY, color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
            📊 Open Google Sheet ↗
          </a>
        </div>
      )}
    </div>
  )
}
