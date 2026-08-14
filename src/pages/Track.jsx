import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

export default function Track() {
  const navigate = useNavigate()

  useEffect(() => {
    // Check if already logged in — redirect straight to portal
    try {
      const session = JSON.parse(localStorage.getItem('carecova_customer_session') || 'null')
      if (session?.loggedInAt) navigate('/portal', { replace: true })
    } catch {}
  }, [navigate])

  return (
    <>
      <Header />
      <main>
        <section className="page-hero">
          <div className="container">
            <h1>Track Your Application</h1>
            <p>Sign in to your account to view your application status and details.</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="track-card" style={{ textAlign: 'center', padding: '40px 32px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📋</div>
              <h2 style={{ marginBottom: '8px', color: '#1e3a5f' }}>View your application</h2>
              <p style={{ color: '#6b7280', marginBottom: '28px', maxWidth: '420px', margin: '0 auto 28px' }}>
                Sign in with the phone number you used when applying. You can see your application status, documents requested, and any decisions.
              </p>
              <Link to="/login" className="button button--primary" style={{ display: 'inline-block' }}>
                Sign in to my account
              </Link>
              <p style={{ marginTop: '16px', fontSize: '0.875rem', color: '#9ca3af' }}>
                Applied recently? Use the phone number from your application form.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
