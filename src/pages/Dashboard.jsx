import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase, DISTRICTS, SERVICES, uploadAvatar } from '../lib/supabase'
import { Footer, ServiceCheckGrid, Spinner, StarRating } from '../components/UI'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [tiler, setTiler] = useState(null)
  const [contacts, setContacts] = useState(0)
  const [reviews, setReviews] = useState([])
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({})
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (profile && profile.role !== 'tiler') { navigate('/explore'); return }
    fetchData()
  }, [user, profile])

  async function fetchData() {
    if (!user) return
    const { data: tilerData } = await supabase.from('tiler_profiles').select('*').eq('user_id', user.id).single()
    if (tilerData) {
      setTiler(tilerData)
      setForm({
        bio: tilerData.bio || '',
        experience_years: tilerData.experience_years,
        daily_rate_min: tilerData.daily_rate_min || '',
        daily_rate_max: tilerData.daily_rate_max || '',
        services: tilerData.services || [],
        availability: tilerData.availability,
        district: tilerData.district,
      })
      // Contacts count
      const { count } = await supabase.from('contact_events').select('*', { count: 'exact', head: true }).eq('tiler_id', tilerData.id)
      setContacts(count || 0)
      // Reviews
      const { data: reviewData } = await supabase.from('reviews').select('*, profiles(full_name)').eq('tiler_id', tilerData.id).order('created_at', { ascending: false })
      setReviews(reviewData || [])
    }
  }

  async function saveProfile() {
    setSaving(true)
    try {
      if (avatarFile) {
        const url = await uploadAvatar(user.id, avatarFile)
        await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
      }
      await supabase.from('profiles').update({ district: form.district }).eq('id', user.id)
      await supabase.from('tilers').update({
        bio: form.bio,
        experience_years: form.experience_years,
        daily_rate_min: form.daily_rate_min || null,
        daily_rate_max: form.daily_rate_max || null,
        services: form.services,
        availability: form.availability,
      }).eq('user_id', user.id)
      await fetchData()
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  if (!tiler) return (
    <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-light)' }}>
      <Spinner /> <span style={{ marginLeft: 12 }}>ලබා ගනිමින්...</span>
    </div>
  )

  const initials = tiler.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'var(--charcoal)', padding: '40px 24px 36px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 16,
            background: 'linear-gradient(135deg, var(--terracotta) 0%, var(--terracotta-light) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: 'white',
            overflow: 'hidden', flexShrink: 0
          }}>
            {tiler.avatar_url ? <img src={tiler.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: 'var(--white)', fontWeight: 700 }}>{tiler.full_name}</div>
            <div style={{ fontSize: 13, color: 'rgba(245,240,232,0.45)', marginTop: 3 }}>ටයිලර් · 📍 {tiler.district}</div>
            <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, background: 'rgba(193,96,58,0.2)', color: 'var(--terracotta-muted)', padding: '3px 12px', borderRadius: 20 }}>
                ★ {Number(tiler.avg_rating).toFixed(1)} ({tiler.review_count} සමාලෝචන)
              </span>
              <span style={{ fontSize: 11, background: 'rgba(122,154,126,0.15)', color: 'var(--sage-light)', padding: '3px 12px', borderRadius: 20, border: '1px solid rgba(122,154,126,0.25)' }}>
                {tiler.availability === 'available' ? '✓ ලබාගත හැකිය' : tiler.availability === 'busy' ? '⏳ කාර්යබහුලයි' : '✗ නොමැත'}
              </span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setEditing(!editing)}>
            {editing ? '✕ අවලංගු කරන්න' : '✎ ප්‍රොෆයිලය සංස්කරණය'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px' }}>
        {saved && <div className="alert alert-success">✓ ප්‍රොෆයිලය සාර්ථකව යාවත්කාලීන කළා!</div>}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 16, marginBottom: 36 }}>
          {[
            { icon: '💬', num: contacts, label: 'WhatsApp සම්බන්ධ' },
            { icon: '★', num: Number(tiler.avg_rating).toFixed(1), label: 'සාමාන්‍ය ශ්‍රේණිය' },
            { icon: '🏆', num: tiler.review_count, label: 'සමාලෝචන' },
            { icon: '🏠', num: tiler.total_jobs || 0, label: 'ව්‍යාපෘති' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--white)', borderRadius: 14, padding: '20px', border: '1px solid var(--cream-dark)', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: 'var(--terracotta)', fontWeight: 700 }}>{s.num}</div>
              <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Edit form */}
        {editing && (
          <div style={{ background: 'var(--white)', borderRadius: 16, padding: '28px', border: '1px solid var(--cream-dark)', marginBottom: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--charcoal)' }}>ප්‍රොෆයිලය සංස්කරණය</h3>

            {/* Avatar upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: 12, background: 'var(--cream)', border: '2px dashed var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer', flexShrink: 0 }}
                onClick={() => document.getElementById('dashAvatarInput').click()}>
                {avatarPreview ? <img src={avatarPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 24 }}>📷</span>}
              </div>
              <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => document.getElementById('dashAvatarInput').click()}>ඡායාරූපය වෙනස් කරන්න</button>
              <input id="dashAvatarInput" type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)) }}} style={{ display: 'none' }} />
            </div>

            <div className="form-row" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label className="form-label">දිස්ත්‍රික්කය</label>
                <select className="form-select" value={form.district} onChange={e => set('district', e.target.value)}>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">ලබාගත හැකි බව</label>
                <select className="form-select" value={form.availability} onChange={e => set('availability', e.target.value)}>
                  <option value="available">✓ ලබාගත හැකිය</option>
                  <option value="busy">⏳ කාර්යබහුලයි</option>
                  <option value="unavailable">✗ දැනට නොමැත</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">අත්දැකීම (වසර)</label>
                <input className="form-input" type="number" value={form.experience_years} onChange={e => set('experience_years', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">ගාස්තු (Rs. / දිනකට)</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input className="form-input" type="number" placeholder="අවම" value={form.daily_rate_min} onChange={e => set('daily_rate_min', e.target.value)} />
                  <span style={{ color: 'var(--text-light)', flexShrink: 0 }}>–</span>
                  <input className="form-input" type="number" placeholder="උපරිම" value={form.daily_rate_max} onChange={e => set('daily_rate_max', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">ඔබ ගැන</label>
              <textarea className="form-textarea" value={form.bio} onChange={e => set('bio', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">සේවා</label>
              <ServiceCheckGrid services={SERVICES} selected={form.services} onChange={v => set('services', v)} />
            </div>

            <button className="btn btn-primary btn-full" style={{ marginTop: 8 }} onClick={saveProfile} disabled={saving}>
              {saving ? <><Spinner /> සුරකිමින්...</> : '✓ සුරකින්න'}
            </button>
          </div>
        )}

        {/* Reviews */}
        <div style={{ background: 'var(--white)', borderRadius: 16, padding: '24px 28px', border: '1px solid var(--cream-dark)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--charcoal)' }}>සමාලෝචන ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-light)', textAlign: 'center', padding: '24px 0' }}>
              තවම සමාලෝචන නැත. ගෙදර හිමිකරුවන් ඔබව WhatsApp හරහා ළඟා වූ පසු ශ්‍රේණිගත කිරීම් ලැබේ.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {reviews.map(r => (
                <div key={r.id} style={{ background: 'var(--cream)', borderRadius: 12, padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{r.profiles?.full_name || '익명'}</div>
                    <StarRating rating={r.rating} size={13} />
                  </div>
                  {r.comment && <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.7 }}>{r.comment}</p>}
                  <div style={{ fontSize: 10, color: 'var(--text-light)', marginTop: 8 }}>{new Date(r.created_at).toLocaleDateString('si-LK')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
