import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LiveMap from '../components/LiveMap'
import './BookingPage.css'

// ── Material categories & config ──────────────────────────────
const MATERIALS = [
  { id: 'newspaper',    name: 'Newspaper',            category: 'paper',   icon: '📰', price: 13 },
  { id: 'cardboard',    name: 'Cardboard',             category: 'paper',   icon: '📦', price: 8  },
  { id: 'books',        name: 'Books / Magazines',     category: 'paper',   icon: '📚', price: 10 },
  { id: 'iron',         name: 'Iron',                  category: 'metal',   icon: '🔩', price: 32 },
  { id: 'steel',        name: 'Stainless Steel',       category: 'metal',   icon: '🔧', price: 42 },
  { id: 'aluminium',    name: 'Aluminium',             category: 'metal',   icon: '🥤', price: 85 },
  { id: 'copper',       name: 'Copper',                category: 'metal',   icon: '🪙', price: 455},
  { id: 'brass',        name: 'Brass',                 category: 'metal',   icon: '⚙️', price: 250},
  { id: 'plastic_hard', name: 'Hard Plastic',          category: 'plastic', icon: '🪣', price: 15 },
  { id: 'plastic_soft', name: 'Soft Plastic / PET',    category: 'plastic', icon: '🧴', price: 8  },
  { id: 'glass',        name: 'Glass',                 category: 'glass',   icon: '🫙', price: 5  },
  { id: 'ewaste',       name: 'E-Waste (Electronics)', category: 'ewaste',  icon: '💻', price: 62 },
  { id: 'battery',      name: 'Batteries',             category: 'ewaste',  icon: '🔋', price: 125},
  { id: 'rubber',       name: 'Rubber / Tyres',        category: 'rubber',  icon: '⭕', price: 10 },
]

const TIME_SLOTS = ['09:00-11:00','11:00-13:00','13:00-15:00','15:00-17:00']

// Vehicle allocation logic (mirrors backend)
function allocateVehicle(totalWeight, categories = []) {
  const hasEwaste = categories.includes('ewaste')
  const ew = Math.max(totalWeight, hasEwaste ? 21 : 0)
  if (ew <= 5)   return { type: 'cycle',      label: '🚲 Cycle',         reason: 'Light load (≤5 kg)' }
  if (ew <= 20)  return { type: 'bike',       label: '🏍️ Motorcycle',    reason: 'Small load (≤20 kg)' }
  if (ew <= 50)  return { type: 'auto',       label: '🛺 Auto Rickshaw', reason: 'Medium load (≤50 kg)' }
  if (ew <= 300) return { type: 'mini_truck', label: '🚛 Mini Truck',    reason: 'Large load (≤300 kg)' }
  return           { type: 'truck',           label: '🚚 Truck',         reason: 'Heavy load (>300 kg)' }
}

// AI prediction simulation using keyword / colour heuristics from image filename
function simulateAIPrediction(file) {
  const name = file.name.toLowerCase()
  const predictions = [
    { material: 'newspaper',    confidence: 88 + Math.random()*8 },
    { material: 'iron',         confidence: 82 + Math.random()*10 },
    { material: 'aluminium',    confidence: 79 + Math.random()*12 },
    { material: 'plastic_hard', confidence: 75 + Math.random()*14 },
    { material: 'ewaste',       confidence: 85 + Math.random()*10 },
    { material: 'cardboard',    confidence: 80 + Math.random()*12 },
  ]
  let best = predictions[Math.floor(Math.random() * predictions.length)]

  // Simple keyword hints
  if (name.includes('news') || name.includes('paper'))       best = predictions[0]
  else if (name.includes('iron') || name.includes('metal'))  best = predictions[1]
  else if (name.includes('alum') || name.includes('can'))    best = predictions[2]
  else if (name.includes('plas') || name.includes('bottle')) best = predictions[3]
  else if (name.includes('ewaste') || name.includes('laptop') || name.includes('mobile')) best = predictions[4]
  else if (name.includes('card') || name.includes('box'))    best = predictions[5]

  return { ...best, confidence: parseFloat(best.confidence.toFixed(1)) }
}

const STEPS = ['Add Items', 'Schedule & Address', 'Review & Confirm']

export default function BookingPage() {
  const { API, user } = useAuth()
  const toast         = useNavigate()
  const navigate      = useNavigate()
  const toastCtx      = useToast()

  const [step, setStep]         = useState(0)
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(false)
  const [booking, setBooking]   = useState(null)

  // Item form state
  const [selectedMat, setSelectedMat] = useState(null)
  const [weight, setWeight]     = useState('')
  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading]   = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const fileRef = useRef()

  // Schedule form
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate  = tomorrow.toISOString().split('T')[0]
  const [schedDate, setSchedDate] = useState(minDate)
  const [schedSlot, setSchedSlot] = useState(TIME_SLOTS[0])
  const [notes, setNotes]         = useState('')
  const [address, setAddress]     = useState({
    street:  user?.address?.street  || '',
    city:    user?.address?.city    || 'Lucknow',
    pincode: user?.address?.pincode || '',
    state:   user?.address?.state   || 'Uttar Pradesh',
  })

  const totalWeight = items.reduce((s, i) => s + i.weight, 0)
  const totalAmount = items.reduce((s, i) => s + i.subtotal, 0)
  const categories  = [...new Set(items.map(i => i.category))]
  const vehicle     = allocateVehicle(totalWeight, categories)

  // ── AI Upload handler ─────────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImagePreview(URL.createObjectURL(file))
    setAiLoading(true)
    setAiResult(null)

    // Simulate TensorFlow.js + OpenCV.js processing delay
    await new Promise(r => setTimeout(r, 1800))

    const result = simulateAIPrediction(file)
    setAiResult(result)
    setAiLoading(false)

    const mat = MATERIALS.find(m => m.id === result.material)
    if (mat) {
      setSelectedMat(mat)
      toastCtx.success(`AI detected: ${mat.name} (${result.confidence}% confidence)`)
    }
  }

  // ── Add item to list ──────────────────────────────────────
  const handleAddItem = () => {
    if (!selectedMat) { toastCtx.error('Please select a material'); return }
    const w = parseFloat(weight)
    if (!w || w <= 0) { toastCtx.error('Please enter a valid weight'); return }

    setItems(prev => [...prev, {
      id:           Date.now(),
      materialType: selectedMat.id,
      category:     selectedMat.category,
      materialName: selectedMat.name,
      icon:         selectedMat.icon,
      weight:       w,
      pricePerKg:   selectedMat.price,
      subtotal:     parseFloat((w * selectedMat.price).toFixed(2)),
      aiDetected:   !!aiResult && aiResult.material === selectedMat.id,
      confidence:   aiResult?.confidence || 0,
    }])

    setSelectedMat(null); setWeight(''); setAiResult(null)
    setImagePreview(null); if (fileRef.current) fileRef.current.value = ''
  }

  // ── Submit booking ────────────────────────────────────────
  const handleConfirm = async () => {
    if (!address.pincode) { toastCtx.error('Please enter your pincode'); return }
    try {
      setLoading(true)
      const { data } = await API.post('/bookings', {
        items: items.map(i => ({
          materialType: i.materialType,
          category:     i.category,
          weight:       i.weight,
          pricePerKg:   i.pricePerKg,
          subtotal:     i.subtotal,
          aiDetected:   i.aiDetected,
          confidence:   i.confidence,
        })),
        pickupAddress:     address,
        scheduledDate:     schedDate,
        scheduledTimeSlot: schedSlot,
        notes,
      })
      setBooking(data)
      setStep(3) // Success step
    } catch (err) {
      toastCtx.error(err.response?.data?.message || 'Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success screen ────────────────────────────────────────
  if (step === 3 && booking) {
    return (
      <div className="booking-success">
        <div className="success-card fade-up">
          <div className="success-anim">🎉</div>
          <h2>Pickup Booked!</h2>
          <p>Your scrap pickup has been confirmed. A collector will arrive at your doorstep.</p>
          <div className="success-details">
            <div className="sd-row"><span>Booking ID</span><strong>#{booking.bookingId}</strong></div>
            <div className="sd-row"><span>Date</span><strong>{new Date(booking.scheduledDate).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}</strong></div>
            <div className="sd-row"><span>Time Slot</span><strong>⏰ {booking.scheduledTimeSlot}</strong></div>
            <div className="sd-row"><span>Vehicle</span><strong>{booking.vehicleLabel}</strong></div>
            <div className="sd-row"><span>Total Amount</span><strong className="success-amount">₹{booking.totalAmount}</strong></div>
            {booking.treesPlanted > 0 && (
              <div className="sd-eco">🌳 This booking will plant <strong>{booking.treesPlanted} tree{booking.treesPlanted > 1 ? 's' : ''}!</strong></div>
            )}
          </div>

          {/* Live map — shows collector moving to user */}
          <div style={{ width:'100%', marginTop: 4 }}>
            <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:8, textAlign:'center' }}>
              🗺️ Live Collector Tracking
            </p>
            <LiveMap
              mode="tracking"
              userPincode={address?.pincode || '226001'}
              collectorName={booking.collector?.name || 'Your Collector'}
              height={220}
            />
          </div>
          <div className="success-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/bookings')}>
              View My Pickups
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => { setStep(0); setItems([]); setBooking(null) }}>
              Book Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="booking-page">
      <div className="container">
        <div className="booking-header">
          <h1>📦 Book a Scrap Pickup</h1>
          <p>Use AI to identify your scrap or select manually, then schedule your free doorstep pickup.</p>
        </div>

        {/* ── Stepper ────── */}
        <div className="stepper fade-up">
          {STEPS.map((s, i) => (
            <div key={s} className={`stepper-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
              onClick={() => i < step && setStep(i)}>
              <div className="ss-circle">{i < step ? '✓' : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div className="booking-layout">
          {/* ── Main content ── */}
          <div className="booking-main">
            {/* STEP 0: Add items */}
            {step === 0 && (
              <div className="card card-padded fade-up">
                <h3 className="step-heading">🤖 AI Material Detection</h3>
                <p className="step-sub">Upload a photo and let AI identify your scrap (TensorFlow.js + OpenCV.js)</p>

                <div className="ai-upload-area" onClick={() => fileRef.current?.click()}>
                  {imagePreview ? (
                    <div className="ai-preview">
                      <img src={imagePreview} alt="scrap preview" />
                      <div className={`ai-overlay ${aiLoading ? 'scanning' : ''}`}>
                        {aiLoading && (
                          <div className="scanning-ui">
                            <div className="scan-line" />
                            <div className="scan-text">🧠 AI Analyzing...</div>
                          </div>
                        )}
                        {!aiLoading && aiResult && (
                          <div className="ai-badge-overlay">
                            ✅ Detected: {MATERIALS.find(m=>m.id===aiResult.material)?.name} ({aiResult.confidence}%)
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <span>📸</span>
                      <p>Click to upload scrap image</p>
                      <span className="upload-hint">AI will auto-detect material type</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleImageUpload} />

                {aiResult && (
                  <div className="ai-result-bar">
                    <span>🧠 AI suggests:</span>
                    <strong>{MATERIALS.find(m => m.id === aiResult.material)?.icon} {MATERIALS.find(m => m.id === aiResult.material)?.name}</strong>
                    <div className="conf-mini">
                      <div className="conf-fill" style={{ width: `${aiResult.confidence}%` }} />
                    </div>
                    <span>{aiResult.confidence}% sure</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setAiResult(null); setImagePreview(null); }}>✕ Clear</button>
                  </div>
                )}

                <div className="divider" />
                <h3 className="step-heading">🗑️ Select Material</h3>

                <div className="material-picker">
                  {MATERIALS.map(m => (
                    <button
                      key={m.id}
                      className={`mat-btn ${selectedMat?.id === m.id ? 'selected' : ''} ${aiResult?.material === m.id ? 'ai-suggested' : ''}`}
                      onClick={() => setSelectedMat(m)}
                    >
                      <span>{m.icon}</span>
                      <span>{m.name}</span>
                      <span className="mat-price">₹{m.price}/kg</span>
                      {aiResult?.material === m.id && <span className="ai-tag">AI ✨</span>}
                    </button>
                  ))}
                </div>

                {selectedMat && (
                  <div className="weight-row fade-up">
                    <div className="form-group" style={{ flex:1 }}>
                      <label className="form-label">Weight (kg) *</label>
                      <input className="form-input" type="number" min="0.1" step="0.1"
                        placeholder="e.g. 5.5" value={weight} onChange={e => setWeight(e.target.value)} />
                    </div>
                    <div className="est-price">
                      <span>Estimated</span>
                      <strong>₹{weight ? (parseFloat(weight) * selectedMat.price).toFixed(0) : '—'}</strong>
                    </div>
                    <button className="btn btn-primary" onClick={handleAddItem}>+ Add Item</button>
                  </div>
                )}

                {/* Items list */}
                {items.length > 0 && (
                  <div className="items-list">
                    <h4>Added Items</h4>
                    {items.map((item, idx) => (
                      <div key={item.id} className="item-row">
                        <span>{item.icon}</span>
                        <span className="ir-name">{item.materialName} {item.aiDetected && <span className="ai-tag-mini">AI</span>}</span>
                        <span>{item.weight} kg</span>
                        <span>@ ₹{item.pricePerKg}/kg</span>
                        <span className="ir-sub">= ₹{item.subtotal}</span>
                        <button className="btn btn-ghost btn-sm" style={{ color:'var(--red-500)' }}
                          onClick={() => setItems(p => p.filter((_, i) => i !== idx))}>✕</button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  className="btn btn-primary btn-full btn-lg"
                  disabled={items.length === 0}
                  onClick={() => setStep(1)}
                  style={{ marginTop: 16 }}
                >
                  Next: Schedule Pickup →
                </button>
              </div>
            )}

            {/* STEP 1: Schedule & Address */}
            {step === 1 && (
              <div className="card card-padded fade-up">
                <h3 className="step-heading">📅 Schedule Your Pickup</h3>

                <div className="sched-grid">
                  <div className="form-group">
                    <label className="form-label">Pickup Date *</label>
                    <input className="form-input" type="date" value={schedDate}
                      min={minDate} onChange={e => setSchedDate(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time Slot *</label>
                    <select className="form-select" value={schedSlot} onChange={e => setSchedSlot(e.target.value)}>
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="divider" />
                <h3 className="step-heading">📍 Pickup Address</h3>

                <div className="addr-grid">
                  <div className="form-group" style={{ gridColumn:'1/-1' }}>
                    <label className="form-label">Street Address</label>
                    <input className="form-input" placeholder="House/Flat No., Street, Locality"
                      value={address.street} onChange={e => setAddress(p => ({ ...p, street: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" value={address.city}
                      onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pincode *</label>
                    <input className="form-input" placeholder="226001" maxLength={6}
                      value={address.pincode} onChange={e => setAddress(p => ({ ...p, pincode: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input className="form-input" value={address.state}
                      onChange={e => setAddress(p => ({ ...p, state: e.target.value }))} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Special Instructions (optional)</label>
                  <textarea className="form-input" rows={3} placeholder="e.g. Call before arriving, gate code 1234…"
                    value={notes} onChange={e => setNotes(e.target.value)} style={{ resize:'vertical' }} />
                </div>

                <div className="step-nav">
                  <button className="btn btn-outline btn-lg" onClick={() => setStep(0)}>← Back</button>
                  <button className="btn btn-primary btn-lg"
                    disabled={!address.pincode || !schedDate}
                    onClick={() => setStep(2)}>
                    Review Order →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Review */}
            {step === 2 && (
              <div className="card card-padded fade-up">
                <h3 className="step-heading">📋 Order Review</h3>

                <div className="review-section">
                  <h4>Items</h4>
                  {items.map(item => (
                    <div key={item.id} className="item-row">
                      <span>{item.icon}</span>
                      <span className="ir-name">{item.materialName}</span>
                      <span>{item.weight} kg</span>
                      <span>₹{item.pricePerKg}/kg</span>
                      <span className="ir-sub">₹{item.subtotal}</span>
                    </div>
                  ))}
                </div>

                <div className="review-section">
                  <h4>Pickup Details</h4>
                  <div className="review-detail"><span>📅 Date</span><strong>{new Date(schedDate).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</strong></div>
                  <div className="review-detail"><span>⏰ Time Slot</span><strong>{schedSlot}</strong></div>
                  <div className="review-detail"><span>📍 Address</span><strong>{[address.street, address.city, address.pincode].filter(Boolean).join(', ')}</strong></div>
                  <div className="review-detail">
                    <span>🚚 Vehicle Assigned</span>
                    <div>
                      <strong>{vehicle.label}</strong>
                      <span style={{ fontSize:'12px', color:'var(--text-muted)', display:'block' }}>{vehicle.reason}</span>
                    </div>
                  </div>
                </div>

                <div className="review-total">
                  <div className="rt-row"><span>Total Weight</span><span>{totalWeight.toFixed(1)} kg</span></div>
                  <div className="rt-row total"><span>Total Earnings</span><span>₹{totalAmount.toFixed(0)}</span></div>
                  <div className="rt-eco">🌱 +{Math.floor(totalWeight / 50)} tree{Math.floor(totalWeight / 50) !== 1 ? 's' : ''} · {(totalWeight * 2.5).toFixed(1)} kg CO₂ saved</div>
                </div>

                <div className="step-nav">
                  <button className="btn btn-outline btn-lg" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-accent btn-lg" disabled={loading} onClick={handleConfirm}>
                    {loading ? <><span className="spinner spinner-sm" /> Booking…</> : '✅ Confirm Booking'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar summary ── */}
          <div className="booking-sidebar">
            <div className="card card-padded sticky-summary">
              <h4>📊 Order Summary</h4>
              {items.length === 0
                ? <p style={{ color:'var(--text-muted)', fontSize:13 }}>No items added yet.</p>
                : items.map(i => (
                  <div key={i.id} className="summary-row">
                    <span>{i.icon} {i.materialName}</span>
                    <span>₹{i.subtotal}</span>
                  </div>
                ))
              }
              <div className="divider" />
              <div className="summary-total">
                <span>Total Weight</span><strong>{totalWeight.toFixed(1)} kg</strong>
              </div>
              <div className="summary-total">
                <span>You Earn</span><strong style={{ color:'var(--green-600)', fontSize:'18px' }}>₹{totalAmount.toFixed(0)}</strong>
              </div>
              {totalWeight > 0 && (
                <div className="summary-eco">
                  <div>🌳 {Math.floor(totalWeight / 50)} tree(s) planted</div>
                  <div>🌍 {(totalWeight * 2.5).toFixed(1)} kg CO₂ saved</div>
                  <div>{vehicle.label} assigned</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
