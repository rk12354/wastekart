import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

import Navbar       from './components/Navbar'
import Footer       from './components/Footer'
import Chatbot      from './components/Chatbot'

import LandingPage       from './pages/LandingPage'
import LoginPage         from './pages/LoginPage'
import RegisterPage      from './pages/RegisterPage'
import DashboardPage     from './pages/DashboardPage'
import PricesPage        from './pages/PricesPage'
import BookingPage       from './pages/BookingPage'
import BookingsPage      from './pages/BookingsPage'
import TransactionsPage  from './pages/TransactionsPage'
import ProfilePage       from './pages/ProfilePage'
import CollectorsPage    from './pages/CollectorsPage'
import CollectorDashboard from './pages/CollectorDashboard'

// ── Spinner helper ─────────────────────────────────────────────
function Loader() {
  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}>
      <div className="spinner" />
    </div>
  )
}

// ── Route guards ───────────────────────────────────────────────
function PrivateRoute({ children, allowedRole }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace />
  // If role restriction given, enforce it
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'collector' ? '/collector/dashboard' : '/dashboard'} replace />
  }
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) {
    // Redirect to role-appropriate home
    return <Navigate to={user.role === 'collector' ? '/collector/dashboard' : '/dashboard'} replace />
  }
  return children
}

function AppLayout() {
  const { user } = useAuth()
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* ── Public ───────────────────────────────── */}
          <Route path="/"           element={<LandingPage />} />
          <Route path="/login"      element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register"   element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/prices"     element={<PricesPage />} />
          <Route path="/collectors" element={<CollectorsPage />} />

          {/* ── User-only routes ─────────────────────── */}
          <Route path="/dashboard"    element={<PrivateRoute allowedRole="user"><DashboardPage /></PrivateRoute>} />
          <Route path="/book"         element={<PrivateRoute allowedRole="user"><BookingPage /></PrivateRoute>} />
          <Route path="/bookings"     element={<PrivateRoute allowedRole="user"><BookingsPage /></PrivateRoute>} />
          <Route path="/transactions" element={<PrivateRoute allowedRole="user"><TransactionsPage /></PrivateRoute>} />
          <Route path="/profile"      element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

          {/* ── Collector-only routes ─────────────────── */}
          <Route path="/collector/dashboard" element={<PrivateRoute allowedRole="collector"><CollectorDashboard /></PrivateRoute>} />

          {/* ── Fallback ─────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      {/* Chatbot only for regular users */}
      {user && user.role !== 'collector' && <Chatbot />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppLayout />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
