import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, signInWithOtp, DISTRICTS_EN } from '../lib/supabase.js'
import SocialHub from '../modules/social/SocialHub.jsx'
import { SERVICES, HOME_GROUPS } from '../lib/services.js'
import { CATEGORIES } from '../lib/categories.js'

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
  featured:       ['#EDE9FE','#5B21B6'],
  none:           ['#F3F4F6','#64748b'],
  new:            ['#FEF3C7','#92400E'],
  seen:           ['#F3F4F6','#374151'],
  draft:          ['#F3F4F6','#374151'],
  published:      ['#D1FAE5','#065F46'],
  archived:       ['#FEE2E2','#991B1B'],
}

const ALL_SERVICES = [
  'Floor Tiling', 'Wall Tiling', 'Bathroom Tiling', 'Kitchen Tiling',
  'Staircase Tiling', 'Outdoor Tiling', 'Large Tile Installation',
  'Waterproofing', 'Grouting & Finishing',
  'Tile Cutting', 'Tile Routing',
  'Bathroom Renovation', 'Full Construction',
  'Bathroom Plumbing', 'Shower Cubicle',
  'Hand Railing', 'Vanity Cupboard',
  'Bathroom Lighting', 'Bathroom Wiring', 'Electrical Works',
  'Ipanel Ceiling',
]

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
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
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

// ─── Shared form helpers ──────────────────────────────────────────────────────
function lbl() {
  return { display: 'block', fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 7 }
}
function inp(hasError) {
  return { width: '100%', padding: '10px 13px', border: `1.5px solid ${hasError ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 10, fontSize: 13, outline: 'none', fontFamily: 'inherit', background: hasError ? '#fef2f2' : '#fff', boxSizing: 'border-box' }
}
function Chip({ label, checked, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${checked ? NAVY : '#e2e8f0'}`, background: checked ? '#eef3fb' : '#fff', color: checked ? NAVY : '#64748b' }}>
      {checked ? '✓ ' : ''}{label}
    </button>
  )
}
function toggleArr(arr, val) {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
}
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')
}
async function uploadImage(file, folder, prefix) {
  const ext = file.name.split('.').pop()
  const path = `${folder}/${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('provider-assets').upload(path, file, { upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('provider-assets').getPublicUrl(path)
  return data.publicUrl
}

function ImageUploadBox({ label, hint, value, onChange, aspect }) {
  const ref = useRef(null)
  const [preview, setPreview] = useState(value || null)
  const [dragging, setDragging] = useState(false)
  function handle(file) {
    if (!file || !file.type.startsWith('image/')) return
    onChange(file)
    setPreview(URL.createObjectURL(file))
  }
  const height = aspect === 'cover' ? 120 : 90
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={lbl()}>{label}</div>
      <div onClick={() => ref.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]) }}
        style={{ position: 'relative', height, borderRadius: 10, border: `2px dashed ${dragging ? NAVY : '#cbd5e1'}`, background: dragging ? '#eef3fb' : preview ? '#000' : '#f8fafc', cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {preview ? (
          <>
            <img src={preview} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
            <div style={{ position: 'relative', zIndex: 1, background: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: 8, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>Click to change</div>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 11, pointerEvents: 'none' }}>
            <div style={{ fontSize: 18, marginBottom: 3 }}>{aspect === 'cover' ? '🖼️' : '👤'}</div>
            Click or drag to upload
          </div>
        )}
      </div>
      {hint && <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{hint}</p>}
      <input ref={ref} type="file" accept="image/*" onChange={e => handle(e.target.files[0])} style={{ display: 'none' }} />
    </div>
  )
}

function GalleryEditor({ existing, newFiles, onNewFiles, onRemoveExisting }) {
  const ref = useRef(null)
  const MAX = 8
  function addFiles(files) {
    const combined = [...newFiles, ...Array.from(files)].slice(0, MAX - existing.length)
    onNewFiles(combined)
  }
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={lbl()}>Gallery / Portfolio <span style={{ fontSize: 10, color: '#94a3b8', textTransform: 'none', fontWeight: 400 }}>(up to {MAX})</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(80px,1fr))', gap: 6, marginBottom: 6 }}>
        {existing.map((url, i) => (
          <div key={url} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button type="button" onClick={() => onRemoveExisting(i)} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
        ))}
        {newFiles.map((f, i) => (
          <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid #bbf7d0' }}>
            <img src={URL.createObjectURL(f)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button type="button" onClick={() => onNewFiles(newFiles.filter((_,j) => j!==i))} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
        ))}
        {(existing.length + newFiles.length) < MAX && (
          <div onClick={() => ref.current?.click()} style={{ aspectRatio: '1', borderRadius: 8, border: '2px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#f8fafc' }}>
            <span style={{ fontSize: 18, color: '#94a3b8' }}>+</span>
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" multiple onChange={e => addFiles(e.target.files)} style={{ display: 'none' }} />
    </div>
  )
}

// ─── Profile create/edit modal ────────────────────────────────────────────────
function ProfileModal({ profile, profileType, adminUserId, onClose, onSaved }) {
  const isNarrow = typeof window !== 'undefined' && window.innerWidth < 768
  const isCreate = !profile

  const [name,       setName]       = useState(profile?.name || '')
  const [profType,   setProfType]   = useState(profile?.provider_type || 'tiler')
  const [whatsapp,   setWhatsapp]   = useState(profile?.whatsapp || '')
  const [city,       setCity]       = useState(profile?.city || '')
  const [district,   setDistrict]   = useState(profile?.district || '')
  const [bio,        setBio]        = useState(profile?.description || '')
  const [services,   setServices]   = useState(profile?.services || [])
  const [svcAreas,   setSvcAreas]   = useState(profile?.service_areas || [])
  const [expYears,   setExpYears]   = useState(profile?.experience_years ?? '')
  const [rateMin,    setRateMin]    = useState(profile?.daily_rate_min ?? '')
  const [rateMax,    setRateMax]    = useState(profile?.daily_rate_max ?? '')
  const [website,    setWebsite]    = useState(profile?.website_url || '')
  const [badge,      setBadge]      = useState(profile?.verification_status || 'listed')
  const [existingGallery, setExistingGallery] = useState(profile?.gallery || [])
  const [newGalleryFiles, setNewGalleryFiles] = useState([])
  const [profileImageFile, setProfileImageFile] = useState(null)
  const [coverImageFile,   setCoverImageFile]   = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [err,        setErr]        = useState('')

  const [customSvc, setCustomSvc] = useState('')
  function addCustomSvc() {
    const s = customSvc.trim()
    if (s && !services.includes(s)) setServices(prev => [...prev, s])
    setCustomSvc('')
  }

  async function save() {
    if (!name.trim())     { setErr('Name is required'); return }
    if (!whatsapp.trim()) { setErr('WhatsApp number is required'); return }
    if (!city.trim())     { setErr('City is required'); return }
    setSaving(true); setErr('')
    try {
      const prefix = `admin-${adminUserId?.slice(0,8) || 'admin'}`
      let profileImageUrl, coverImageUrl
      const newGalleryUrls = []
      if (profileImageFile) profileImageUrl = await uploadImage(profileImageFile, 'profiles', prefix)
      if (coverImageFile)   coverImageUrl   = await uploadImage(coverImageFile,   'covers',   prefix)
      for (const f of newGalleryFiles) newGalleryUrls.push(await uploadImage(f, 'portfolio', prefix))

      const payload = {
        name: name.trim(),
        whatsapp: whatsapp.replace(/\s/g,''),
        city: city.trim(),
        district: district || null,
        description: bio.trim() || null,
        services: services.length ? services : null,
        service_areas: svcAreas.length ? svcAreas : null,
        gallery: [...existingGallery, ...newGalleryUrls],
        experience_years: expYears !== '' ? parseInt(expYears,10)||null : null,
        daily_rate_min:   rateMin  !== '' ? parseInt(rateMin,10)||null  : null,
        daily_rate_max:   rateMax  !== '' ? parseInt(rateMax,10)||null  : null,
        verification_status: badge,
        website_url: website.trim() || null,
        provider_type: profType,
      }
      if (profileImageUrl !== undefined) payload.profile_image = profileImageUrl
      if (coverImageUrl   !== undefined) payload.cover_image   = coverImageUrl

      if (isCreate) {
        payload.slug = slugify(name.trim()) + '-' + Math.random().toString(36).slice(2,6)
        const { error } = await supabase.from('providers').insert(payload)
        if (error) throw error
      } else {
        const { error } = await supabase.from('providers').update(payload).eq('id', profile.id)
        if (error) throw error
      }
      onSaved()
    } catch(e) {
      setErr(e?.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ flex: 1, background: 'rgba(15,23,42,0.5)' }} onClick={onClose} />
      <div style={{ width: isNarrow ? '100vw' : 520, maxWidth: '100vw', background: '#fff', overflowY: 'auto', boxShadow: '-4px 0 30px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', borderRadius: isNarrow ? 0 : undefined }}>
        {/* Drawer header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: '#fff', position: 'sticky', top: 0, zIndex: 1 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              {isCreate ? 'Create Provider' : 'Edit Provider'}
            </div>
            {!isCreate && profile?.slug && (
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>/{profile.slug}</div>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8', padding: 4 }}>✕</button>
        </div>

        {/* Drawer body */}
        <div style={{ padding: '20px 24px', flex: 1 }}>
          {/* Images */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 12 }}>
            <ImageUploadBox label="Profile Photo" aspect="profile"
              value={profile?.profile_image} onChange={setProfileImageFile} />
            <ImageUploadBox label="Cover Image" aspect="cover"
              value={profile?.cover_image} onChange={setCoverImageFile} />
          </div>

          {/* Name */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl()}>Name / Company *</label>
            <input value={name} onChange={e => setName(e.target.value)} style={inp(!name && err)} placeholder="Business or person name" />
          </div>

          {/* Profession */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl()}>Profession</label>
            <select value={profType} onChange={e => setProfType(e.target.value)} style={{ ...inp(false), WebkitAppearance: 'none', cursor: 'pointer' }}>
              <option value="tiler">Tiler</option>
              <option value="contractor">Contractor</option>
              <option value="electrician">Electrician</option>
              <option value="plumber">Plumber</option>
              <option value="carpenter">Carpenter</option>
              <option value="painter">Painter</option>
              <option value="mason">Mason / Bricklayer</option>
              <option value="construction_company">Construction Company</option>
              <option value="interior_designer">Interior Designer</option>
              <option value="tile_shop">Tile Shop</option>
              <option value="bathroom_shop">Bathroom Shop</option>
              <option value="supplier">Supplier</option>
              <option value="workshop">Workshop</option>
              <option value="brand_dealer">Brand Dealer</option>
              <option value="tool_supplier">Tool Supplier</option>
            </select>
          </div>

          {/* City + District */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={lbl()}>City *</label>
              <input value={city} onChange={e => setCity(e.target.value)} style={inp(!city && err)} placeholder="e.g. Colombo" />
            </div>
            <div>
              <label style={lbl()}>District</label>
              <select value={district} onChange={e => setDistrict(e.target.value)} style={{ ...inp(false), WebkitAppearance: 'none', cursor: 'pointer' }}>
                <option value="">Select…</option>
                {DISTRICTS_EN.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* WhatsApp */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl()}>WhatsApp *</label>
            <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} style={inp(!whatsapp && err)} placeholder="+94771234567" type="tel" />
          </div>

          {/* Experience + Rate */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={lbl()}>Experience (years)</label>
              <input value={expYears} onChange={e => setExpYears(e.target.value)} style={inp(false)} placeholder="e.g. 8" type="number" min="0" />
            </div>
            <div>
              <label style={lbl()}>Rate Min (Rs/sqft)</label>
              <input value={rateMin} onChange={e => setRateMin(e.target.value)} style={inp(false)} placeholder="e.g. 180" type="number" min="0" />
            </div>
            <div>
              <label style={lbl()}>Rate Max (Rs/sqft)</label>
              <input value={rateMax} onChange={e => setRateMax(e.target.value)} style={inp(false)} placeholder="e.g. 300" type="number" min="0" />
            </div>
          </div>

          {/* Website + Badge */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={lbl()}>Website URL</label>
              <input value={website} onChange={e => setWebsite(e.target.value)} style={inp(false)} placeholder="https://…" type="url" />
            </div>
            <div>
              <label style={lbl()}>Verification Badge</label>
              <select value={badge} onChange={e => setBadge(e.target.value)} style={{ ...inp(false), WebkitAppearance: 'none', cursor: 'pointer' }}>
                <option value="listed">Listed</option>
                <option value="th_verified">TH Verified</option>
                <option value="th_certified_pro">Certified Pro</option>
                <option value="th_master">TH Master</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl()}>Description</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
              placeholder="Profile description…"
              style={{ ...inp(false), resize: 'vertical' }} />
          </div>

          {/* Services */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl()}>Services</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {ALL_SERVICES.map(s => (
                <Chip key={s} label={s} checked={services.includes(s)} onClick={() => setServices(p => toggleArr(p, s))} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={customSvc} onChange={e => setCustomSvc(e.target.value)}
                onKeyDown={e => { if (e.key==='Enter'){e.preventDefault();addCustomSvc()} }}
                placeholder="Add custom service…"
                style={{ flex:1, padding:'7px 12px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:12, outline:'none', fontFamily:'inherit' }} />
              <button type="button" onClick={addCustomSvc} style={{ padding:'7px 12px', background:'#eef3fb', color:NAVY, border:`1.5px solid #d5e2f5`, borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer' }}>+ Add</button>
            </div>
            {services.filter(s => !ALL_SERVICES.includes(s)).length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:6 }}>
                {services.filter(s => !ALL_SERVICES.includes(s)).map(s => (
                  <span key={s} style={{ fontSize:11, padding:'3px 10px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:20, color:'#15803d', fontWeight:600, display:'flex', alignItems:'center', gap:5 }}>
                    {s}
                    <button type="button" onClick={() => setServices(p => p.filter(x=>x!==s))} style={{ background:'none', border:'none', cursor:'pointer', color:'#15803d', padding:0, fontSize:12, lineHeight:1 }}>✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Service Areas */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl()}>Service Areas</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {DISTRICTS_EN.map(d => (
                <Chip key={d} label={d} checked={svcAreas.includes(d)} onClick={() => setSvcAreas(p => toggleArr(p, d))} />
              ))}
            </div>
          </div>

          {/* Gallery */}
          <GalleryEditor
            existing={existingGallery}
            newFiles={newGalleryFiles}
            onNewFiles={setNewGalleryFiles}
            onRemoveExisting={i => setExistingGallery(prev => prev.filter((_,j) => j!==i))}
          />

          {err && (
            <div style={{ padding:'10px 14px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, fontSize:13, color:'#dc2626', marginBottom:14 }}>
              ⚠ {err}
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div style={{ padding:'16px 24px', borderTop:'1px solid #f1f5f9', display:'flex', gap:10, background:'#fff', flexShrink:0, position:'sticky', bottom:0 }}>
          <button onClick={save} disabled={saving}
            style={{ flex:1, padding:'12px', background: saving ? '#94a3b8' : NAVY, color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? '⏳ Saving…' : isCreate ? '✓ Create Profile' : '💾 Save Changes'}
          </button>
          <button onClick={onClose} disabled={saving}
            style={{ padding:'12px 18px', background:'#f1f5f9', color:'#334155', border:'1px solid #e2e8f0', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
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
      supabase.from('providers').select('id', { count: 'exact', head: true }),
    ]).then(([pend, claims, activeProj, newBids, totalProj, totalSub, totalProviders]) => {
      setStats({
        pendingSubmissions: pend.count ?? 0,
        pendingClaims:      claims.count ?? 0,
        activeProjects:     activeProj.count ?? 0,
        newBids:            newBids.count ?? 0,
        totalProjects:      totalProj.count ?? 0,
        totalSubmissions:   totalSub.count ?? 0,
        totalProviders:     totalProviders.count ?? 0,
      })
    })
  }, [])

  const cards = stats ? [
    { label: 'Pending Submissions', value: stats.pendingSubmissions, color: stats.pendingSubmissions > 0 ? TERRA : '#64748b', emoji: '📝' },
    { label: 'Pending Claims',      value: stats.pendingClaims,      color: stats.pendingClaims > 0 ? '#f59e0b' : '#64748b', emoji: '📲' },
    { label: 'Active Projects',     value: stats.activeProjects,     color: '#16a34a', emoji: '📋' },
    { label: 'New Bids',            value: stats.newBids,            color: stats.newBids > 0 ? TERRA : '#64748b', emoji: '💬' },
    { label: 'Total Providers',      value: stats.totalProviders,     color: NAVY, emoji: '👷' },
    { label: 'Total Projects',      value: stats.totalProjects,      color: '#64748b', emoji: '📊' },
    { label: 'Total Submissions',   value: stats.totalSubmissions,   color: '#64748b', emoji: '👥' },
  ] : []

  return (
    <div>
      <h2 style={S.h2}>Overview</h2>
      {!stats ? <p style={{ color: '#94a3b8' }}>Loading…</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 14 }}>
          {cards.map(c => (
            <div key={c.label} style={{ ...S.card, textAlign: 'center' }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{c.emoji}</div>
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
  const [rows, setRows]           = useState([])
  const [filter, setFilter]       = useState('pending_review')
  const [loading, setLoading]     = useState(true)
  const [page, setPage]           = useState(0)
  const [count, setCount]         = useState(0)
  const [approveError, setApproveError] = useState(null)
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

  async function listProvider(sub) {
    setApproveError(null)
    await supabase.from('provider_submissions').update({ status: 'approved' }).eq('id', sub.id)

    // Check for existing provider to avoid duplicates
    let existing = null
    if (sub.user_id) {
      const { data } = await supabase.from('providers').select('id').eq('user_id', sub.user_id).maybeSingle()
      existing = data
    }
    if (!existing && sub.whatsapp) {
      const { data } = await supabase.from('providers').select('id')
        .eq('whatsapp', sub.whatsapp).eq('name', sub.name).maybeSingle()
      existing = data
    }

    if (!existing) {
      const slug = slugify(sub.name || 'provider') + '-' + Math.random().toString(36).slice(2, 6)
      const { data: inserted, error: insertError } = await supabase.from('providers').insert({
        name:                sub.name,
        provider_type:       sub.provider_type,
        city:                sub.city,
        district:            sub.district,
        whatsapp:            sub.whatsapp,
        phone:               sub.phone,
        description:         sub.description,
        profile_image:       sub.profile_image,
        cover_image:         sub.cover_image,
        gallery:             sub.photo_urls || null,
        service_areas:       sub.service_areas,
        services:            sub.services,
        user_id:             sub.user_id,
        slug,
        status:              'active',
        verification_status: 'none',
      }).select('id')
      if (insertError) {
        setApproveError(`Provider created in submissions but failed to add to directory: ${insertError.message}`)
        load()
        return
      }
      if (!inserted || inserted.length === 0) {
        setApproveError('Provider approved but directory insert was blocked. Check Supabase RLS policies.')
        load()
        return
      }
    }
    load()
  }

  const FILTERS = ['all','pending_review','approved','rejected']

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
      {approveError && (
        <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
          ⚠ {approveError}
        </p>
      )}
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
                      {r.status !== 'approved'  && <button onClick={() => listProvider(r)}                      style={S.btn('#16a34a')}>✓ Approve</button>}
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
  const [rows, setRows]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [page, setPage]           = useState(0)
  const [count, setCount]         = useState(0)
  const PER = 20

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    const { data, error, count: c } = await supabase.from('reviews').select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PER, page * PER + PER - 1)
    if (error) {
      console.error('reviews load error:', error)
      setLoadError(error.message)
    } else {
      setRows(data || [])
      setCount(c || 0)
    }
    setLoading(false)
  }, [page])

  useEffect(() => { load() }, [load])

  async function del(id) {
    if (!confirm('Delete this review?')) return
    setDeleteError(null)
    const { data: deleted, error } = await supabase
      .from('reviews').delete().eq('id', id).select('id')
    if (error) {
      setDeleteError('Delete failed: ' + error.message)
      return
    }
    if (!deleted || deleted.length === 0) {
      setDeleteError('Review was not deleted — your session may have expired. Please refresh the page and sign in again.')
      return
    }
    await load()
  }

  function Stars({ n }) {
    return <span style={{ color: '#f59e0b' }}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>
  }

  return (
    <div>
      <h2 style={S.h2}>Reviews</h2>
      {loading ? <p style={{ color: '#94a3b8' }}>Loading…</p> : (
        <>
          {loadError && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>Error loading reviews: {loadError}</p>}
          {deleteError && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>{deleteError}</p>}
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
                    {r.tiler_id && <span style={{ fontSize: 11, color: '#64748b' }}>Professional</span>}
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

// ─── Profiles tab ─────────────────────────────────────────────────────────────
function ProfilesTab({ adminUserId }) {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [page,    setPage]    = useState(0)
  const [count,   setCount]   = useState(0)
  const [search,  setSearch]  = useState('')
  const [editProfile, setEditProfile] = useState(null)
  const [creating,    setCreating]    = useState(false)
  const PER = 20

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    let q = supabase.from('providers').select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PER, page * PER + PER - 1)
    if (search.trim()) q = q.ilike('name', `%${search.trim()}%`)
    const { data, error, count: c } = await q
    if (error) {
      console.error('profiles load error:', error)
      setLoadError(error.message)
    } else {
      setRows(data || [])
      setCount(c || 0)
    }
    setLoading(false)
  }, [page, search])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(0) }, [search])

  async function del(id) {
    if (!confirm('Permanently delete this provider profile? This cannot be undone.')) return
    await supabase.from('providers').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <h2 style={{ ...S.h2, marginBottom: 0 }}>Profiles</h2>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name…"
          style={{ padding: '7px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, outline: 'none', fontFamily: 'inherit', minWidth: 180 }} />
        <button onClick={() => setCreating(true)} style={{ ...S.btn('#16a34a'), marginLeft: 'auto' }}>
          + New Provider
        </button>
      </div>

      {loadError && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>Error loading profiles: {loadError}</p>}
      {loading ? <p style={{ color: '#94a3b8' }}>Loading…</p> : (
        <>
          <div style={S.card}>
            <Table
              heads={['Name','Profession','City','WhatsApp','Services','Badge','Actions']}
              empty={rows.length === 0 ? 'No providers found' : null}
            >
              {rows.map(r => (
                <tr key={r.id}>
                  <td style={S.td}>
                    <strong>{r.name}</strong>
                    {r.slug && <div style={{ fontSize: 10, color: '#94a3b8' }}>/{r.slug}</div>}
                  </td>
                  <td style={S.td}>
                    <span style={{ fontSize: 10, padding: '2px 8px', background: '#eef3fb', color: NAVY, borderRadius: 20, fontWeight: 700 }}>
                      {(r.provider_type || '').replace(/_/g,' ')}
                    </span>
                  </td>
                  <td style={S.td}>{r.city}{r.district ? `, ${r.district}` : ''}</td>
                  <td style={S.td}>
                    <a href={`https://wa.me/${(r.whatsapp||'').replace(/\D/g,'')}`} target="_blank" rel="noopener"
                      style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none', fontSize: 12 }}>
                      {r.whatsapp}
                    </a>
                  </td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                      {(r.services||[]).slice(0,2).map(s => (
                        <span key={s} style={{ fontSize: 10, padding: '2px 6px', background: '#eef3fb', color: NAVY, borderRadius: 8, fontWeight: 600 }}>{s}</span>
                      ))}
                      {(r.services||[]).length > 2 && <span style={{ fontSize: 10, color: '#94a3b8' }}>+{r.services.length-2}</span>}
                    </div>
                  </td>
                  <td style={S.td}><StatusBadge status={r.verification_status || 'listed'} /></td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button
                        onClick={() => setEditProfile(r)}
                        style={S.btn(NAVY)}>✏️ Edit</button>
                      {r.slug && (
                        <a href={`/providers/${r.slug}`} target="_blank" rel="noopener"
                          style={{ ...S.btn('#f1f5f9','#334155'), textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>🔗</a>
                      )}
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

      {editProfile && (
        <ProfileModal
          profile={editProfile}
          profileType="provider"
          adminUserId={adminUserId}
          onClose={() => setEditProfile(null)}
          onSaved={() => { setEditProfile(null); load() }}
        />
      )}

      {creating && (
        <ProfileModal
          profile={null}
          profileType="provider"
          adminUserId={adminUserId}
          onClose={() => setCreating(false)}
          onSaved={() => { setCreating(false); load() }}
        />
      )}
    </div>
  )
}

// ─── Blogs tab ────────────────────────────────────────────────────────────────
function BlogsTab() {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [page,    setPage]    = useState(0)
  const [count,   setCount]   = useState(0)
  const [filter,  setFilter]  = useState('all')
  const PER = 20

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('blogs')
      .select('id,title,slug,status,created_at,updated_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PER, page * PER + PER - 1)
    if (filter !== 'all') q = q.eq('status', filter)
    const { data, count: c } = await q
    setRows(data || [])
    setCount(c || 0)
    setLoading(false)
  }, [page, filter])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(0) }, [filter])

  async function del(id, title) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    await supabase.from('blogs').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <h2 style={{ ...S.h2, marginBottom: 0 }}>Blogs</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'draft', 'published', 'archived'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={S.btn(filter === f ? NAVY : '#f1f5f9', filter === f ? '#fff' : '#334155')}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <a href="/admin/new-blog" target="_blank" rel="noopener"
          style={{ ...S.btn('#16a34a'), marginLeft: 'auto', textDecoration: 'none' }}>
          + New Blog
        </a>
      </div>

      {loading ? <p style={{ color: '#94a3b8' }}>Loading…</p> : (
        <>
          <div style={S.card}>
            <Table
              heads={['Title', 'Slug', 'Status', 'Created', 'Updated', 'Actions']}
              empty={rows.length === 0 ? 'No blog posts found' : null}
            >
              {rows.map(r => (
                <tr key={r.id}>
                  <td style={{ ...S.td, maxWidth: 260 }}><strong>{r.title}</strong></td>
                  <td style={{ ...S.td, fontSize: 11, color: '#64748b' }}>/blog/{r.slug}</td>
                  <td style={S.td}><StatusBadge status={r.status} /></td>
                  <td style={S.td}>{timeAgo(r.created_at)}</td>
                  <td style={S.td}>{timeAgo(r.updated_at)}</td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <a href={`/admin/edit-blog/${r.id}`} target="_blank" rel="noopener"
                        style={{ ...S.btn(NAVY), textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                        ✏️ Edit
                      </a>
                      {r.status === 'published' && (
                        <a href={`/blog/${r.slug}`} target="_blank" rel="noopener"
                          style={{ ...S.btn('#f1f5f9', '#334155'), textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                          🔗
                        </a>
                      )}
                      <button onClick={() => del(r.id, r.title)} style={S.btn('#fef2f2', '#dc2626')}>🗑</button>
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

// ─── Services tab ────────────────────────────────────────────────────────────
function ServicesTab() {
  return (
    <div>
      <h2 style={S.h2}>Services ({SERVICES.length})</h2>
      <Table heads={['Icon', 'Label', 'Slug', 'Link']}>
        {SERVICES.map(s => (
          <tr key={s.slug}>
            <td style={S.td}>{s.icon}</td>
            <td style={S.td}>{s.label}</td>
            <td style={{ ...S.td, fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>{s.slug}</td>
            <td style={S.td}>
              <a href={`/services/${s.slug}`} target="_blank" rel="noopener" style={{ color: TERRA, fontSize: 12, fontWeight: 600 }}>/services/{s.slug} ›</a>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

// ─── Categories tab ──────────────────────────────────────────────────────────
function CategoriesTab() {
  return (
    <div>
      <h2 style={S.h2}>Categories ({CATEGORIES.length})</h2>
      <Table heads={['Icon', 'Label', 'Slug', 'Description', 'Link']}>
        {CATEGORIES.map(c => (
          <tr key={c.slug}>
            <td style={S.td}>{c.icon}</td>
            <td style={S.td}>{c.label}</td>
            <td style={{ ...S.td, fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>{c.slug}</td>
            <td style={{ ...S.td, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#64748b' }}>{c.description || '—'}</td>
            <td style={S.td}>
              <a href={`/categories/${c.slug}`} target="_blank" rel="noopener" style={{ color: TERRA, fontSize: 12, fontWeight: 600 }}>/categories/{c.slug} ›</a>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

// ─── Users tab ───────────────────────────────────────────────────────────────
function UsersTab() {
  const [rows, setRows]     = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [page, setPage]     = useState(0)
  const [count, setCount]   = useState(0)
  const PER = 25

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    const { data, error, count: c } = await supabase
      .from('providers')
      .select('id,name,provider_type,status,whatsapp,created_at,user_id', { count: 'exact' })
      .not('user_id', 'is', null)
      .order('created_at', { ascending: false })
      .range(page * PER, page * PER + PER - 1)
    if (error) {
      setLoadError(error.message)
    } else {
      setRows(data || [])
      setCount(c || 0)
    }
    setLoading(false)
  }, [page])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <h2 style={S.h2}>Provider-linked Users ({count})</h2>
      {loadError && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>Error: {loadError}</p>}
      {loading ? <p style={{ color: '#94a3b8' }}>Loading…</p> : (
        <>
          <Table
            heads={['Name', 'Type', 'Status', 'WhatsApp', 'Joined']}
            empty={rows.length === 0 ? 'No provider-linked users found' : undefined}
          >
            {rows.map(r => (
              <tr key={r.id}>
                <td style={S.td}>{r.name}</td>
                <td style={S.td}><StatusBadge status={r.provider_type} /></td>
                <td style={S.td}><StatusBadge status={r.status} /></td>
                <td style={{ ...S.td, fontFamily: 'monospace', fontSize: 11 }}>{r.whatsapp || '—'}</td>
                <td style={{ ...S.td, color: '#94a3b8' }}>{timeAgo(r.created_at)}</td>
              </tr>
            ))}
          </Table>
          <Pagination page={page} setPage={setPage} count={count} perPage={PER} />
        </>
      )}
    </div>
  )
}

// ─── Analytics tab ───────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [stats, setStats] = useState(null)
  const [typeBreakdown, setTypeBreakdown] = useState([])

  useEffect(() => {
    Promise.all([
      supabase.from('providers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('projects').select('id', { count: 'exact', head: true }),
      supabase.from('bids').select('id', { count: 'exact', head: true }),
      supabase.from('provider_submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
      supabase.from('providers').select('provider_type').eq('status', 'active'),
    ]).then(([activeP, totalProj, totalBids, pendingSubs, types]) => {
      setStats({
        activeProviders: activeP.count ?? 0,
        totalProjects:   totalProj.count ?? 0,
        totalBids:       totalBids.count ?? 0,
        pendingReview:   pendingSubs.count ?? 0,
      })
      const counts = {}
      for (const row of (types.data || [])) {
        const t = row.provider_type || 'unknown'
        counts[t] = (counts[t] || 0) + 1
      }
      setTypeBreakdown(Object.entries(counts).sort((a, b) => b[1] - a[1]))
    })
  }, [])

  const cards = stats ? [
    { label: 'Active Providers', value: stats.activeProviders, emoji: '👷', color: NAVY },
    { label: 'Total Projects',   value: stats.totalProjects,   emoji: '📋', color: '#16a34a' },
    { label: 'Total Bids',       value: stats.totalBids,       emoji: '💬', color: '#7c3aed' },
    { label: 'Pending Review',   value: stats.pendingReview,   emoji: '📝', color: stats?.pendingReview > 0 ? TERRA : '#64748b' },
  ] : []

  const maxCount = typeBreakdown[0]?.[1] || 1

  return (
    <div>
      <h2 style={S.h2}>Analytics</h2>
      {!stats ? <p style={{ color: '#94a3b8' }}>Loading…</p> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 14, marginBottom: 28 }}>
            {cards.map(c => (
              <div key={c.label} style={{ ...S.card, textAlign: 'center' }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{c.emoji}</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: c.color }}>{c.value}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{c.label}</div>
              </div>
            ))}
          </div>
          {typeBreakdown.length > 0 && (
            <div style={S.card}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Provider Type Breakdown</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {typeBreakdown.map(([type, cnt]) => (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 140, fontSize: 12, color: '#374151', flexShrink: 0 }}>{type.replace(/_/g, ' ')}</div>
                    <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 4, height: 14, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: NAVY, borderRadius: 4, width: `${(cnt / maxCount) * 100}%` }} />
                    </div>
                    <div style={{ width: 30, fontSize: 12, fontWeight: 700, color: '#334155', textAlign: 'right', flexShrink: 0 }}>{cnt}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Main AdminDashboard ───────────────────────────────────────────────────────
const TABS = [
  { key: 'overview',     label: '📊 Overview' },
  { key: 'profiles',     label: '👥 Profiles' },
  { key: 'submissions',  label: '📝 Submissions' },
  { key: 'claims',       label: '📲 Claims' },
  { key: 'projects',     label: '📋 Projects' },
  { key: 'bids',         label: '💬 Bids' },
  { key: 'reviews',      label: '⭐ Reviews' },
  { key: 'social_hub',   label: '📣 Social Hub', badge: 'NEW' },
  { key: 'blogs',        label: '✍️ Blogs' },
  { key: 'services',     label: '🔧 Services' },
  { key: 'categories',   label: '📂 Categories' },
  { key: 'users',        label: '👤 Users' },
  { key: 'analytics',    label: '📈 Analytics' },
]

const GOLD = '#E8B341'
const ADMIN_EMAILS = ['tilershub@gmail.com']

export default function AdminDashboard({ initialUser }) {
  const [loading,   setLoading]   = useState(!initialUser)
  const [user,      setUser]      = useState(initialUser ?? null)
  const [isAdmin,   setIsAdmin]   = useState(initialUser ? ADMIN_EMAILS.includes(initialUser.email) : null)
  const [tab,       setTab]       = useState('overview')
  const [isMobile,  setIsMobile]  = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)

  useEffect(() => {
    if (initialUser) return // server already verified auth
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u)
      setIsAdmin(u ? ADMIN_EMAILS.includes(u.email) : false)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u !== null) setIsAdmin(ADMIN_EMAILS.includes(u.email))
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
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
    <div style={{ ...S.page, display: isMobile ? 'block' : 'flex' }}>

      {/* Desktop sidebar — hidden on mobile */}
      {!isMobile && (
        <aside style={S.sidebar}>
          <div style={{ padding: '24px 20px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1, marginBottom: 2 }}>TILERS<span style={{ color: TERRA }}>HUB</span></div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 1 }}>ADMIN</div>
          </div>

          <nav style={{ flex: 1, padding: '0 10px' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', textAlign: 'left',
                  padding: '10px 14px', borderRadius: 10, marginBottom: 3,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
                  background: tab === t.key ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: tab === t.key ? '#fff' : 'rgba(255,255,255,0.55)',
                }}>
                <span>{t.label}</span>
                {t.badge && (
                  <span style={{ fontSize: 9, fontWeight: 800, background: GOLD, color: '#0f172a', padding: '2px 7px', borderRadius: 20, flexShrink: 0 }}>
                    {t.badge}
                  </span>
                )}
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
      )}

      <main style={{
        ...S.main,
        padding: isMobile ? '16px 14px' : '28px 32px',
        paddingBottom: isMobile ? 72 : undefined,
      }}>
        {tab === 'overview'    && <OverviewTab />}
        {tab === 'profiles'    && <ProfilesTab adminUserId={user.id} />}
        {tab === 'submissions' && <SubmissionsTab />}
        {tab === 'claims'      && <ClaimsTab />}
        {tab === 'projects'    && <ProjectsTab />}
        {tab === 'bids'        && <BidsTab />}
        {tab === 'reviews'     && <ReviewsTab />}
        {tab === 'social_hub'  && <SocialHub />}
        {tab === 'blogs'       && <BlogsTab />}
        {tab === 'services'    && <ServicesTab />}
        {tab === 'categories'  && <CategoriesTab />}
        {tab === 'users'       && <UsersTab />}
        {tab === 'analytics'   && <AnalyticsTab />}
      </main>

      {/* Mobile bottom nav bar — replaces sidebar on small screens */}
      {isMobile && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          background: NAVY, display: 'flex', overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '6px 4px', gap: 2,
          boxShadow: '0 -2px 16px rgba(0,0,0,0.2)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          {TABS.map(t => {
            const parts = t.label.split(' ')
            const icon = parts[0]
            const label = parts.slice(1).join(' ')
            return (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 2, padding: '5px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: tab === t.key ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: tab === t.key ? '#fff' : 'rgba(255,255,255,0.45)',
              }}>
                <span style={{ fontSize: 17 }}>{icon}</span>
                <span style={{ fontSize: 9, fontWeight: 700, whiteSpace: 'nowrap' }}>{label}</span>
              </button>
            )
          })}
          <button
            onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
            style={{
              flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 2, padding: '5px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'transparent', color: 'rgba(255,255,255,0.35)',
            }}>
            <span style={{ fontSize: 17 }}>↩</span>
            <span style={{ fontSize: 9, fontWeight: 700, whiteSpace: 'nowrap' }}>Exit</span>
          </button>
        </nav>
      )}
    </div>
  )
}
