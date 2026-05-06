import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './AuthPages.css'

export default function LoginPage() {
  const { login }  = useAuth()
  const toast      = useToast()
  const navigate   = useNavigate()

  const [role, setRole]     = useState('user')   // 'user' | 'collector'
  const [form, setForm]     = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please enter email and password'); return }
    try {
      setLoading(true)
      const data = await login(form.email, form.password)

      // Role mismatch guard
      if (data.role !== role) {
        toast.error(`This account is registered as a ${data.role}. Please select the correct tab.`)
        return
      }

      toast.success('Welcome back! 🎉')
      navigate(data.role === 'collector' ? '/collector/dashboard' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = () => {
    setRole('user')
    setForm({ email: 'demo@wastekart.in', password: 'demo1234' })
    toast.info('Demo credentials filled!')
  }

  return (
    <div className="auth-page">
      {/* Left deco */}
      <div className="auth-deco">
        <div className="deco-blob" />
        <div className="auth-eco-info">
          <div className="eco-logo">♻️ WasteKart</div>
          <h2>{role === 'collector' ? 'Grow Your Collection Business' : 'Turn Waste Into Worth'}</h2>
          <p>
            {role === 'collector'
              ? 'Manage pickups, update your prices, track earnings and grow your recycling business.'
              : 'Join thousands of households already earning from their scrap and making the planet greener.'}
          </p>
          <div className="eco-bullets">
            {role === 'collector' ? <>
              <div>📦 Manage assigned pickups</div>
              <div>💰 Set your own material prices</div>
              <div>📊 Track earnings & performance</div>
              <div>🗺️ Live map pickup tracking</div>
            </> : <>
              <div>✅ AI-powered material detection</div>
              <div>💰 Best prices from local collectors</div>
              <div>🌱 Track your environmental impact</div>
              <div>🚚 Doorstep pickup booking</div>
            </>}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="auth-form-side">
        <div className="auth-form-card fade-up">

          {/* Role toggle tabs */}
          <div className="role-tabs">
            <button
              className={`role-tab ${role === 'user' ? 'active' : ''}`}
              onClick={() => setRole('user')}
            >
              👤 I'm a User
            </button>
            <button
              className={`role-tab ${role === 'collector' ? 'active' : ''}`}
              onClick={() => setRole('collector')}
            >
              🚚 I'm a Collector
            </button>
          </div>

          <div className="auth-header">
            <div className="auth-icon">{role === 'collector' ? '🚚' : '👋'}</div>
            <h1>Welcome Back</h1>
            <p>{role === 'collector' ? 'Sign in to your Collector account' : 'Sign in to your WasteKart account'}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">{role === 'collector' ? 'Business Email' : 'Email Address'}</label>
              <input
                className="form-input" type="email" name="email"
                placeholder={role === 'collector' ? 'business@example.com' : 'you@example.com'}
                value={form.email} onChange={handleChange} required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input" type="password" name="password"
                placeholder="••••••••" value={form.password} onChange={handleChange} required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading
                ? <><span className="spinner spinner-sm" /> Signing in…</>
                : `🔐 Sign In as ${role === 'collector' ? 'Collector' : 'User'}`}
            </button>
          </form>

          {role === 'user' && <>
            <div className="auth-divider"><span>or</span></div>
            <div className="demo-login">
              <p>Try the demo account:</p>
              <button className="btn btn-outline btn-full" onClick={fillDemo}>🎮 Use Demo Account</button>
            </div>
          </>}

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to={role === 'collector' ? '/register?role=collector' : '/register'}>
              Sign up free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
