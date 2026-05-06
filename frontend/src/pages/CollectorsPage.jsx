import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import LiveMap from '../components/LiveMap'
import './CollectorsPage.css'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const VEHICLE_LABELS = {
  cycle: '🚲', bike: '🏍️', auto: '🛺', mini_truck: '🚛', truck: '🚚'
}

export default function CollectorsPage() {
  const [collectors, setCollectors] = useState([])
  const [loading, setLoading]       = useState(true)
  const [pincode, setPincode]       = useState('')
  const [material, setMaterial]     = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (pincode)  params.set('pincode', pincode)
    if (material) params.set('material', material)
    axios.get(`${API_URL}/collectors?${params}`)
      .then(r => setCollectors(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [pincode, material])

  return (
    <div className="collectors-page">
      <div className="container">
        <div className="coll-hero">
          <div>
            <h1>🤝 Our Collector Network</h1>
            <p>Verified, trusted scrap collectors across Lucknow — rated by customers like you.</p>
          </div>
          <Link to="/book" className="btn btn-primary btn-lg">📦 Book Pickup</Link>
        </div>

        {/* Filters */}
        <div className="coll-filters fade-up">
          <input className="form-input" placeholder="📍 Filter by pincode"
            value={pincode} maxLength={6}
            onChange={e => setPincode(e.target.value)} style={{ width: 180 }} />
          <select className="form-select" value={material} onChange={e => setMaterial(e.target.value)} style={{ width: 200 }}>
            <option value="">All Materials</option>
            <option value="newspaper">Newspaper</option>
            <option value="iron">Iron</option>
            <option value="aluminium">Aluminium</option>
            <option value="copper">Copper</option>
            <option value="ewaste">E-Waste</option>
            <option value="plastic_hard">Hard Plastic</option>
            <option value="battery">Battery</option>
          </select>
        </div>

        {/* Live map showing all collectors */}
        {!loading && collectors.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize:15, marginBottom:12 }}>🗺️ Collectors Near You</h3>
            <LiveMap
              mode="browse"
              collectors={collectors}
              userPincode={pincode || '226001'}
              height={300}
            />
          </div>
        )}

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}>
            <div className="spinner" />
          </div>
        ) : collectors.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🤝</div>
            <h3>No collectors found</h3>
            <p>Try a different pincode or material filter</p>
          </div>
        ) : (
          <div className="collectors-grid fade-up">
            {collectors.map(c => (
              <div key={c._id} className="collector-card">
                <div className="cc-head">
                  <div className="cc-avatar">{c.name[0]}</div>
                  <div className="cc-info">
                    <div className="cc-name">{c.name}</div>
                    <div className="cc-owner">👤 {c.ownerName}</div>
                    <div className="cc-rating">
                      {'⭐'.repeat(Math.round(c.rating))} <span>{c.rating}</span>
                      <span className="cc-pickups">· {c.totalPickups} pickups</span>
                    </div>
                  </div>
                  <div className={`cc-avail ${c.isAvailable ? 'available' : 'unavailable'}`}>
                    {c.isAvailable ? '🟢 Available' : '🔴 Busy'}
                  </div>
                </div>

                <p className="cc-desc">{c.description}</p>

                {/* Vehicles */}
                <div className="cc-vehicles">
                  {c.vehicleTypes?.map(v => (
                    <span key={v} className="veh-badge">{VEHICLE_LABELS[v]} {v.replace('_',' ')}</span>
                  ))}
                </div>

                {/* Areas */}
                {c.servicePincodes?.length > 0 && (
                  <div className="cc-pincodes">
                    📍 Serves: {c.servicePincodes.slice(0, 4).join(', ')}{c.servicePincodes.length > 4 ? ' +more' : ''}
                  </div>
                )}

                {/* Top materials */}
                <div className="cc-materials">
                  {c.materials?.slice(0, 5).map(m => (
                    <div key={m.material} className="cc-mat-row">
                      <span style={{ textTransform:'capitalize' }}>{m.material.replace('_',' ')}</span>
                      <span className="cc-mat-price">₹{m.pricePerKg}/kg</span>
                    </div>
                  ))}
                  {c.materials?.length > 5 && (
                    <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>+{c.materials.length - 5} more materials</p>
                  )}
                </div>

                {/* Hours */}
                <div className="cc-hours">
                  ⏰ {c.workingHours?.start} – {c.workingHours?.end}
                  &nbsp;·&nbsp; 📞 {c.phone}
                </div>

                <Link to="/book" className="btn btn-primary btn-full btn-sm" style={{ marginTop: 12 }}>
                  Book with This Collector →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
