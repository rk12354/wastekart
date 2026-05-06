import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import './PricesPage.css'

const API_URL = import.meta.env.VITE_BACKEND_URL || '/api'
const CATEGORIES = ['all','paper','metal','plastic','glass','ewaste','rubber']

export default function PricesPage() {
  const [prices, setPrices]   = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [pincode, setPincode]   = useState('')
  const [search, setSearch]     = useState('')

  const fetchPrices = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (pincode) params.set('pincode', pincode)
      if (category !== 'all') params.set('category', category)
      const { data } = await axios.get(`${API_URL}/materials/prices?${params}`)
      setPrices(data)
    } catch {
      // Fallback static data
      setPrices([
        { id:'newspaper',  name:'Newspaper',        category:'paper',   icon:'📰', bestPrice:14,  minPrice:12, maxPrice:15, collectorPrices:[], basePrice:12 },
        { id:'cardboard',  name:'Cardboard',         category:'paper',   icon:'📦', bestPrice:9,   minPrice:8,  maxPrice:10, collectorPrices:[], basePrice:8  },
        { id:'books',      name:'Books/Magazines',   category:'paper',   icon:'📚', bestPrice:11,  minPrice:10, maxPrice:12, collectorPrices:[], basePrice:10 },
        { id:'iron',       name:'Iron',              category:'metal',   icon:'🔩', bestPrice:33,  minPrice:30, maxPrice:34, collectorPrices:[], basePrice:30 },
        { id:'steel',      name:'Stainless Steel',   category:'metal',   icon:'🔧', bestPrice:44,  minPrice:40, maxPrice:44, collectorPrices:[], basePrice:40 },
        { id:'aluminium',  name:'Aluminium',         category:'metal',   icon:'🥤', bestPrice:88,  minPrice:80, maxPrice:88, collectorPrices:[], basePrice:80 },
        { id:'copper',     name:'Copper',            category:'metal',   icon:'🪙', bestPrice:465, minPrice:450,maxPrice:465,collectorPrices:[], basePrice:450},
        { id:'brass',      name:'Brass',             category:'metal',   icon:'⚙️', bestPrice:260, minPrice:250,maxPrice:260,collectorPrices:[], basePrice:250},
        { id:'plastic_hard',name:'Hard Plastic',     category:'plastic', icon:'🪣', bestPrice:17,  minPrice:15, maxPrice:17, collectorPrices:[], basePrice:15 },
        { id:'plastic_soft',name:'Soft Plastic/PET', category:'plastic', icon:'🧴', bestPrice:10,  minPrice:8,  maxPrice:10, collectorPrices:[], basePrice:8  },
        { id:'glass',      name:'Glass',             category:'glass',   icon:'🫙', bestPrice:7,   minPrice:5,  maxPrice:7,  collectorPrices:[], basePrice:5  },
        { id:'ewaste',     name:'E-Waste',           category:'ewaste',  icon:'💻', bestPrice:70,  minPrice:60, maxPrice:70, collectorPrices:[], basePrice:60 },
        { id:'battery',    name:'Batteries',         category:'ewaste',  icon:'🔋', bestPrice:135, minPrice:120,maxPrice:135,collectorPrices:[], basePrice:120},
        { id:'rubber',     name:'Rubber/Tyres',      category:'rubber',  icon:'⭕', bestPrice:12,  minPrice:10, maxPrice:12, collectorPrices:[], basePrice:10 },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPrices() }, [category, pincode])

  const filtered = prices.filter(p =>
    (category === 'all' || p.category === category) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="prices-page">
      <div className="container">
        <div className="prices-hero">
          <div>
            <h1>💰 Today's Scrap Prices</h1>
            <p>Live rates from our verified collector network in Lucknow. Updated daily.</p>
          </div>
          <Link to="/book" className="btn btn-accent btn-lg">📦 Book Pickup Now</Link>
        </div>

        <div className="price-filters fade-up">
          <div className="search-wrap">
            <span>🔍</span>
            <input className="form-input search-input" placeholder="Search material…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <input className="form-input pincode-input" placeholder="📍 Enter pincode"
            value={pincode} maxLength={6}
            onChange={e => setPincode(e.target.value.replace(/\D/,''))} />
          <div className="cat-tabs">
            {CATEGORIES.map(c => (
              <button key={c} className={`cat-tab ${category === c ? 'active' : ''}`}
                onClick={() => setCategory(c)}>
                {c === 'all' ? '🗂 All' : c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}>
            <div className="spinner" />
          </div>
        ) : (
          <div className="prices-grid fade-up">
            {filtered.map(p => (
              <div key={p.id} className="price-card">
                <div className="pc-header">
                  <span className="pc-icon">{p.icon}</span>
                  <div>
                    <div className="pc-name">{p.name}</div>
                    <div className="pc-cat badge badge-green">{p.category}</div>
                  </div>
                </div>

                <div className="pc-best-price">
                  <span>Best Price</span>
                  <strong>₹{p.bestPrice}<small>/kg</small></strong>
                </div>

                <div className="pc-range">
                  <div className="price-range-bar">
                    <div className="prb-fill"
                      style={{ width: `${Math.min(100, ((p.bestPrice - p.minPrice) / Math.max(p.maxPrice - p.minPrice, 1)) * 100)}%` }}
                    />
                  </div>
                  <div className="pr-labels">
                    <span>₹{p.minPrice}</span>
                    <span>₹{p.maxPrice}</span>
                  </div>
                </div>

                {p.collectorPrices?.length > 0 && (
                  <div className="pc-collectors">
                    <span className="pc-col-label">Top Collectors</span>
                    {p.collectorPrices.slice(0, 2).map((c, i) => (
                      <div key={i} className="pc-col-row">
                        <span>⭐ {c.rating}</span>
                        <span>{c.collectorName}</span>
                        <span className="pc-col-price">₹{c.price}/kg</span>
                      </div>
                    ))}
                  </div>
                )}

                <Link to="/book" className="btn btn-outline btn-full btn-sm" style={{ marginTop: 10 }}>
                  Sell This →
                </Link>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <div className="icon">🔍</div>
            <p>No materials found for this search</p>
          </div>
        )}

        <div className="price-note fade-up">
          <span>ℹ️</span>
          <p>Prices shown are market averages. Actual prices may vary slightly based on quality and collector. All prices are per kilogram.</p>
        </div>
      </div>
    </div>
  )
}
