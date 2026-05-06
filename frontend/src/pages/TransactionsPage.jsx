import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './TransactionsPage.css'

export default function TransactionsPage() {
  const { API } = useAuth()
  const toast   = useToast()

  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)
  const [total, setTotal]     = useState(0)

  useEffect(() => {
    API.get(`/transactions?page=${page}&limit=15`)
      .then(r => { setTransactions(r.data.transactions); setTotal(r.data.total) })
      .catch(() => toast.error('Failed to load transactions'))
      .finally(() => setLoading(false))
  }, [page])

  const totalEarned = transactions.reduce((s, t) => s + t.amount, 0)

  return (
    <div className="txn-page">
      <div className="container">
        <div className="txn-header">
          <div>
            <h1>💳 Transaction History</h1>
            <p>Complete record of all your scrap sale transactions</p>
          </div>
          <div className="txn-total-badge">
            <span>Total Earned</span>
            <strong>₹{totalEarned.toFixed(0)}</strong>
          </div>
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}>
            <div className="spinner" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <div className="icon">💳</div>
            <h3>No transactions yet</h3>
            <p>Complete a scrap pickup to see your earnings here</p>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="txn-summary-row fade-up">
              <div className="txn-sum-card">
                <span>💰</span>
                <div>
                  <strong>{transactions.length}</strong>
                  <p>Total Transactions</p>
                </div>
              </div>
              <div className="txn-sum-card">
                <span>📈</span>
                <div>
                  <strong>₹{transactions.length > 0 ? (totalEarned / transactions.length).toFixed(0) : 0}</strong>
                  <p>Avg per Transaction</p>
                </div>
              </div>
              <div className="txn-sum-card">
                <span>🌳</span>
                <div>
                  <strong>{transactions.reduce((s, t) => s + (t.treesPlanted || 0), 0)}</strong>
                  <p>Trees Planted</p>
                </div>
              </div>
              <div className="txn-sum-card">
                <span>🌍</span>
                <div>
                  <strong>{transactions.reduce((s, t) => s + (t.co2Saved || 0), 0).toFixed(1)} kg</strong>
                  <p>CO₂ Saved</p>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="card fade-up" style={{ overflow: 'hidden' }}>
              <div className="txn-table-wrap">
                <table className="txn-table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Booking</th>
                      <th>Collector</th>
                      <th>Date</th>
                      <th>Method</th>
                      <th>🌳 Trees</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(t => (
                      <tr key={t._id}>
                        <td className="txn-id">#{t.transactionId}</td>
                        <td className="txn-booking">
                          {t.booking
                            ? <span className="txn-link">#{t.booking.bookingId}</span>
                            : '—'}
                        </td>
                        <td>{t.collector?.name || 'Unassigned'}</td>
                        <td>{new Date(t.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</td>
                        <td>
                          <span className="badge badge-gray" style={{ textTransform:'capitalize' }}>
                            {t.paymentMethod || 'cash'}
                          </span>
                        </td>
                        <td style={{ textAlign:'center' }}>
                          {t.treesPlanted > 0
                            ? <span style={{ color:'var(--green-600)' }}>🌳 {t.treesPlanted}</span>
                            : <span style={{ color:'var(--text-muted)' }}>—</span>}
                        </td>
                        <td>
                          <span className="txn-amount">₹{t.amount.toFixed(0)}</span>
                        </td>
                        <td>
                          <span className={`badge ${t.status === 'completed' ? 'badge-green' : t.status === 'failed' ? 'badge-red' : 'badge-amber'}`}>
                            {t.status === 'completed' ? '✅' : t.status === 'failed' ? '❌' : '⏳'} {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {total > 15 && (
              <div className="pagination" style={{ marginTop: 20 }}>
                <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p-1)}>← Prev</button>
                <span style={{ fontSize:13, color:'var(--text-muted)' }}>Page {page} of {Math.ceil(total/15)}</span>
                <button className="btn btn-outline btn-sm" disabled={page >= Math.ceil(total/15)} onClick={() => setPage(p => p+1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
