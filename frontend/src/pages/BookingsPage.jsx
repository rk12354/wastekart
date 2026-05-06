import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './BookingsPage.css'

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     color: 'amber',  icon: '⏳', desc: 'Awaiting collector assignment' },
  confirmed:   { label: 'Confirmed',   color: 'blue',   icon: '✅', desc: 'Collector assigned' },
  in_progress: { label: 'In Progress', color: 'purple', icon: '🚚', desc: 'Collector on the way' },
  completed:   { label: 'Completed',   color: 'green',  icon: '🎉', desc: 'Scrap collected & paid' },
  cancelled:   { label: 'Cancelled',   color: 'red',    icon: '❌', desc: 'Booking cancelled' },
}

const VEHICLE_LABELS = {
  cycle: '🚲 Cycle', bike: '🏍️ Bike', auto: '🛺 Auto', mini_truck: '🚛 Mini Truck', truck: '🚚 Truck'
}

export default function BookingsPage() {
  const { API } = useAuth()
  const toast   = useToast()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)
  const [expanded, setExpanded] = useState(null)

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ page, limit: 10 })
      if (filter !== 'all') params.set('status', filter)
      const { data } = await API.get(`/bookings/my?${params}`)
      setBookings(data.bookings)
      setTotal(data.total)
    } catch (err) {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBookings() }, [filter, page])

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    try {
      await API.put(`/bookings/${id}/cancel`)
      toast.success('Booking cancelled')
      fetchBookings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking')
    }
  }

  const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled']

  return (
    <div className="bookings-page">
      <div className="container">
        <div className="bk-header">
          <div>
            <h1>🚚 My Pickups</h1>
            <p>Track and manage all your scrap pickup bookings</p>
          </div>
          <Link to="/book" className="btn btn-primary btn-lg">+ New Pickup</Link>
        </div>

        {/* Filter tabs */}
        <div className="filter-tabs fade-up">
          {STATUS_FILTERS.map(s => (
            <button key={s}
              className={`filter-tab ${filter === s ? 'active' : ''}`}
              onClick={() => { setFilter(s); setPage(1) }}>
              {s === 'all' ? '🗂 All' : `${STATUS_CONFIG[s]?.icon || ''} ${STATUS_CONFIG[s]?.label || s}`}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}>
            <div className="spinner" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📦</div>
            <h3>No pickups found</h3>
            <p>{filter === 'all' ? "You haven't booked any pickups yet." : `No ${filter} bookings found.`}</p>
            <Link to="/book" className="btn btn-primary btn-lg" style={{ marginTop: 12 }}>Book Your First Pickup</Link>
          </div>
        ) : (
          <div className="bookings-list fade-up">
            {bookings.map(b => {
              const st  = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending
              const isExpanded = expanded === b._id
              return (
                <div key={b._id} className={`booking-card ${isExpanded ? 'expanded' : ''}`}>
                  {/* Card header — always visible */}
                  <div className="bc-head" onClick={() => setExpanded(isExpanded ? null : b._id)}>
                    <div className="bc-id">
                      <span className={`status-dot status-dot-${st.color}`} />
                      <span className="bc-bid">#{b.bookingId}</span>
                    </div>

                    <div className="bc-meta">
                      <span>📅 {new Date(b.scheduledDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                      <span>⏰ {b.scheduledTimeSlot}</span>
                      <span>{VEHICLE_LABELS[b.vehicleType] || b.vehicleType}</span>
                    </div>

                    <div className="bc-right">
                      <span className="bc-weight">{b.totalWeight} kg</span>
                      <span className="bc-amount">₹{b.totalAmount}</span>
                      <span className={`badge status-${b.status}`}>{st.icon} {st.label}</span>
                      <span className="bc-chevron">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="bc-body">
                      <div className="bc-grid">
                        {/* Items */}
                        <div className="bc-section">
                          <h4>Items</h4>
                          {b.items.map((item, i) => (
                            <div key={i} className="bc-item-row">
                              <span>{item.materialType.replace('_', ' ')}</span>
                              <span>{item.weight} kg</span>
                              <span>₹{item.pricePerKg}/kg</span>
                              <span className="bc-item-sub">₹{item.subtotal}</span>
                              {item.aiDetected && <span className="ai-tag-mini">AI</span>}
                            </div>
                          ))}
                        </div>

                        {/* Collector */}
                        {b.collector && (
                          <div className="bc-section">
                            <h4>Assigned Collector</h4>
                            <div className="bc-collector">
                              <div className="bc-coll-avatar">{b.collector.name?.[0]}</div>
                              <div>
                                <strong>{b.collector.name}</strong>
                                <span>⭐ {b.collector.rating} · 📞 {b.collector.phone}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Eco */}
                        <div className="bc-section">
                          <h4>Environmental Impact</h4>
                          <div className="bc-eco">
                            <span>🌳 {b.treesPlanted} tree{b.treesPlanted !== 1 ? 's' : ''} planted</span>
                            <span>🌍 {b.co2Saved} kg CO₂ saved</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="bc-actions">
                        {['pending', 'confirmed'].includes(b.status) && (
                          <button className="btn btn-outline btn-sm" style={{ color:'var(--red-500)', borderColor:'var(--red-500)' }}
                            onClick={() => handleCancel(b._id)}>
                            Cancel Booking
                          </button>
                        )}
                        <span className="bc-status-desc">{st.desc}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {total > 10 && (
          <div className="pagination">
            <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ fontSize:13, color:'var(--text-muted)' }}>Page {page} of {Math.ceil(total / 10)}</span>
            <button className="btn btn-outline btn-sm" disabled={page >= Math.ceil(total / 10)} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}
