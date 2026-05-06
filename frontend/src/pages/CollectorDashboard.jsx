import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LiveMap from '../components/LiveMap'
import './CollectorDashboard.css'

const ALL_MATERIALS = [
  { id: 'newspaper',    name: 'Newspaper',          icon: '📰', category: 'paper'   },
  { id: 'cardboard',    name: 'Cardboard',           icon: '📦', category: 'paper'   },
  { id: 'books',        name: 'Books/Magazines',     icon: '📚', category: 'paper'   },
  { id: 'iron',         name: 'Iron',                icon: '🔩', category: 'metal'   },
  { id: 'steel',        name: 'Stainless Steel',     icon: '🔧', category: 'metal'   },
  { id: 'aluminium',    name: 'Aluminium',           icon: '🥤', category: 'metal'   },
  { id: 'copper',       name: 'Copper',              icon: '🪙', category: 'metal'   },
  { id: 'brass',        name: 'Brass',               icon: '⚙️', category: 'metal'   },
  { id: 'plastic_hard', name: 'Hard Plastic',        icon: '🪣', category: 'plastic' },
  { id: 'plastic_soft', name: 'Soft Plastic/PET',    icon: '🧴', category: 'plastic' },
  { id: 'glass',        name: 'Glass',               icon: '🫙', category: 'glass'   },
  { id: 'ewaste',       name: 'E-Waste',             icon: '💻', category: 'ewaste'  },
  { id: 'battery',      name: 'Batteries',           icon: '🔋', category: 'ewaste'  },
  { id: 'rubber',       name: 'Rubber/Tyres',        icon: '⭕', category: 'rubber'  },
]

const STATUS_OPTS = [
  { value: 'confirmed',   label: '✅ Confirm',      color: 'blue'   },
  { value: 'in_progress', label: '🚚 On The Way',   color: 'purple' },
  { value: 'completed',   label: '🎉 Completed',    color: 'green'  },
]

export default function CollectorDashboard() {
  const { user, API } = useAuth()
  const toast         = useToast()

  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats]         = useState(null)
  const [bookings, setBookings]   = useState([])
  const [prices, setPrices]       = useState({})   // { material_id: pricePerKg }
  const [savingPrices, setSavingPrices] = useState(false)
  const [loadingStats, setLoadingStats] = useState(true)
  const [trackingBooking, setTrackingBooking] = useState(null)

  // ── Load overview stats ───────────────────────────────────
  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'bookings') {
      API.get('/collector/stats')
        .then(r => setStats(r.data))
        .catch(() => toast.error('Failed to load stats'))
        .finally(() => setLoadingStats(false))
    }
  }, [activeTab])

  // ── Load bookings ─────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'bookings') {
      API.get('/collector/bookings')
        .then(r => setBookings(r.data.bookings || []))
        .catch(() => {})
    }
  }, [activeTab])

  // ── Load prices ───────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'prices') {
      API.get('/collector/prices').then(r => {
        const map = {}
        r.data.materials.forEach(m => { map[m.material] = m.pricePerKg })
        setPrices(map)
      }).catch(() => {})
    }
  }, [activeTab])

  // ── Update booking status ─────────────────────────────────
  const updateStatus = async (bookingId, status) => {
    try {
      await API.put(`/collector/booking/${bookingId}/status`, { status })
      toast.success('Status updated!')
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status } : b))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    }
  }

  // ── Save prices ───────────────────────────────────────────
  const savePrices = async () => {
    try {
      setSavingPrices(true)
      const materials = Object.entries(prices)
        .filter(([_, v]) => v > 0)
        .map(([material, pricePerKg]) => ({ material, pricePerKg: Number(pricePerKg) }))
      await API.put('/collector/prices', { materials })
      toast.success('Prices updated successfully! 💰')
    } catch (err) {
      toast.error('Failed to save prices')
    } finally { setSavingPrices(false) }
  }

  const collectorName = stats?.collector?.name || user?.name

  if (loadingStats && activeTab === 'overview') return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}>
      <div className="spinner" />
    </div>
  )

  return (
    <div className="collector-dash">
      <div className="container">
        {/* Header */}
        <div className="cd-header fade-up">
          <div className="cd-header-left">
            <div className="cd-avatar">{collectorName?.[0]?.toUpperCase() || 'C'}</div>
            <div>
              <h1>{collectorName}</h1>
              <div className="cd-meta">
                <span>🚚 Collector Dashboard</span>
                {stats?.collector && <>
                  <span>⭐ {stats.collector.rating}</span>
                  <span className={`cd-avail ${stats.collector.isAvailable ? 'on' : 'off'}`}>
                    {stats.collector.isAvailable ? '🟢 Available' : '🔴 Unavailable'}
                  </span>
                </>}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="cd-tabs fade-up">
          {[
            { id: 'overview',  label: '📊 Overview'    },
            { id: 'bookings',  label: '📦 Pickups'     },
            { id: 'prices',    label: '💰 My Prices'   },
            { id: 'map',       label: '🗺️ Live Map'    },
          ].map(t => (
            <button key={t.id} className={`cd-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ────────────────────────────── */}
        {activeTab === 'overview' && stats && (
          <div className="fade-up">
            <div className="cd-stat-grid">
              {[
                { icon: '📦', label: 'Total Pickups',   value: stats.totalPickups,          color: 'green'  },
                { icon: '⏳', label: 'Pending',          value: stats.pendingPickups,         color: 'amber'  },
                { icon: '🚚', label: 'In Progress',      value: stats.inProgress,             color: 'blue'   },
                { icon: '♻️', label: 'Total Collected',  value: `${stats.totalWeightCollected} kg`, color: 'lime' },
              ].map(s => (
                <div key={s.label} className={`cd-stat-card cd-stat-${s.color}`}>
                  <span className="cds-icon">{s.icon}</span>
                  <div>
                    <div className="cds-value">{s.value}</div>
                    <div className="cds-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cd-charts-grid">
              <div className="card card-padded">
                <h3 style={{ marginBottom:14, fontSize:15 }}>Monthly Pickups</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.monthlyData} barSize={24}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius:10, fontSize:12 }} />
                    <Bar dataKey="pickups" fill="var(--green-400)" radius={[5,5,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card card-padded">
                <h3 style={{ marginBottom:14, fontSize:15 }}>Monthly Weight Collected (kg)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stats.monthlyData}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius:10, fontSize:12 }} />
                    <Line type="monotone" dataKey="weight" stroke="var(--lime-600)" strokeWidth={2.5}
                      dot={{ r:4, fill:'var(--lime-500)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent bookings preview */}
            {stats.recentBookings?.length > 0 && (
              <div className="card card-padded" style={{ marginTop: 20 }}>
                <h3 style={{ marginBottom:14, fontSize:15 }}>Recent Assigned Pickups</h3>
                {stats.recentBookings.map(b => (
                  <div key={b._id} className="cd-recent-row">
                    <span className="mono">#{b.bookingId}</span>
                    <span>{b.totalWeight} kg</span>
                    <span>₹{b.totalAmount}</span>
                    <span className={`badge status-${b.status}`}>{b.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── BOOKINGS TAB ────────────────────────────── */}
        {activeTab === 'bookings' && (
          <div className="fade-up">
            {bookings.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📦</div>
                <h3>No pickups assigned yet</h3>
                <p>Bookings from users in your service pincodes will appear here</p>
              </div>
            ) : bookings.map(b => (
              <div key={b._id} className="cd-booking-card card card-padded">
                <div className="cdb-head">
                  <span className="mono">#{b.bookingId}</span>
                  <span className={`badge status-${b.status}`}>{b.status}</span>
                  <span className="cdb-date">
                    📅 {new Date(b.scheduledDate).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                    &nbsp;⏰ {b.scheduledTimeSlot}
                  </span>
                </div>

                {/* User info */}
                {b.user && (
                  <div className="cdb-user">
                    <span>👤 {b.user.name}</span>
                    <span>📞 {b.user.phone}</span>
                    {b.pickupAddress && (
                      <span>📍 {[b.pickupAddress.street, b.pickupAddress.city, b.pickupAddress.pincode].filter(Boolean).join(', ')}</span>
                    )}
                  </div>
                )}

                {/* Items */}
                <div className="cdb-items">
                  {b.items.map((item, i) => (
                    <span key={i} className="cdb-item-chip">
                      {item.materialType.replace('_',' ')} · {item.weight}kg · ₹{item.pricePerKg}/kg
                    </span>
                  ))}
                </div>

                <div className="cdb-footer">
                  <strong>Total: ₹{b.totalAmount} · {b.totalWeight}kg</strong>

                  {/* Status action buttons */}
                  <div className="cdb-actions">
                    {STATUS_OPTS.filter(s => {
                      if (b.status === 'pending')     return s.value === 'confirmed'
                      if (b.status === 'confirmed')   return s.value === 'in_progress'
                      if (b.status === 'in_progress') return s.value === 'completed'
                      return false
                    }).map(s => (
                      <button key={s.value} className="btn btn-primary btn-sm"
                        onClick={() => updateStatus(b._id, s.value)}>
                        {s.label}
                      </button>
                    ))}

                    {/* Track on map */}
                    {['confirmed','in_progress'].includes(b.status) && (
                      <button className="btn btn-outline btn-sm"
                        onClick={() => { setTrackingBooking(b); setActiveTab('map') }}>
                        🗺️ Track on Map
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PRICES TAB ──────────────────────────────── */}
        {activeTab === 'prices' && (
          <div className="fade-up">
            <div className="card card-padded">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                <div>
                  <h3>Set Your Material Prices</h3>
                  <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>
                    These prices will be shown to users on the Prices page. Leave 0 for materials you don't accept.
                  </p>
                </div>
                <button className="btn btn-primary btn-lg" disabled={savingPrices} onClick={savePrices}>
                  {savingPrices ? <><span className="spinner spinner-sm" /> Saving…</> : '💾 Save Prices'}
                </button>
              </div>

              <div className="price-editor-grid">
                {['paper','metal','plastic','glass','ewaste','rubber'].map(cat => (
                  <div key={cat} className="peg-category">
                    <div className="peg-cat-label">{cat.toUpperCase()}</div>
                    {ALL_MATERIALS.filter(m => m.category === cat).map(m => (
                      <div key={m.id} className="peg-row">
                        <span className="peg-icon">{m.icon}</span>
                        <span className="peg-name">{m.name}</span>
                        <div className="peg-input-wrap">
                          <span className="peg-rupee">₹</span>
                          <input
                            type="number" min="0" step="0.5"
                            className="form-input peg-input"
                            placeholder="0"
                            value={prices[m.id] || ''}
                            onChange={e => setPrices(p => ({ ...p, [m.id]: e.target.value }))}
                          />
                          <span className="peg-unit">/kg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div style={{ marginTop:20, display:'flex', justifyContent:'flex-end' }}>
                <button className="btn btn-accent btn-lg" disabled={savingPrices} onClick={savePrices}>
                  {savingPrices ? <><span className="spinner spinner-sm" /> Saving…</> : '💾 Save All Prices'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MAP TAB ─────────────────────────────────── */}
        {activeTab === 'map' && (
          <div className="fade-up">
            <div className="card card-padded">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <div>
                  <h3>🗺️ Live Pickup Map</h3>
                  <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>
                    {trackingBooking
                      ? `Tracking: #${trackingBooking.bookingId} → ${trackingBooking.user?.name}`
                      : 'Select a booking to track, or view your service area'}
                  </p>
                </div>
                {trackingBooking && (
                  <button className="btn btn-outline btn-sm" onClick={() => setTrackingBooking(null)}>
                    ✕ Clear Tracking
                  </button>
                )}
              </div>

              <LiveMap
                mode={trackingBooking ? 'tracking' : 'browse'}
                collectors={trackingBooking ? [] : (stats?.recentBookings ? [] : [])}
                userPincode={trackingBooking?.pickupAddress?.pincode || stats?.collector?.address?.pincode || '226001'}
                collectorName={collectorName}
                height={420}
              />

              {trackingBooking && (
                <div className="tracking-info-bar">
                  <span>📦 #{trackingBooking.bookingId}</span>
                  <span>👤 {trackingBooking.user?.name}</span>
                  <span>📍 {trackingBooking.pickupAddress?.city}, {trackingBooking.pickupAddress?.pincode}</span>
                  <span>⏰ {trackingBooking.scheduledTimeSlot}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
