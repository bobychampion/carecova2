import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Button from './Button'
import NotificationBell from './NotificationBell'
import logo from '../assets/logo.png'

export default function Header() {
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    // Get user ID from localStorage if available
    const storedUserId = localStorage.getItem('carecova_user_id')
    if (storedUserId) {
      setUserId(storedUserId)
    } else if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const urlUserId = params.get('userId')
      if (urlUserId) {
        setUserId(urlUserId)
      }
    }
  }, [])

  return (
    <header className="site-header">
      <div className="container header-content">
        <Link to="/" className="brand">
          <img src={logo} alt="CareCova" className="brand-logo" />
          <span className="brand-text">
            <span className="brand-mark">CareCova</span>
            <span className="brand-tagline">CareNow, Pay Later</span>
          </span>
        </Link>
        <nav className="nav">
          <Link to="/how-it-works">How It Works</Link>
          <Link to="/calculator">Calculator</Link>
          <Link to="/apply">Apply</Link>
          <Link to="/track">Track</Link>
          <Link to="/faq">FAQ</Link>
        </nav>
        <div className="header-actions">
          {userId && <NotificationBell userId={userId} />}
          <Link to="/profile">
            <Button variant="ghost">Profile</Button>
          </Link>
          <Link to="/apply">
            <Button variant="primary">Apply Now</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
