const QUEUE_KEY = 'tilershub_social_queue'

function newId() {
  return `post_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

export function saveToLocalQueue(post) {
  const q = getQueue()
  const entry = { ...post, id: post.id || newId(), status: post.status || 'DRAFT', saved_at: new Date().toISOString() }
  localStorage.setItem(QUEUE_KEY, JSON.stringify([...q, entry]))
  return entry
}

export function getQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') } catch { return [] }
}

export function updateStatus(id, status) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(getQueue().map(p => p.id === id ? { ...p, status } : p)))
}

export function removeFromQueue(id) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(getQueue().filter(p => p.id !== id)))
}

export function clearQueue() {
  localStorage.removeItem(QUEUE_KEY)
}

function toTSV(p) {
  return [
    p.date || '', p.suggested_time || '', p.platform || '', p.campaign || '',
    (p.caption || '').replace(/\n/g, ' '), p.image_url || '', p.status || 'DRAFT', p.id || '',
  ].join('\t')
}

function writeToClipboard(text) {
  if (navigator.clipboard) return navigator.clipboard.writeText(text)
  const el = Object.assign(document.createElement('textarea'), { value: text })
  document.body.appendChild(el); el.select(); document.execCommand('copy'); el.remove()
  return Promise.resolve()
}

export function copyRowToClipboard(post) { return writeToClipboard(toTSV(post)) }

export function copyAllToClipboard(posts) {
  const header = 'date\ttime\tplatform\tcampaign\tcaption\timage_url\tstatus\tpost_id'
  return writeToClipboard([header, ...posts.map(toTSV)].join('\n'))
}
