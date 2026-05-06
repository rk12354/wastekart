import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)

  const isCollector = user?.role === 'collector'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout(); setDropOpen(false); navigate('/')
  }

  // Role-based nav links
  const navLinks = !user
    ? [
        { to: '/prices',     label: 'Scrap Prices', icon: '💰' },
        { to: '/collectors', label: 'Collectors',   icon: '♻️' },
      ]
    : isCollector
    ? [
        { to: '/collector/dashboard', label: 'Dashboard',     icon: '📊' },
        { to: '/collector/dashboard', label: 'My Pickups',    icon: '📦' },
      ]
    : [
        { to: '/dashboard',    label: 'Dashboard',    icon: '📊' },
        { to: '/prices',       label: 'Prices',       icon: '💰' },
        { to: '/book',         label: 'Book Pickup',  icon: '📦' },
        { to: '/bookings',     label: 'My Pickups',   icon: '🚚' },
        { to: '/transactions', label: 'Transactions', icon: '💳' },
      ]

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">♻️</span>
          <span className="logo-text">Waste<span className="logo-accent">Kart</span></span>
          {isCollector && <span className="collector-badge">Collector</span>}
        </Link>

        <nav className="navbar-links hide-mobile">
          {navLinks.map(l => (
            <NavLink key={l.to + l.label}
              to={l.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-actions">
          {user ? (
            <div className="user-dropdown">
              <button className="user-btn" onClick={() => setDropOpen(p => !p)}>
                <div className={`user-avatar ${isCollector ? 'collector-avatar' : ''}`}>
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="user-name hide-mobile">{user.name?.split(' ')[0]}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>

              {dropOpen && (
                <div className="dropdown-menu" onClick={() => setDropOpen(false)}>
                  <div className="dropdown-header">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                    <span style={{ fontSize:11, background: isCollector ? '#dbeafe' : 'var(--green-100)', color: isCollector ? '#1e40af' : 'var(--green-700)', padding:'2px 8px', borderRadius:20, width:'fit-content', marginTop:2 }}>
                      {isCollector ? '🚚 Collector' : '👤 User'}
                    </span>
                  </div>
                  <div className="dropdown-divider" />
                  {isCollector ? <>
                    <Link to="/collector/dashboard" className="dropdown-item">📊 Dashboard</Link>
                    <Link to="/profile"             className="dropdown-item">👤 My Profile</Link>
                  </> : <>
                    <Link to="/dashboard"    className="dropdown-item">📊 Dashboard</Link>
                    <Link to="/profile"      className="dropdown-item">👤 My Profile</Link>
                    <Link to="/bookings"     className="dropdown-item">🚚 My Pickups</Link>
                    <Link to="/transactions" className="dropdown-item">💳 Transactions</Link>
                  </>}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={handleLogout}>🚪 Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-actions">
              <Link to="/login"    className="btn btn-ghost btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up Free</Link>
            </div>
          )}

          <button className="hamburger hide-desktop" onClick={() => setMenuOpen(p => !p)}>
            <span className={menuOpen ? 'bar bar-1 open' : 'bar bar-1'} />
            <span className={menuOpen ? 'bar bar-2 open' : 'bar bar-2'} />
            <span className={menuOpen ? 'bar bar-3 open' : 'bar bar-3'} />
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {navLinks.map(l => (
          <NavLink key={l.to + l.label} to={l.to} className="mobile-nav-link"
            onClick={() => setMenuOpen(false)}>
            <span>{l.icon}</span> {l.label}
          </NavLink>
        ))}
        {!user && (
          <div className="mobile-auth">
            <Link to="/login"    className="btn btn-outline btn-full" onClick={() => setMenuOpen(false)}>Log In</Link>
            <Link to="/register" className="btn btn-primary btn-full" onClick={() => setMenuOpen(false)}>Sign Up</Link>
          </div>
        )}
        {user && <button className="mobile-nav-link danger" onClick={handleLogout}>🚪 Sign Out</button>}
      </div>

      {(menuOpen || dropOpen) && (
        <div className="navbar-backdrop" onClick={() => { setMenuOpen(false); setDropOpen(false) }} />
      )}
    </header>
  )
}
