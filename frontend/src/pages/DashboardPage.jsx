import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts'
import { useAuth } from '../context/AuthContext'
import './DashboardPage.css'

const PIE_COLORS = ['#2d7a3c','#5bc970','#b5f03e','#f59e0b','#3b82f6','#ef4444','#8b5cf6']

function StatCard({ icon, label, value, sub, color = 'green' }) {
  return (
    <div className={`stat-card stat-card-${color} fade-up`}>
      <div className="sc-icon">{icon}</div>
      <div className="sc-body">
        <div className="sc-value">{value}</div>
        <div className="sc-label">{label}</div>
        {sub && <div className="sc-sub">{sub}</div>}
      </div>
    </div>
  )
}

const STATUS_MAP = {
  pending:     { label: 'Pending',     color: 'amber',  icon: '⏳' },
  confirmed:   { label: 'Confirmed',   color: 'blue',   icon: '✅' },
  in_progress: { label: 'In Progress', color: 'purple', icon: '🚚' },
  completed:   { label: 'Completed',   color: 'green',  icon: '🎉' },
  cancelled:   { label: 'Cancelled',   color: 'red',    icon: '❌' },
}

export default function DashboardPage() {
  const { user, API } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/dashboard/stats').then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}>
      <div className="spinner" />
    </div>
  )

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* ── Welcome header ───── */}
        <div className="dash-header fade-up">
          <div>
            <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
            <p>Here's your recycling impact and activity overview.</p>
          </div>
          <Link to="/book" className="btn btn-accent btn-lg">
            📦 Book New Pickup
          </Link>
        </div>

        {/* ── Impact stats ────── */}
        <div className="stat-grid">
          <StatCard icon="♻️" label="Total Scrap Recycled" value={`${stats?.totalScrapKg || 0} kg`} sub="Lifetime total" color="green" />
          <StatCard icon="🌳" label="Trees Planted" value={stats?.treesPlanted || 0} sub="Through your recycling" color="lime" />
          <StatCard icon="💰" label="Total Earnings" value={`₹${(stats?.totalEarnings || 0).toFixed(0)}`} sub="From scrap sold" color="amber" />
          <StatCard icon="🌍" label="CO₂ Saved" value={`${stats?.co2Saved || 0} kg`} sub="Carbon offset" color="blue" />
        </div>

        {/* ── Pickup status summary ─ */}
        <div className="status-row fade-up">
          {[
            { label: 'Total Bookings',  val: stats?.totalBookings      || 0, icon: '📦' },
            { label: 'Completed',       val: stats?.completedPickups   || 0, icon: '✅' },
            { label: 'Pending',         val: stats?.pendingPickups     || 0, icon: '⏳' },
            { label: 'In Progress',     val: stats?.inProgressPickups  || 0, icon: '🚚' },
          ].map(s => (
            <div key={s.label} className="status-card">
              <span className="status-card-icon">{s.icon}</span>
              <span className="status-card-val">{s.val}</span>
              <span className="status-card-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Charts ──────────────── */}
        <div className="charts-grid">
          {/* Monthly bar chart */}
          <div className="card card-padded fade-up fade-up-2">
            <div className="chart-header">
              <h3>Monthly Scrap (kg)</h3>
              <span className="badge badge-green">Last 6 months</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats?.monthlyData || []} barSize={26}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v) => [`${v} kg`, 'Scrap']}
                  contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12 }}
                />
                <Bar dataKey="scrapKg" fill="var(--green-400)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly earnings line chart */}
          <div className="card card-padded fade-up fade-up-3">
            <div className="chart-header">
              <h3>Monthly Earnings (₹)</h3>
              <span className="badge badge-lime">Last 6 months</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats?.monthlyData || []}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v) => [`₹${v}`, 'Earnings']}
                  contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12 }}
                />
                <Line
                  type="monotone" dataKey="earnings"
                  stroke="var(--lime-600)" strokeWidth={2.5}
                  dot={{ r: 4, fill: 'var(--lime-500)' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category pie chart */}
          {stats?.categoryChartData?.length > 0 && (
            <div className="card card-padded fade-up fade-up-4">
              <div className="chart-header">
                <h3>Scrap by Category</h3>
                <span className="badge badge-gray">All time</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={stats.categoryChartData} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {stats.categoryChartData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} kg`, '']} contentStyle={{ borderRadius:10, fontSize:12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top collectors */}
          {stats?.topCollectors?.length > 0 && (
            <div className="card card-padded fade-up fade-up-5">
              <div className="chart-header">
                <h3>Top Collectors</h3>
                <span className="badge badge-green">By earnings</span>
              </div>
              <div className="collector-list">
                {stats.topCollectors.map((c, i) => (
                  <div key={i} className="collector-row">
                    <div className="cr-rank">{['🥇','🥈','🥉'][i]}</div>
                    <div className="cr-info">
                      <span className="cr-name">{c.name}</span>
                      <span className="cr-sub">{c.pickups} pickups</span>
                    </div>
                    <div className="cr-amount">₹{c.amount.toFixed(0)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Recent Bookings ──────── */}
        <div className="card card-padded recent-section fade-up">
          <div className="chart-header">
            <h3>Recent Pickups</h3>
            <Link to="/bookings" className="btn btn-ghost btn-sm">View All →</Link>
          </div>
          {stats?.recentBookings?.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📦</div>
              <p>No pickups yet. <Link to="/book" style={{ color: 'var(--primary)' }}>Book your first one!</Link></p>
            </div>
          ) : (
            <div className="bookings-table">
              <div className="bt-head">
                <span>Booking ID</span>
                <span>Items</span>
                <span>Weight</span>
                <span>Amount</span>
                <span>Pickup Date</span>
                <span>Status</span>
              </div>
              {stats?.recentBookings?.map(b => {
                const st = STATUS_MAP[b.status] || STATUS_MAP.pending
                return (
                  <div key={b._id} className="bt-row">
                    <span className="bt-id">#{b.bookingId}</span>
                    <span>{b.items?.length || 0} item{b.items?.length !== 1 ? 's' : ''}</span>
                    <span>{b.totalWeight} kg</span>
                    <span className="bt-amount">₹{b.totalAmount}</span>
                    <span>{new Date(b.scheduledDate).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</span>
                    <span>
                      <span className={`badge status-${b.status}`}>
                        {st.icon} {st.label}
                      </span>
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Eco milestone ────────── */}
        <div className="eco-milestone card fade-up">
          <div className="em-icon">🌳</div>
          <div className="em-body">
            <h3>Your Green Impact</h3>
            <p>You've recycled <strong>{stats?.totalScrapKg || 0} kg</strong> of scrap, saving <strong>{stats?.co2Saved || 0} kg</strong> of CO₂ — equivalent to planting <strong>{stats?.treesPlanted || 0} trees!</strong></p>
          </div>
          <div className="em-tree-count">
            🌱 {stats?.treesPlanted || 0} trees
          </div>
        </div>
      </div>
    </div>
  )
}
