import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { Footer, Spinner } from '../components/UI'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleLogin() {
    setError('')
    setLoading(true)
    try {
      await signIn(form.email, form.password)
      navigate('/explore')
    } catch (err) {
      setError('ඊමේල් හෝ මුරපදය වැරදිය. නැවත උත්සාහ කරන්න.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ maxWidth: 440, margin: '0 auto', padding: '64px 20px' }}>
        <div style={{ background: 'var(--white)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 48px rgba(0,0,0,0.08)' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--charcoal) 0%, #2c2c2c 100%)', padding: '36px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
            <div style={{ position: 'absolute', bottom: -40, right: -40, width: 140, height: 140, background: 'radial-gradient(circle, var(--terracotta) 0%, transparent 70%)', opacity: 0.25 }} />
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: 'var(--white)', fontWeight: 700, marginBottom: 4 }}>නැවත සාදරයෙන් පිළිගනිමු</div>
            <div style={{ fontSize: 13, color: 'rgba(245,240,232,0.45)' }}>ඔබේ TilersHub ගිණුමට පිවිසෙන්න</div>
          </div>
          <div style={{ padding: '32px 36px' }}>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">ඊමේල් <span className="req">*</span></label>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <div className="form-group">
              <label className="form-label">මුරපදය <span className="req">*</span></label>
              <input className="form-input" type="password" placeholder="ඔබේ මුරපදය" value={form.password} onChange={e => set('password', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <button className="btn btn-primary btn-full btn-lg" style={{ marginTop: 4 }} disabled={loading || !form.email || !form.password} onClick={handleLogin}>
              {loading ? <><Spinner /> පිවිසෙමින්...</> : '→ පිවිසෙන්න'}
            </button>
            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-light)' }}>
              ගිණුමක් නැද්ද? <Link to="/register" style={{ color: 'var(--terracotta)', fontWeight: 600 }}>ලියාපදිංචි වන්න</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
