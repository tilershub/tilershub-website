import { useState, useRef } from 'react'
import { supabase, DISTRICTS, DISTRICTS_EN } from '../lib/supabase.js'
import { SERVICES } from '../lib/services.js'

const PROVIDER_CATEGORIES = [
  {
    value: 'tiler',
    icon: '🪚',
    label: 'Professional',
    sub: 'Tiler, tiling specialist or skilled tradesperson',
    examples: 'Floor tiling · Bathroom tiling · Mosaic · Waterproofing',
    color: '#1B3A6B',
    bg: '#eef3fb',
  },
  {
    value: 'contractor',
    icon: '🏗️',
    label: 'Contractor',
    sub: 'Full renovation or construction contractor',
    examples: 'Bathroom reno · Electrical · Aluminium & glass · Landscaping',
    color: '#0f766e',
    bg: '#f0fdfa',
  },
  {
    value: 'supplier',
    icon: '📦',
    label: 'Supplier',
    sub: 'Tiles, bathware, tools or materials supplier',
    examples: 'Tile shop · Bathware · Tap-ware · Tool supplier',
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
]

// ─── Service names (index-aligned EN ↔ SI) ───────────────────────────────────
const ALL_SERVICES_EN = SERVICES.map(s => s.label)

const ALL_SERVICES_SI = [
  'නාන කාමර ප්‍රතිසංස්කරණය', 'නාන කාමර නළ වැඩ', 'නාන කාමර ආලෝකය',
  'ෂවර් කියුබිකල්', 'නාන කාමර දර්පණ', 'වැනිටි කබඩ්',
  'මහල් ටයිල් කිරීම', 'විශාල ෆෝමැට් ටයිල් කිරීම',
  'මොසෙයික් ටයිල් කිරීම', 'පිහිනුම් තටාක ටයිල් කිරීම', 'බාහිර ටයිල් කිරීම',
  'ටයිල් කැපීම සහ රවුටිං', 'ග්ලාස් රේලිං', 'ඇලුමිනියම් සහ ග්ලාස් කාර්ය',
  'IPanel සිවිලිම', 'ගෙදර ආලෝකය', 'ගෙදර රැහැන් කිරීම',
  'විදුලි අලුත්වැඩියා', 'දිය ආරක්ෂාකරණය', 'භූ දර්ශනය සහ උද්‍යාන',
  'ග්‍රැනයිට් කවුන්ටර්ටොප්', 'ඇලුමිනියම් දොරවල් සහ ජනේල',
]

const MAX_PORTFOLIO = 8

// ─── Translations ─────────────────────────────────────────────────────────────
const TRANS = {
  en: {
    nameLabel: 'Name / Company',
    namePlaceholder: 'Your name or company name',
    cityLabel: 'City / Town',
    cityPlaceholder: 'e.g. Nugegoda',
    districtLabel: 'District',
    districtDefault: 'Select district...',
    whatsappLabel: 'WhatsApp Number',
    whatsappHint: 'Customers will contact you here.',
    serviceAreasLabel: 'Service Areas',
    serviceAreasHint: "Select all districts you're available to work in.",
    servicesLabel: 'Services You Offer',
    servicesHint: 'Select all that apply — or type your own below.',
    customSvcPh: 'Add custom service…',
    addBtn: '+ Add',
    profilePhotoLabel: 'Profile Photo',
    profilePhotoHint: 'Your photo or logo',
    coverLabel: 'Cover Image',
    coverHint: 'Showcase your best work',
    portfolioLabel: 'Portfolio / Highlights',
    portfolioCount: `(up to ${MAX_PORTFOLIO} photos)`,
    portfolioHint: 'Showcase your best work — tiling jobs, showroom, products. JPG/PNG/WebP.',
    addPhotoBtn: 'Add Photo',
    descLabel: 'Short Description',
    descHint: 'Optional — describe your experience or what makes you stand out.',
    descPh: 'Describe your services, experience, and area of operation...',
    trustNote: '✓ <strong>Free listing</strong> · Direct WhatsApp leads · No commission ever · TilersHub team reviews within 1–2 business days.',
    submitBtn: '✅ Submit Application',
    submittingBtn: '⏳ Submitting...',
    successTitle: 'Application Submitted!',
    successBody: 'Thank you for applying to join TilersHub. Our team will review your application and contact you on WhatsApp within 1–2 business days.',
    successReach: wa => `✓ We'll reach out to ${wa} soon.`,
    browseBtn: 'Browse Provider Directory',
    providerTypeLabel: 'What type of provider are you?',
    errRequired: 'Required',
    errPhone: 'Enter a valid phone number',
    errProviderType: 'Please select a provider type',
    errServices: 'Select at least one service',
    errSubmit: 'Something went wrong. Please try again.',
    alreadyAdded: 'This service is already added.',
    clickToChange: 'Click to change',
    uploadHint: 'Click or drag to upload',
    maxSize: 'JPG, PNG, WebP · Max 5 MB',
  },
  si: {
    nameLabel: 'නම / ව්‍යාපාර නාමය',
    namePlaceholder: 'ඔබේ නම හෝ ව්‍යාපාරයේ නම',
    cityLabel: 'නගරය / ප්‍රදේශය',
    cityPlaceholder: 'උදා: නුගේගොඩ',
    districtLabel: 'දිස්ත්‍රික්කය',
    districtDefault: 'දිස්ත්‍රික්කය තෝරන්න...',
    whatsappLabel: 'WhatsApp අංකය',
    whatsappHint: 'ගාහකයින් ඔබ හා සම්බන්ධ වනු ලැබේ.',
    serviceAreasLabel: 'සේවා ප්‍රදේශ',
    serviceAreasHint: 'ඔබ සේවය ලබාදෙන සියලු දිස්ත්‍රික්ක තෝරන්න.',
    servicesLabel: 'ඔබ ලබාදෙන සේවාවන්',
    servicesHint: 'සියල්ල තෝරන්න — හෝ ඔබේ ම සේවාව ඇතුළු කරන්න.',
    customSvcPh: 'අභිරුචි සේවාවක් ඇතුළු කරන්න…',
    addBtn: '+ එකතු',
    profilePhotoLabel: 'පරිශීලක ඡායාරූපය',
    profilePhotoHint: 'ඔබේ ඡායාරූපය හෝ ලාංඡනය',
    coverLabel: 'ප්‍රධාන රූපය',
    coverHint: 'ඔබේ හොඳම වැඩ පෙන්වන්න',
    portfolioLabel: 'Portfolio / ලකුණු',
    portfolioCount: '(ඡායාරූප 8 දක්වා)',
    portfolioHint: 'ඔබේ හොඳම ටයිල් කාර්ය, ප්‍රදර්ශනාගාරය, නිෂ්පාදන.',
    addPhotoBtn: 'ඡායාරූපය',
    descLabel: 'කෙටි විස්තරය',
    descHint: 'අත්‍යාවශ්‍ය නොවේ — ඔබේ සේවාව හෝ ඔබ ඉස්මතු වන ආකාරය විස්තර කරන්න.',
    descPh: 'ඔබේ සේවාව, අත්දැකීම් සහ සේවා ප්‍රදේශය විස්තර කරන්න...',
    trustNote: '✓ <strong>නොමිලේ ලැයිස්තු</strong> · WhatsApp සෘජු ඇමතුම් · කොමිස් නොමැත · TilersHub කණ්ඩායම ව්‍යාපාරික දින 1–2 ඇතුළත සමාලෝචනය කරයි.',
    submitBtn: '✅ අයදුම්පත ඉදිරිපත් කරන්න',
    submittingBtn: '⏳ ඉදිරිපත් කරමින්...',
    successTitle: 'අයදුම්පත ඉදිරිපත් කරන ලදී!',
    successBody: 'TilersHub හා සම්බන්ධ වීමට ස්තූතිය. අපගේ කණ්ඩායම ව්‍යාපාරික දින 1–2 ඇතුළත WhatsApp හරහා ඔබ හා සම්බන්ධ වනු ඇත.',
    successReach: wa => `✓ ඉක්මනින් ${wa} ඇමතීමට කටයුතු කරමු.`,
    browseBtn: 'සේවා සපයන්නන් බ්‍රවුස් කරන්න',
    errRequired: 'අවශ්‍යයි',
    errPhone: 'වලංගු දුරකතන අංකයක් ඇතුළු කරන්න',
    providerTypeLabel: 'ඔබ කුමන ආකාරයේ සේවා සපයන්නෙකු ද?',
    errRequired: 'අවශ්‍ය',
    errPhone: 'වලංගු දුරකථන අංකයක් ඇතුළු කරන්න',
    errProviderType: 'සේවා සපයන්නා වර්ගය තෝරන්න',
    errServices: 'අවම වශයෙන් සේවාවක් එකක් තෝරන්න',
    errSubmit: 'දෝෂයක් ඇති විය. නැවත උත්සාහ කරන්න.',
    alreadyAdded: 'මෙම සේවාව දැනටමත් එකතු කර ඇත.',
    clickToChange: 'වෙනස් කිරීමට ක්ලික් කරන්න',
    uploadHint: 'ක්ලික් කරන්න හෝ ඇද දමන්න',
    maxSize: 'JPG, PNG, WebP · උපරිම 5 MB',
  },
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function useLang() {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem('tilershub_lang') || 'en' } catch { return 'en' }
  })
  function toggle() {
    const next = lang === 'en' ? 'si' : 'en'
    setLangState(next)
    try { localStorage.setItem('tilershub_lang', next) } catch {}
  }
  return [lang, toggle]
}

function LangToggle({ lang, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{ fontSize: 12, fontWeight: 700, padding: '5px 14px', border: '1.5px solid #e2e8f0', borderRadius: 20, cursor: 'pointer', background: '#fff', color: '#334155', display: 'inline-flex', gap: 6, alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flexShrink: 0 }}
      title="Switch language / භාෂාව මාරු කරන්න"
    >
      <span style={{ opacity: lang === 'en' ? 1 : 0.35 }}>EN</span>
      <span style={{ opacity: 0.2, fontWeight: 300 }}>|</span>
      <span style={{ opacity: lang === 'si' ? 1 : 0.35 }}>සිං</span>
    </button>
  )
}

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

function ImageUpload({ label, hint, aspectRatio, onChange, T }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    onChange(file)
    setPreview(URL.createObjectURL(file))
  }

  const height = aspectRatio === 'cover' ? 130 : 100

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 7 }}>{label}</div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
        style={{ position: 'relative', height, borderRadius: 12, border: `2px dashed ${dragging ? '#1B3A6B' : '#cbd5e1'}`, background: dragging ? '#eef3fb' : preview ? '#000' : '#f8fafc', cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
      >
        {preview ? (
          <>
            <img src={preview} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
            <div style={{ position: 'relative', zIndex: 1, background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 600 }}>
              {T.clickToChange}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8', pointerEvents: 'none' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{aspectRatio === 'cover' ? '🖼️' : '👤'}</div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{T.uploadHint}</div>
            <div style={{ fontSize: 10, marginTop: 2 }}>{T.maxSize}</div>
          </div>
        )}
      </div>
      {hint && <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 5, lineHeight: 1.5 }}>{hint}</p>}
      <input ref={inputRef} type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} style={{ display: 'none' }} />
    </div>
  )
}

function PortfolioUpload({ files, onChange, T }) {
  const inputRef = useRef(null)

  function addFiles(newFiles) {
    const combined = [...files, ...Array.from(newFiles)].slice(0, MAX_PORTFOLIO)
    onChange(combined)
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 7 }}>
        {T.portfolioLabel} <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'none', fontWeight: 400 }}>{T.portfolioCount}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8, marginBottom: 8 }}>
        {files.map((f, i) => (
          <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <img src={URL.createObjectURL(f)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button type="button" onClick={() => onChange(files.filter((_, j) => j !== i))} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
        ))}
        {files.length < MAX_PORTFOLIO && (
          <div
            onClick={() => inputRef.current?.click()}
            style={{ aspectRatio: '1', borderRadius: 10, border: '2px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#f8fafc', gap: 4 }}
          >
            <span style={{ fontSize: 22, color: '#94a3b8' }}>+</span>
            <span style={{ fontSize: 10, color: '#94a3b8' }}>{T.addPhotoBtn}</span>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={e => addFiles(e.target.files)} style={{ display: 'none' }} />
      <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>{T.portfolioHint}</p>
    </div>
  )
}

function ServiceTextInput({ value, onChange, T }) {
  const [text, setText] = useState('')
  const [dupeError, setDupeError] = useState(false)

  const customServices = value.filter(s => !ALL_SERVICES_EN.includes(s))

  function add() {
    const s = text.trim()
    if (!s) return
    const duplicate = value.some(v => v.toLowerCase() === s.toLowerCase())
    if (duplicate) { setDupeError(true); return }
    onChange([...value, s])
    setText('')
    setDupeError(false)
  }

  function remove(s) {
    onChange(value.filter(v => v !== s))
    setDupeError(false)
  }

  return (
    <div>
      {customServices.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {customServices.map(s => (
            <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: 20, padding: '3px 10px 3px 12px', fontSize: 11, fontWeight: 600 }}>
              {s}
              <button type="button" onClick={() => remove(s)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 2px', color: '#93c5fd', fontSize: 14, lineHeight: 1, display: 'flex', alignItems: 'center' }}>
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={text}
          onChange={e => { setText(e.target.value); if (dupeError) setDupeError(false) }}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={T.customSvcPh}
          style={{ flex: 1, padding: '8px 12px', border: `1.5px solid ${dupeError ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 10, fontSize: 12, outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
        />
        <button type="button" onClick={add}
          style={{ padding: '8px 14px', background: '#eef3fb', color: '#1B3A6B', border: '1.5px solid #d5e2f5', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          {T.addBtn}
        </button>
      </div>
      {dupeError && (
        <p style={{ fontSize: 11, color: '#dc2626', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
          ⚠ {T.alreadyAdded}
        </p>
      )}
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
  const [lang, toggleLang] = useLang()
  const T = TRANS[lang]

  const [category, setCategory] = useState(null) // null = not chosen yet

  const [form, setForm] = useState({
    provider_type: '',
    name: '', city: '', district: '',
    whatsapp: '',
    service_areas: [],
    services: [],
    description: '',
  })
  const [profileFile, setProfileFile] = useState(null)
  const [coverFile, setCoverFile]     = useState(null)
  const [portfolioFiles, setPortfolioFiles] = useState([])
  const [errors, setErrors]   = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function toggleChip(key, val) {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val]
    }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = T.errRequired
    if (!form.city.trim()) e.city = T.errRequired
    if (!form.whatsapp.trim()) e.whatsapp = T.errRequired
    else if (!/^\+?[0-9]{9,15}$/.test(form.whatsapp.replace(/\s/g, ''))) e.whatsapp = T.errPhone
    if (form.services.length === 0) e.services = T.errServices
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
        provider_type: category?.value || 'tiler',
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
      })
      setSuccess(true)
    } catch {
      setErrors({ submit: T.errSubmit })
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', maxWidth: 520, margin: '0 auto' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>{T.successTitle}</h2>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.8, marginBottom: 20, maxWidth: 380, margin: '0 auto 20px' }}>
          {T.successBody}
        </p>
        <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: '#15803d', margin: 0 }}>{T.successReach(<strong>{form.whatsapp}</strong>)}</p>
        </div>
        <a href="/providers" style={{ padding: '11px 24px', background: '#1B3A6B', color: '#fff', borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
          {T.browseBtn}
        </a>
      </div>
    )
  }

  // ── Step 1: Category picker ───────────────────────────────────────────────────
  if (!category) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <LangToggle lang={lang} onToggle={toggleLang} />
        </div>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 4 }}>What best describes you?</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Choose your category to get started — takes 2 minutes.</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PROVIDER_CATEGORIES.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat)}
              style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderRadius: 16, border: `2px solid ${cat.color}22`, background: cat.bg, cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s, box-shadow 0.15s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.boxShadow = `0 4px 16px ${cat.color}22` }}
              onMouseOut={e  => { e.currentTarget.style.borderColor = `${cat.color}22`; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              <div style={{ width: 56, height: 56, borderRadius: 14, background: '#fff', border: `1.5px solid ${cat.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                {cat.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: cat.color, marginBottom: 2 }}>{cat.label}</div>
                <div style={{ fontSize: 12, color: '#374151', marginBottom: 4 }}>{cat.sub}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.5 }}>{cat.examples}</div>
              </div>
              <div style={{ fontSize: 22, color: cat.color, flexShrink: 0, opacity: 0.5 }}>›</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Step 2: Form ──────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 600, margin: '0 auto' }}>

      {/* Language toggle + selected category badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
        <button
          type="button"
          onClick={() => setCategory(null)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: category.bg, border: `1.5px solid ${category.color}40`, borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: category.color }}
        >
          {category.icon} {category.label} <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 400 }}>· change</span>
        </button>
        <LangToggle lang={lang} onToggle={toggleLang} />
      </div>

      {/* Name */}
      <Field label={T.nameLabel} id="name" req error={errors.name}>
        <input id="name" value={form.name} onChange={e => set('name', e.target.value)}
          placeholder={T.namePlaceholder} style={inputStyle(!!errors.name)} />
      </Field>

      {/* City + District */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label={T.cityLabel} id="city" req error={errors.city}>
          <input id="city" value={form.city} onChange={e => set('city', e.target.value)}
            placeholder={T.cityPlaceholder} style={inputStyle(!!errors.city)} />
        </Field>
        <Field label={T.districtLabel} id="district">
          <select id="district" value={form.district} onChange={e => set('district', e.target.value)}
            style={{ ...inputStyle(false), WebkitAppearance: 'none', cursor: 'pointer' }}>
            <option value="">{T.districtDefault}</option>
            {DISTRICTS_EN.map((d, i) => (
              <option key={d} value={d}>{lang === 'si' ? DISTRICTS[i] : d}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* WhatsApp */}
      <Field label={T.whatsappLabel} id="whatsapp" req error={errors.whatsapp} hint={T.whatsappHint}>
        <input id="whatsapp" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)}
          placeholder="+94771234567" type="tel" style={inputStyle(!!errors.whatsapp)} />
      </Field>

      {/* Service Areas */}
      <Field label={T.serviceAreasLabel} id="service_areas" hint={T.serviceAreasHint}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {DISTRICTS_EN.map((d, i) => (
            <Chip
              key={d}
              label={lang === 'si' ? DISTRICTS[i] : d}
              checked={form.service_areas.includes(d)}
              onClick={() => toggleChip('service_areas', d)}
            />
          ))}
        </div>
      </Field>

      {/* Services */}
      <Field label={T.servicesLabel} id="services" req error={errors.services} hint={T.servicesHint}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {ALL_SERVICES_EN.map((sEn, i) => (
            <Chip
              key={sEn}
              label={lang === 'si' ? ALL_SERVICES_SI[i] : sEn}
              checked={form.services.includes(sEn)}
              onClick={() => toggleChip('services', sEn)}
            />
          ))}
        </div>
        <ServiceTextInput value={form.services} onChange={v => set('services', v)} T={T} />
      </Field>

      {/* Images */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
        <ImageUpload label={T.profilePhotoLabel} hint={T.profilePhotoHint} aspectRatio="profile" onChange={setProfileFile} T={T} />
        <ImageUpload label={T.coverLabel} hint={T.coverHint} aspectRatio="cover" onChange={setCoverFile} T={T} />
      </div>

      {/* Portfolio */}
      <PortfolioUpload files={portfolioFiles} onChange={setPortfolioFiles} T={T} />

      {/* Description */}
      <Field label={T.descLabel} id="description" hint={T.descHint}>
        <textarea id="description" value={form.description} onChange={e => set('description', e.target.value)}
          placeholder={T.descPh} rows={3}
          style={{ ...inputStyle(false), resize: 'vertical' }} />
      </Field>

      {/* Trust note */}
      <div style={{ padding: '13px 16px', background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', marginBottom: 22 }}>
        <p style={{ fontSize: 12, color: '#15803d', margin: 0, lineHeight: 1.6 }}
          dangerouslySetInnerHTML={{ __html: T.trustNote }} />
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
        {submitting ? T.submittingBtn : T.submitBtn}
      </button>
    </form>
  )
}
