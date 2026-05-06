import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span>♻️</span>
              <span>Waste<strong>Kart</strong></span>
            </Link>
            <p>India's smartest scrap collection platform. Schedule pickups, get fair prices, and contribute to a greener planet — one kilo at a time.</p>
            <div className="eco-badge">
              <span>🌱</span>
              <span>We've helped plant <strong>2,400+</strong> trees</span>
            </div>
          </div>

          <div className="footer-col">
            <h4>Platform</h4>
            <Link to="/prices">Scrap Prices</Link>
            <Link to="/collectors">Collectors</Link>
            <Link to="/book">Book Pickup</Link>
            <Link to="/register">Sign Up Free</Link>
          </div>

          <div className="footer-col">
            <h4>Materials</h4>
            <span>📰 Paper & Cardboard</span>
            <span>🔩 Metals</span>
            <span>🧴 Plastics</span>
            <span>💻 E-Waste</span>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">How it Works</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} WasteKart. All rights reserved. Made with 💚 in India.</p>
          <p className="footer-tagline">♻️ Recycle Today. Breathe Tomorrow.</p>
        </div>
      </div>
    </footer>
  )
}
