import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-column">
          <h3>CareCova</h3>
          <p>
            Empowering Nigerian families to access elective medical procedures
            with dignity and flexible financing. Get care today, pay at your own
            pace.
          </p>
        </div>
        <div className="footer-column">
          <h4>Platform</h4>
          <Link to="/">Home</Link>
          <Link to="/partners">Partner Hospitals</Link>
          <Link to="/how-it-works">How it Works</Link>
          <Link to="/track">Track Loan</Link>
        </div>
        <div className="footer-column">
          <h4>Contact</h4>
          <p>support@sosocare.com</p>
          <p>(+234) 816 347 1359</p>
          <p>15 Rumuola Road, Port Harcourt, Nigeria</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2024 Sosocare. All rights reserved.</span>
        <div className="footer-links">
          <Link to="/">Privacy Policy</Link>
          <Link to="/">Terms of Service</Link>
        </div>
      </div>
    </footer>
  )
}
