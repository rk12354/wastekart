import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import './LandingPage.css'

const STATS = [
  { value: '12,400+', label: 'Pickups Completed',  icon: '🚚' },
  { value: '850 T',   label: 'Scrap Recycled',     icon: '♻️' },
  { value: '2,400+',  label: 'Trees Planted',      icon: '🌳' },
  { value: '320+',    label: 'Collectors Network', icon: '🤝' },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Upload or Describe Scrap', desc: 'Take a photo of your scrap. Our AI (TensorFlow.js + OpenCV.js) instantly identifies the material type.', icon: '📸' },
  { step: '02', title: 'Get Best Prices',           desc: 'Compare real-time prices from verified local collectors in your area. Always get the best deal.', icon: '💰' },
  { step: '03', title: 'Book a Pickup',             desc: 'Choose your time slot. The right vehicle (cycle to truck) is auto-allocated based on your scrap weight and type.', icon: '📅' },
  { step: '04', title: 'Collector Arrives & Pays',  desc: 'Collector arrives at your doorstep, weighs the scrap, and pays you on the spot. Zero hassle.', icon: '💵' },
]

const MATERIALS = [
  { name: 'Newspaper',   price: '12–15', unit: '/kg', icon: '📰', color: '#dbeafe' },
  { name: 'Iron',        price: '30–34', unit: '/kg', icon: '🔩', color: '#fce7f3' },
  { name: 'Aluminium',   price: '80–88', unit: '/kg', icon: '🥤', color: '#e0e7ff' },
  { name: 'Copper',      price: '450+',  unit: '/kg', icon: '🪙', color: '#fef3c7' },
  { name: 'E-Waste',     price: '60–70', unit: '/kg', icon: '💻', color: '#d1fae5' },
  { name: 'Plastic',     price: '8–17',  unit: '/kg', icon: '🧴', color: '#fce7f3' },
]

function CounterStat({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      const num = parseFloat(target.replace(/[^0-9.]/g, ''))
      const dur = 1800, steps = 60
      let i = 0
      const timer = setInterval(() => {
        i++
        setCount(Math.min(Math.round((i / steps) * num * 10) / 10, num))
        if (i >= steps) clearInterval(timer)
      }, dur / steps)
      observer.disconnect()
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])
  return <span ref={ref}>{count}{suffix}</span>
}

export default function LandingPage() {
  return (
    <div className="landing">
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-blob blob-1" />
          <div className="hero-blob blob-2" />
          <div className="hero-dots" />
        </div>
        <div className="container hero-inner">
          <div className="hero-text">
            <div className="hero-pill fade-up">
              <span className="pill-dot pulse-green" />
              India's #1 Smart Scrap Platform
            </div>
            <h1 className="hero-heading fade-up fade-up-1">
              Turn Your <span className="heading-highlight">Scrap</span> Into
              <br/>Cash & <span className="heading-green">Plant Trees</span>
            </h1>
            <p className="hero-desc fade-up fade-up-2">
              AI-powered scrap pickup platform. Upload a photo, get instant material detection,
              compare collector prices, and book doorstep pickup — all in minutes.
            </p>
            <div className="hero-actions fade-up fade-up-3">
              <Link to="/register" className="btn btn-accent btn-xl">
                🚀 Start Selling Scrap
              </Link>
              <Link to="/prices" className="btn btn-outline btn-xl">
                💰 View Today's Prices
              </Link>
            </div>
            <div className="hero-trust fade-up fade-up-4">
              <div className="trust-item">✅ No Hidden Charges</div>
              <div className="trust-item">🌱 Eco-Certified Collectors</div>
              <div className="trust-item">🔒 Secure Payments</div>
            </div>
          </div>

          <div className="hero-card-wrap fade-up fade-up-2">
            <div className="hero-phone-card">
              <div className="phone-header">
                <span className="phone-logo">♻️ WasteKart</span>
                <span className="phone-badge">AI Active</span>
              </div>
              <div className="phone-upload">
                <div className="upload-icon">📸</div>
                <p>AI Material Detection</p>
                <div className="ai-result">
                  <div className="ai-chip">🔩 Iron Scrap</div>
                  <div className="ai-chip lime">94% confidence</div>
                </div>
              </div>
              <div className="phone-price-row">
                <div className="price-item">
                  <span className="pi-label">Best Price</span>
                  <span className="pi-value">₹34<small>/kg</small></span>
                </div>
                <div className="price-item">
                  <span className="pi-label">Collectors</span>
                  <span className="pi-value">5 nearby</span>
                </div>
                <div className="price-item">
                  <span className="pi-label">Pickup</span>
                  <span className="pi-value">Today</span>
                </div>
              </div>
              <div className="phone-book-btn">📦 Book Pickup Now</div>
              <div className="phone-eco">
                🌳 This pickup will plant <strong>1 tree</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────── */}
      <section className="stats-bar">
        <div className="container stats-inner">
          {STATS.map(s => (
            <div key={s.label} className="stat-item">
              <span className="stat-icon">{s.icon}</span>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section className="how-section page-section">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Simple Process</div>
            <h2 className="section-title">How WasteKart Works</h2>
            <p className="section-subtitle">From scrap to cash in 4 easy steps. Our AI makes the whole process seamless.</p>
          </div>

          <div className="how-grid">
            {HOW_IT_WORKS.map((h, i) => (
              <div key={h.step} className={`how-card fade-up fade-up-${i + 1}`}>
                <div className="how-step-num">{h.step}</div>
                <div className="how-icon">{h.icon}</div>
                <h3>{h.title}</h3>
                <p>{h.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && <div className="how-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Features ───────────────────────────────────── */}
      <section className="ai-section page-section">
        <div className="container">
          <div className="ai-grid">
            <div className="ai-text">
              <div className="section-tag">Powered by AI</div>
              <h2 className="section-title">Smart Scrap Detection <br/>& Allocation</h2>
              <p className="section-subtitle">Our dual-AI engine uses TensorFlow.js for material classification and OpenCV.js for image preprocessing — right in your browser, no server upload needed.</p>

              <div className="ai-features">
                <div className="ai-feature">
                  <span className="af-icon">🧠</span>
                  <div>
                    <strong>Material Recognition</strong>
                    <p>Identifies paper, metals, plastics, e-waste, glass with &gt;90% accuracy</p>
                  </div>
                </div>
                <div className="ai-feature">
                  <span className="af-icon">🚚</span>
                  <div>
                    <strong>Smart Vehicle Allocation</strong>
                    <p>Auto-assigns cycle/bike/auto/truck based on scrap weight & type</p>
                  </div>
                </div>
                <div className="ai-feature">
                  <span className="af-icon">💬</span>
                  <div>
                    <strong>Gemini AI Chatbot</strong>
                    <p>24/7 assistant for scrap queries, pricing guidance & eco tips</p>
                  </div>
                </div>
              </div>

              <Link to="/book" className="btn btn-primary btn-lg" style={{ marginTop: '8px' }}>
                Try AI Detection →
              </Link>
            </div>

            <div className="ai-demo-card">
              <div className="demo-title">🤖 AI Detection Demo</div>
              <div className="demo-image-area">
                <div className="demo-scan-lines" />
                <span style={{ fontSize: '64px', position: 'relative', zIndex: 1 }}>💻</span>
                <div className="demo-scanning">Analyzing...</div>
              </div>
              <div className="demo-results">
                <div className="dr-row">
                  <span>Material Type</span>
                  <span className="dr-val green">E-Waste</span>
                </div>
                <div className="dr-row">
                  <span>Confidence</span>
                  <div className="confidence-bar">
                    <div className="confidence-fill" style={{ width: '92%' }} />
                    <span>92%</span>
                  </div>
                </div>
                <div className="dr-row">
                  <span>Market Price</span>
                  <span className="dr-val">₹62–70 /kg</span>
                </div>
                <div className="dr-row">
                  <span>Vehicle Needed</span>
                  <span className="dr-val">🛺 Auto</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Material prices preview ────────────────────────── */}
      <section className="prices-preview page-section" style={{ background: 'var(--surface-alt)' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Live Prices</div>
            <h2 className="section-title">Today's Scrap Prices</h2>
            <p className="section-subtitle">Rates updated daily from our collector network across Lucknow.</p>
          </div>

          <div className="material-grid">
            {MATERIALS.map(m => (
              <div key={m.name} className="material-card" style={{ '--mat-bg': m.color }}>
                <div className="mat-icon">{m.icon}</div>
                <div className="mat-name">{m.name}</div>
                <div className="mat-price">₹{m.price}<span>{m.unit}</span></div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link to="/prices" className="btn btn-primary btn-lg">
              View All Prices & Compare →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Eco impact ────────────────────────────────────── */}
      <section className="eco-section page-section">
        <div className="container">
          <div className="eco-inner">
            <div className="eco-text">
              <div className="section-tag eco">🌍 Environmental Impact</div>
              <h2 className="section-title">Every Kilo Counts</h2>
              <p>When you recycle through WasteKart, we calculate your exact environmental contribution. For every 50 kg of scrap recycled, we plant one real tree through our NGO partners.</p>
              <div className="eco-stats">
                <div className="eco-stat"><span>2.5 kg</span><p>CO₂ saved per kg recycled</p></div>
                <div className="eco-stat"><span>1 tree</span><p>planted per 50 kg scrap</p></div>
                <div className="eco-stat"><span>₹0</span><p>cost to you — we pay you!</p></div>
              </div>
              <Link to="/register" className="btn btn-accent btn-lg">
                🌱 Start Your Green Journey
              </Link>
            </div>
            <div className="eco-visual">
              <div className="tree-counter">
                <div className="tree-anim">🌳🌲🌳🌲🌳</div>
                <div className="tree-count">2,400+</div>
                <div className="tree-label">Trees Planted by WasteKart Community</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-bg-shape" />
            <h2>Ready to Clear Your Scrap?</h2>
            <p>Join 8,000+ households already earning from their waste. Schedule your first pickup in under 2 minutes.</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-accent btn-xl">🚀 Sign Up Free</Link>
              <Link to="/book"     className="btn btn-outline btn-xl" style={{ borderColor: 'rgba(255,255,255,.4)', color: 'white' }}>
                📦 Book Pickup
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
