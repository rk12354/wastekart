import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './AuthPages.css'

export default function RegisterPage() {
  const { register, API } = useAuth()
  const toast             = useToast()
  const navigate          = useNavigate()
  const [searchParams]    = useSearchParams()

  const [role, setRole] = useState(searchParams.get('role') === 'collector' ? 'collector' : 'user')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // ── User form ────────────────────────────────────────────
  const [userForm, setUserForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', street: '', city: 'Lucknow', pincode: '', state: 'Uttar Pradesh'
  })

  // ── Collector form ───────────────────────────────────────
  const [collForm, setCollForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', businessName: '', ownerName: '',
    street: '', city: 'Lucknow', pincode: '', state: 'Uttar Pradesh',
    servicePincodes: '', workStart: '09:00', workEnd: '18:00'
  })

  const uChange = e => setUserForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const cChange = e => setCollForm(p => ({ ...p, [e.target.name]: e.target.value }))

  // ── User registration ─────────────────────────────────────
  const handleUserNext = e => {
    e.preventDefault()
    if (!userForm.name || !userForm.email || !userForm.password || !userForm.phone) {
      toast.error('Please fill all required fields'); return
    }
    if (userForm.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (userForm.password !== userForm.confirmPassword) { toast.error('Passwords do not match'); return }
    setStep(2)
  }

  const handleUserSubmit = async e => {
    e.preventDefault()
    try {
      setLoading(true)
      await register({
        name: userForm.name, email: userForm.email, password: userForm.password,
        phone: userForm.phone,
        address: { street: userForm.street, city: userForm.city, pincode: userForm.pincode, state: userForm.state }
      })
      toast.success('Account created! Welcome to WasteKart 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.')
    } finally { setLoading(false) }
  }

  // ── Collector registration ────────────────────────────────
  const handleCollNext = e => {
    e.preventDefault()
    if (!collForm.name || !collForm.email || !collForm.password || !collForm.phone || !collForm.businessName) {
      toast.error('Please fill all required fields'); return
    }
    if (collForm.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (collForm.password !== collForm.confirmPassword) { toast.error('Passwords do not match'); return }
    setStep(2)
  }

  const handleCollSubmit = async e => {
    e.preventDefault()
    if (!collForm.pincode) { toast.error('Pincode is required for collector matching'); return }
    try {
      setLoading(true)
      const { data } = await API.post('/auth/register-collector', {
        name:            collForm.name,
        email:           collForm.email,
        password:        collForm.password,
        phone:           collForm.phone,
        businessName:    collForm.businessName,
        ownerName:       collForm.ownerName || collForm.name,
        street:          collForm.street,
        city:            collForm.city,
        pincode:         collForm.pincode,
        state:           collForm.state,
        servicePincodes: collForm.servicePincodes,
        workStart:       collForm.workStart,
        workEnd:         collForm.workEnd,
      })
      // Manually store token since we bypassed register()
      localStorage.setItem('wk_user',  JSON.stringify(data))
      localStorage.setItem('wk_token', data.token)
      window.location.href = '/collector/dashboard'
    } catch (err) {
      toast.error(err.response?.data?.message || 'Collector registration failed.')
    } finally { setLoading(false) }
  }

  const isCollector = role === 'collector'

  return (
    <div className="auth-page">
      <div className="auth-deco">
        <div className="deco-blob" />
        <div className="auth-eco-info">
          <div className="eco-logo">♻️ WasteKart</div>
          <h2>{isCollector ? 'Join as a Collector' : 'Start Your Green Journey'}</h2>
          <p>{isCollector
            ? 'Register your scrap collection business and start receiving pickup requests from verified users in your area.'
            : 'Create your free account and start earning from your waste while contributing to a cleaner India.'}
          </p>
          <div className="eco-bullets">
            {isCollector ? <>
              <div>🆓 Free business registration</div>
              <div>💰 Set your own material prices</div>
              <div>📦 Receive auto-assigned pickups</div>
              <div>📊 Full earnings dashboard</div>
            </> : <>
              <div>🆓 Completely free to join</div>
              <div>💰 Earn from every pickup</div>
              <div>📊 Track your impact dashboard</div>
              <div>🌳 Plant trees with every sale</div>
            </>}
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-card fade-up">

          {/* Role tabs */}
          <div className="role-tabs">
            <button className={`role-tab ${!isCollector ? 'active' : ''}`}
              onClick={() => { setRole('user'); setStep(1) }}>
              👤 Register as User
            </button>
            <button className={`role-tab ${isCollector ? 'active' : ''}`}
              onClick={() => { setRole('collector'); setStep(1) }}>
              🚚 Register as Collector
            </button>
          </div>

          <div className="auth-header">
            <div className="auth-icon">{step === 1 ? (isCollector ? '🚚' : '👤') : '📍'}</div>
            <h1>{step === 1 ? (isCollector ? 'Business Details' : 'Create Account') : (isCollector ? 'Service Area' : 'Your Address')}</h1>
            <p>{step === 1 ? (isCollector ? 'Register your collection business' : 'Join WasteKart for free') : (isCollector ? 'Where do you operate?' : 'For accurate collector matching')}</p>
            <div className="step-indicator">
              <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
              <div className="step-line" />
              <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
            </div>
          </div>

          {/* ── USER FORMS ── */}
          {!isCollector && step === 1 && (
            <form onSubmit={handleUserNext} className="auth-form">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" type="text" name="name" placeholder="Rahul Sharma" value={userForm.name} onChange={uChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" name="email" placeholder="rahul@example.com" value={userForm.email} onChange={uChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-input" type="tel" name="phone" placeholder="9876543210" value={userForm.phone} onChange={uChange} maxLength={10} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input className="form-input" type="password" name="password" placeholder="Min 6 chars" value={userForm.password} onChange={uChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm *</label>
                  <input className="form-input" type="password" name="confirmPassword" placeholder="Repeat" value={userForm.confirmPassword} onChange={uChange} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg">Next: Add Address →</button>
            </form>
          )}

          {!isCollector && step === 2 && (
            <form onSubmit={handleUserSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input className="form-input" type="text" name="street" placeholder="House/Flat, Street, Locality" value={userForm.street} onChange={uChange} />
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">City</label>
                  <input className="form-input" name="city" value={userForm.city} onChange={uChange} /></div>
                <div className="form-group"><label className="form-label">Pincode</label>
                  <input className="form-input" name="pincode" placeholder="226001" value={userForm.pincode} onChange={uChange} maxLength={6} /></div>
              </div>
              <div className="form-group"><label className="form-label">State</label>
                <input className="form-input" name="state" value={userForm.state} onChange={uChange} /></div>
              <div className="form-row">
                <button type="button" className="btn btn-outline btn-lg" onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ flex: 1 }}>
                  {loading ? <><span className="spinner spinner-sm" /> Creating…</> : '🚀 Create Account'}
                </button>
              </div>
            </form>
          )}

          {/* ── COLLECTOR FORMS ── */}
          {isCollector && step === 1 && (
            <form onSubmit={handleCollNext} className="auth-form">
              <div className="form-group">
                <label className="form-label">Business Name *</label>
                <input className="form-input" type="text" name="businessName" placeholder="e.g. GreenCycle Scrap Hub" value={collForm.businessName} onChange={cChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Owner Name *</label>
                  <input className="form-input" type="text" name="name" placeholder="Your full name" value={collForm.name} onChange={cChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-input" type="tel" name="phone" placeholder="9876543210" value={collForm.phone} onChange={cChange} maxLength={10} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Business Email *</label>
                <input className="form-input" type="email" name="email" placeholder="business@example.com" value={collForm.email} onChange={cChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input className="form-input" type="password" name="password" placeholder="Min 6 chars" value={collForm.password} onChange={cChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm *</label>
                  <input className="form-input" type="password" name="confirmPassword" placeholder="Repeat" value={collForm.confirmPassword} onChange={cChange} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ background: 'var(--blue-500)' }}>
                Next: Service Area →
              </button>
            </form>
          )}

          {isCollector && step === 2 && (
            <form onSubmit={handleCollSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Business Address</label>
                <input className="form-input" name="street" placeholder="Street / Area" value={collForm.street} onChange={cChange} />
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">City</label>
                  <input className="form-input" name="city" value={collForm.city} onChange={cChange} /></div>
                <div className="form-group"><label className="form-label">Your Pincode *</label>
                  <input className="form-input" name="pincode" placeholder="226001" value={collForm.pincode} onChange={cChange} maxLength={6} required /></div>
              </div>
              <div className="form-group">
                <label className="form-label">Service Pincodes (comma-separated)</label>
                <input className="form-input" name="servicePincodes" placeholder="226001, 226002, 226003" value={collForm.servicePincodes} onChange={cChange} />
                <span className="form-error" style={{ color:'var(--text-muted)', fontSize:11 }}>Areas where you will collect scrap</span>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Work Start</label>
                  <input className="form-input" type="time" name="workStart" value={collForm.workStart} onChange={cChange} /></div>
                <div className="form-group"><label className="form-label">Work End</label>
                  <input className="form-input" type="time" name="workEnd" value={collForm.workEnd} onChange={cChange} /></div>
              </div>
              <div className="form-row">
                <button type="button" className="btn btn-outline btn-lg" onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="btn btn-lg" style={{ flex:1, background:'var(--blue-500)', color:'white' }} disabled={loading}>
                  {loading ? <><span className="spinner spinner-sm" /> Registering…</> : '🚚 Register Business'}
                </button>
              </div>
            </form>
          )}

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
