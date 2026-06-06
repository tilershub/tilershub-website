import { useState, useEffect, useRef } from 'react'
import { supabase, DISTRICTS_EN } from '../lib/supabase.js'

// ─── All constants & helpers outside component (prevents keyboard-dismiss remount) ───

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

const DESC_PLACEHOLDER = 'Describe your services, experience, and area of operation...'

function Field({ label, id, req, error, hint, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label htmlFor={id} style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 7 }}>
        {label}{req && <span style={{ color: '#E05A2B', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && !error && <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 5, lineHeight: 1.5 }}>{hint}</p>}
      {error && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 5 }}>⚠ {error}</p>}
    </div>
  )
}

function inputStyle(hasError) {
  return {
    width: '100%', padding: '11px 14px',
    border: `1.5px solid ${hasError ? '#fca5a5' : '#e2e8f0'}`,
    borderRadius: 10, fontSize: 13, outline: 'none', fontFamily: 'inherit',
    background: hasError ? '#fef2f2' : '#fff', transition: 'border-color 0.2s', boxSizing: 'border-box',
  }
}

function Chip({ label, checked, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
        border: `1.5px solid ${checked ? '#1B3A6B' : '#e2e8f0'}`,
        background: checked ? '#eef3fb' : '#fff',
        color: checked ? '#1B3A6B' : '#64748b',
        transition: 'all 0.15s',
      }}
    >
      {checked ? '✓ ' : ''}{label}
    </button>
  )
}

function ImageUpload({ label, hint, aspectRatio, value, onChange }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    onChange(file)
    setPreview(URL.createObjectURL(file))
  }

  function onInputChange(e) { handleFile(e.target.files[0]) }
  function onDrop(e) { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }

  const height = aspectRatio === 'cover' ? 130 : 100

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 7 }}>{label}</div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          position: 'relative', height, borderRadius: 12, border: `2px dashed ${dragging ? '#1B3A6B' : '#cbd5e1'}`,
          background: dragging ? '#eef3fb' : preview ? '#000' : '#f8fafc',
          cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}
      >
        {preview ? (
          <>
            <img src={preview} alt="preview" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
            <div style={{ position: 'relative', zIndex: 1, background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 600 }}>
              Click to change
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8', pointerEvents: 'none' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{aspectRatio === 'cover' ? '🖼️' : '👤'}</div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Click or drag to upload</div>
            <div style={{ fontSize: 10, marginTop: 2 }}>JPG, PNG, WebP · Max 5 MB</div>
          </div>
        )}
      </div>
      {hint && <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 5, lineHeight: 1.5 }}>{hint}</p>}
      <input ref={inputRef} type="file" accept="image/*" onChange={onInputChange} style={{ display: 'none' }} />
    </div>
  )
}

const MAX_PORTFOLIO = 8

function PortfolioUpload({ files, onChange }) {
  const inputRef = useRef(null)

  function addFiles(newFiles) {
    const combined = [...files, ...Array.from(newFiles)].slice(0, MAX_PORTFOLIO)
    onChange(combined)
  }

  function remove(idx) {
    onChange(files.filter((_, i) => i !== idx))
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 7 }}>
        Portfolio / Highlights <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'none', fontWeight: 400 }}>(up to {MAX_PORTFOLIO} photos)</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8, marginBottom: 8 }}>
        {files.map((f, i) => (
          <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <img src={URL.createObjectURL(f)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button type="button" onClick={() => remove(i)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 12, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
        ))}
        {files.length < MAX_PORTFOLIO && (
          <div
            onClick={() => inputRef.current?.click()}
            style={{ aspectRatio: '1', borderRadius: 10, border: '2px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#f8fafc', gap: 4 }}
          >
            <span style={{ fontSize: 22, color: '#94a3b8' }}>+</span>
            <span style={{ fontSize: 10, color: '#94a3b8' }}>Add Photo</span>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={e => addFiles(e.target.files)} style={{ display: 'none' }} />
      <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>Showcase your best work — tiling jobs, showroom, products. JPG/PNG/WebP.</p>
    </div>
  )
}

function ServiceTextInput({ value, onChange }) {
  const [text, setText] = useState('')
  function add() {
    const s = text.trim()
    if (s && !value.includes(s)) onChange([...value, s])
    setText('')
  }
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
        placeholder="Add custom service…"
        style={{ flex: 1, padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 12, outline: 'none', fontFamily: 'inherit' }}
      />
      <button type="button" onClick={add} style={{ padding: '8px 14px', background: '#eef3fb', color: '#1B3A6B', border: '1.5px solid #d5e2f5', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Add</button>
    </div>
  )
}

async function uploadImage(file, folder) {
  const ext = file.name.split('.').pop()
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('provider-assets').upload(path, file, { upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('provider-assets').getPublicUrl(path)
  return data.publicUrl
}

export default function JoinForm() {
  const [form, setForm] = useState({
    name: '', city: '', district: '',
    whatsapp: '',
    service_areas: [],
    services: [],
    description: '',
  })
  const [profileFile, setProfileFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [portfolioFiles, setPortfolioFiles] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function toggleChip(key, val) {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val]
    }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.city.trim()) e.city = 'Required'
    if (!form.whatsapp.trim()) e.whatsapp = 'Required'
    else if (!/^\+?[0-9]{9,15}$/.test(form.whatsapp.replace(/\s/g, ''))) e.whatsapp = 'Enter a valid phone number'
    if (form.services.length === 0) e.services = 'Select at least one option'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    setErrors({})
    try {
      const [profileUrl, coverUrl, ...portfolioUrls] = await Promise.all([
        profileFile ? uploadImage(profileFile, 'profiles') : Promise.resolve(null),
        coverFile   ? uploadImage(coverFile,   'covers')   : Promise.resolve(null),
        ...portfolioFiles.map(f => uploadImage(f, 'portfolio')),
      ])
      await supabase.from('provider_submissions').insert({
        name: form.name.trim(),
        provider_type: 'provider',
        city: form.city.trim(),
        district: form.district || null,
        whatsapp: form.whatsapp.replace(/\s/g, ''),
        service_areas: form.service_areas.length ? form.service_areas : null,
        services: form.services,
        description: form.description.trim() || null,
        profile_image: profileUrl,
        cover_image: coverUrl,
        photo_urls: portfolioUrls.length ? portfolioUrls : null,
        status: 'pending_review',
        ...(userId ? { user_id: userId } : {}),
      })
      setSuccess(true)
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', maxWidth: 520, margin: '0 auto' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Application Submitted!</h2>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.8, marginBottom: 20, maxWidth: 380, margin: '0 auto 20px' }}>
          Thank you for applying to join TilersHub. Our team will review your application and contact you on WhatsApp within 1–2 business days.
        </p>
        <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: '#15803d', margin: 0 }}>✓ We'll reach out to <strong>{form.whatsapp}</strong> soon.</p>
        </div>
        <a href="/providers" style={{ padding: '11px 24px', background: '#1B3A6B', color: '#fff', borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
          Browse Provider Directory
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 600, margin: '0 auto' }}>

      {/* Name */}
      <Field label="Name / Company" id="name" req error={errors.name}>
        <input
          id="name"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="Your name or company name"
          style={inputStyle(!!errors.name)}
        />
      </Field>

      {/* City + District */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="City / Town" id="city" req error={errors.city}>
          <input
            id="city"
            value={form.city}
            onChange={e => set('city', e.target.value)}
            placeholder="e.g. Nugegoda"
            style={inputStyle(!!errors.city)}
          />
        </Field>
        <Field label="District" id="district">
          <select
            id="district"
            value={form.district}
            onChange={e => set('district', e.target.value)}
            style={{ ...inputStyle(false), WebkitAppearance: 'none', cursor: 'pointer' }}
          >
            <option value="">Select district...</option>
            {DISTRICTS_EN.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
      </div>

      {/* WhatsApp */}
      <Field label="WhatsApp Number" id="whatsapp" req error={errors.whatsapp} hint="Customers will contact you here.">
        <input
          id="whatsapp"
          value={form.whatsapp}
          onChange={e => set('whatsapp', e.target.value)}
          placeholder="+94771234567"
          type="tel"
          style={inputStyle(!!errors.whatsapp)}
        />
      </Field>

      {/* Service Areas */}
      <Field label="Service Areas" id="service_areas" hint="Select all districts you're available to work in.">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {DISTRICTS_EN.map(d => (
            <Chip
              key={d}
              label={d}
              checked={form.service_areas.includes(d)}
              onClick={() => toggleChip('service_areas', d)}
            />
          ))}
        </div>
      </Field>

      {/* Services */}
      <Field label="Services You Offer" id="services" req error={errors.services} hint="Select all that apply — or type your own below.">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {ALL_SERVICES.map(s => (
            <Chip
              key={s}
              label={s}
              checked={form.services.includes(s)}
              onClick={() => toggleChip('services', s)}
            />
          ))}
        </div>
        <ServiceTextInput
          value={form.services}
          onChange={v => set('services', v)}
        />
      </Field>

      {/* Images */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
        <ImageUpload
          label="Profile Photo"
          hint="Your photo or logo"
          aspectRatio="profile"
          value={profileFile}
          onChange={setProfileFile}
        />
        <ImageUpload
          label="Cover Image"
          hint="Showcase your best work"
          aspectRatio="cover"
          value={coverFile}
          onChange={setCoverFile}
        />
      </div>

      {/* Portfolio */}
      <PortfolioUpload files={portfolioFiles} onChange={setPortfolioFiles} />

      {/* Description */}
      <Field label="Short Description" id="description" hint="Optional — describe your experience or what makes you stand out.">
        <textarea
          id="description"
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder={DESC_PLACEHOLDER}
          rows={3}
          style={{ ...inputStyle(false), resize: 'vertical' }}
        />
      </Field>

      {/* Trust note */}
      <div style={{ padding: '13px 16px', background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', marginBottom: 22 }}>
        <p style={{ fontSize: 12, color: '#15803d', margin: 0, lineHeight: 1.6 }}>
          ✓ <strong>Free listing</strong> · Direct WhatsApp leads · No commission ever · TilersHub team reviews within 1–2 business days.
        </p>
      </div>

      {errors.submit && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 13, color: '#dc2626', marginBottom: 18 }}>
          ⚠ {errors.submit}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{ width: '100%', padding: 14, background: submitting ? '#94a3b8' : '#1B3A6B', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}
      >
        {submitting ? '⏳ Submitting...' : '✅ Submit Application'}
      </button>
    </form>
  )
}
