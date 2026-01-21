import { Link } from 'react-router-dom'
import Button from './Button'

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-content">
        <Link to="/" className="brand">
          <span className="brand-icon" aria-hidden="true">
            +
          </span>
          <span className="brand-text">
            <span className="brand-mark">CareCova</span>
            <span className="brand-tagline">CareNow, Pay Later</span>
          </span>
        </Link>
        <nav className="nav">
          <Link to="/how-it-works">How It Works</Link>
          <Link to="/partners">Partners</Link>
          <Link to="/apply">Apply</Link>
          <Link to="/track">Track</Link>
        </nav>
        <Link to="/apply">
          <Button variant="primary">Apply Now</Button>
        </Link>
      </div>
    </header>
  )
}
