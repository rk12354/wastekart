import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, API, updateUser } = useAuth()
  const toast = useToast()

  const [form, setForm] = useState({
    name:     user?.name    || '',
    phone:    user?.phone   || '',
    street:   user?.address?.street  || '',
    city:     user?.address?.city    || 'Lucknow',
    pincode:  user?.address?.pincode || '',
    state:    user?.address?.state   || 'Uttar Pradesh',
  })
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const handleChange    = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const handlePwChange  = e => setPwForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSave = async e => {
    e.preventDefault()
    try {
      setSaving(true)
      const { data } = await API.put('/auth/profile', {
        name:    form.name,
        phone:   form.phone,
        address: { street: form.street, city: form.city, pincode: form.pincode, state: form.state },
      })
      updateUser(data)
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async e => {
    e.preventDefault()
    if (pwForm.newPw !== pwForm.confirm) { toast.error('Passwords do not match'); return }
    if (pwForm.newPw.length < 6) { toast.error('Password must be at least 6 characters'); return }
    try {
      setSaving(true)
      await API.put('/auth/profile', { password: pwForm.newPw })
      toast.success('Password changed successfully!')
      setPwForm({ current: '', newPw: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed')
    } finally {
      setSaving(false)
    }
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="profile-title">👤 My Profile</h1>

        <div className="profile-layout">
          {/* ── Sidebar ─────────── */}
          <div className="profile-sidebar">
            <div className="card card-padded profile-card">
              <div className="profile-avatar">{initials}</div>
              <div className="profile-name">{user?.name}</div>
              <div className="profile-email">{user?.email}</div>
              <div className="profile-since">Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month:'long', year:'numeric' })}</div>
            </div>

            {/* Eco stats */}
            <div className="card card-padded eco-profile-card">
              <h4>🌿 Your Impact</h4>
              <div className="eco-stat-item"><span>♻️</span><div><strong>{user?.totalScrapKg || 0} kg</strong><p>Scrap Recycled</p></div></div>
              <div className="eco-stat-item"><span>🌳</span><div><strong>{user?.treesPlanted || 0}</strong><p>Trees Planted</p></div></div>
              <div className="eco-stat-item"><span>💰</span><div><strong>₹{(user?.totalEarnings || 0).toFixed(0)}</strong><p>Total Earned</p></div></div>
              <div className="eco-stat-item"><span>🌍</span><div><strong>{user?.co2Saved || 0} kg</strong><p>CO₂ Saved</p></div></div>
            </div>
          </div>

          {/* ── Main ─────────────── */}
          <div className="profile-main">
            <div className="profile-tabs">
              <button className={`ptab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>📝 Edit Profile</button>
              <button className={`ptab ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>🔑 Change Password</button>
            </div>

            {activeTab === 'profile' && (
              <div className="card card-padded fade-up">
                <h3 style={{ marginBottom: 20 }}>Personal Information</h3>
                <form onSubmit={handleSave}>
                  <div className="profile-form-grid">
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input className="form-input" name="name" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <input className="form-input" name="phone" value={form.phone} onChange={handleChange} maxLength={10} required />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1/-1' }}>
                      <label className="form-label">Email (cannot be changed)</label>
                      <input className="form-input" value={user?.email || ''} disabled style={{ opacity:.6, cursor:'not-allowed' }} />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1/-1' }}>
                      <label className="form-label">Street Address</label>
                      <input className="form-input" name="street" placeholder="House/Flat No., Street, Locality" value={form.street} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input className="form-input" name="city" value={form.city} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pincode</label>
                      <input className="form-input" name="pincode" placeholder="226001" maxLength={6} value={form.pincode} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input className="form-input" name="state" value={form.state} onChange={handleChange} />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={saving} style={{ marginTop: 20 }}>
                    {saving ? <><span className="spinner spinner-sm" /> Saving…</> : '💾 Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="card card-padded fade-up">
                <h3 style={{ marginBottom: 20 }}>Change Password</h3>
                <form onSubmit={handlePasswordChange}>
                  <div className="profile-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="form-group">
                      <label className="form-label">New Password *</label>
                      <input className="form-input" type="password" name="newPw" placeholder="Minimum 6 characters" value={pwForm.newPw} onChange={handlePwChange} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm New Password *</label>
                      <input className="form-input" type="password" name="confirm" placeholder="Repeat new password" value={pwForm.confirm} onChange={handlePwChange} required />
                    </div>
                  </div>
                  <div className="password-hint">
                    <span>ℹ️</span> Password must be at least 6 characters long.
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={saving} style={{ marginTop: 16 }}>
                    {saving ? <><span className="spinner spinner-sm" /> Updating…</> : '🔑 Update Password'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
