import { useState, useEffect } from 'react'
import { supabase, PROVIDER_TYPES, DISTRICTS_EN } from '../lib/supabase.js'

// ─── All constants & helpers outside component (prevents keyboard-dismiss remount) ───

const TYPE_META = {
  tiler:        { nameLabel: 'Full Name',              namePlaceholder: 'Your full name',               servicesLabel: 'Services You Offer',    showServiceAreas: true,  showPhone: false },
  contractor:   { nameLabel: 'Name / Company',         namePlaceholder: 'Your name or company name',    servicesLabel: 'Services You Offer',    showServiceAreas: true,  showPhone: true  },
  workshop:     { nameLabel: 'Workshop Name',          namePlaceholder: 'Workshop or business name',    servicesLabel: 'Workshop Capabilities', showServiceAreas: false, showPhone: true  },
  supplier:     { nameLabel: 'Business Name',          namePlaceholder: 'Company or trade name',        servicesLabel: 'Products You Supply',   showServiceAreas: false, showPhone: true  },
  tile_shop:    { nameLabel: 'Shop / Showroom Name',   namePlaceholder: 'Shop or showroom name',        servicesLabel: 'Product Categories',    showServiceAreas: false, showPhone: true  },
  brand_dealer: { nameLabel: 'Dealer / Business Name', namePlaceholder: 'Dealer or business name',      servicesLabel: 'Brands & Products',     showServiceAreas: false, showPhone: true  },
  tool_supplier:{ nameLabel: 'Business Name',          namePlaceholder: 'Shop or business name',        servicesLabel: 'Tools & Equipment',     showServiceAreas: false, showPhone: true  },
  bathroom_shop:{ nameLabel: 'Showroom Name',          namePlaceholder: 'Showroom or business name',    servicesLabel: 'Product Categories',    showServiceAreas: false, showPhone: true  },
}

const TYPE_SERVICES = {
  tiler:        ['Floor Tiling','Wall Tiling','Bathroom Tiling','Kitchen Tiling','Staircase Tiling','Outdoor Tiling','Waterproofing','Grouting & Finishing'],
  contractor:   ['Full Bathroom Renovation','Full Kitchen Renovation','Floor Tiling','Wall Tiling','Waterproofing','Screeding & Leveling','Design Consultation','Project Management'],
  workshop:     ['Tile Cutting','Routing & Profiling','Bevel Cutting','Polish & Grinding','Waterjet Cutting','Edge Finishing','Notching & Drilling','Custom Sizes'],
  supplier:     ['Floor Tiles','Wall Tiles','Outdoor Tiles','Mosaic & Feature Tiles','Large Format Tiles','Budget Range','Premium Range','Imported Tiles','Porcelain','Ceramic','Marble & Natural Stone'],
  tile_shop:    ['Floor Tiles','Wall Tiles','Bathroom Tiles','Outdoor Tiles','Mosaic Tiles','Porcelain','Ceramic','Marble','Budget Range','Premium Range'],
  brand_dealer: ['Rocell','Lanka Tile','Macktiles','Megatile','Imported Brands','Floor Tiles','Wall Tiles','Porcelain','Ceramic'],
  tool_supplier:['Tile Cutters','Angle Grinders & Blades','Leveling Systems','Mixing Equipment','Trowels & Hand Tools','Levels & Lasers','Safety Equipment','Tool Rental','Wet Saws'],
  bathroom_shop:['Sanitary Ware','Showers & Enclosures','Bathtubs','Faucets & Mixers','Mirrors & Cabinets','Accessories & Rails','Bathroom Lighting','Waterproofing & Drainage'],
}

const DESC_PLACEHOLDER = {
  tiler:        '8 years experience in floor and bathroom tiling across Colombo and Western Province. Specialise in large format tiles and herringbone patterns...',
  contractor:   'Full bathroom and kitchen renovation contractor. Handles tiling, plumbing, carpentry and project management end to end...',
  workshop:     'Tile cutting and routing workshop in Piliyandala. Available for contractors and tilers. Same-day cutting service available on request...',
  supplier:     'Wholesale and retail tile supplier. 500+ SKUs including imported Italian, Indian and local Sri Lankan tiles at competitive prices...',
  tile_shop:    'Tile showroom with 200+ designs. Stocking local and imported tiles from Rs.150 to Rs.2,500 per sq.ft. Free delivery within 20km...',
  brand_dealer: 'Authorised dealer for Rocell and Lanka Tile. Serving Colombo and suburbs with showroom stock and fast delivery...',
  tool_supplier:'Tiling tools and equipment shop. Stock tile cutters, angle grinders and leveling systems. Tool rental also available by the day or week...',
  bathroom_shop:'Bathroom products showroom. Stocking sanitary ware, faucets, showers and fittings from leading brands at all price points...',
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

export default function JoinForm() {
  const [form, setForm] = useState({
    provider_type: '',
    name: '', city: '', district: '',
    whatsapp: '', phone: '',
    service_areas: [],
    services: [],
    description: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function selectType(t) {
    // Reset type-specific fields when switching type
    setForm(f => ({ ...f, provider_type: t, services: [], service_areas: [] }))
    setErrors(e => ({ ...e, provider_type: undefined, services: undefined }))
  }

  function toggleChip(key, val) {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val]
    }))
  }

  function validate() {
    const e = {}
    if (!form.provider_type) e.provider_type = 'Please choose a provider type above'
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
      await supabase.from('provider_submissions').insert({
        name: form.name.trim(),
        provider_type: form.provider_type,
        city: form.city.trim(),
        district: form.district || null,
        whatsapp: form.whatsapp.replace(/\s/g, ''),
        phone: form.phone.trim() || null,
        service_areas: form.service_areas.length ? form.service_areas : null,
        services: form.services,
        description: form.description.trim() || null,
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
    const meta = TYPE_META[form.provider_type] || {}
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

  const meta = TYPE_META[form.provider_type]
  const services = TYPE_SERVICES[form.provider_type] || []
  const formVisible = !!form.provider_type

  return (
    <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 600, margin: '0 auto' }}>

      {/* ── Step 1: Provider Type ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>
          What type of provider are you?<span style={{ color: '#E05A2B', marginLeft: 3 }}>*</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))', gap: 10 }}>
          {PROVIDER_TYPES.map(t => {
            const selected = form.provider_type === t.value
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => selectType(t.value)}
                style={{
                  padding: '14px 10px', borderRadius: 14, cursor: 'pointer', textAlign: 'center',
                  border: `2px solid ${selected ? '#1B3A6B' : '#e2e8f0'}`,
                  background: selected ? '#eef3fb' : '#fff',
                  transition: 'all 0.15s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                }}
              >
                <span style={{ fontSize: 24 }}>{t.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: selected ? '#1B3A6B' : '#475569', lineHeight: 1.2 }}>{t.label}</span>
              </button>
            )
          })}
        </div>
        {errors.provider_type && (
          <p style={{ fontSize: 11, color: '#dc2626', marginTop: 8 }}>⚠ {errors.provider_type}</p>
        )}
      </div>

      {/* ── Step 2: Rest of form (revealed once type chosen) ── */}
      {formVisible && (
        <div style={{ animation: 'fadeIn 0.25s ease' }}>

          {/* Name */}
          <Field label={meta.nameLabel} id="name" req error={errors.name}>
            <input
              id="name"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder={meta.namePlaceholder}
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

          {/* WhatsApp + Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: meta.showPhone ? '1fr 1fr' : '1fr', gap: 14 }}>
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
            {meta.showPhone && (
              <Field label="Phone Number" id="phone" hint="Optional — landline or alternate number.">
                <input
                  id="phone"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="+94112345678"
                  type="tel"
                  style={inputStyle(false)}
                />
              </Field>
            )}
          </div>

          {/* Service Areas (tilers & contractors only) */}
          {meta.showServiceAreas && (
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
          )}

          {/* Services / Products */}
          <Field label={meta.servicesLabel} id="services" req error={errors.services} hint="Select all that apply.">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {services.map(s => (
                <Chip
                  key={s}
                  label={s}
                  checked={form.services.includes(s)}
                  onClick={() => toggleChip('services', s)}
                />
              ))}
            </div>
          </Field>

          {/* Description */}
          <Field label="Short Description" id="description" hint="Optional — describe your experience or what makes you stand out.">
            <textarea
              id="description"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder={DESC_PLACEHOLDER[form.provider_type]}
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
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </form>
  )
}
