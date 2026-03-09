import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Button from '../components/Button'

/**
 * Welcome page for customers who have just applied.
 * Use ?loanId=XXX to show their application ID. Good for sharing or email links.
 */
export default function Welcome() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const loanId = searchParams.get('loanId') || ''

  return (
    <>
      <Header />
      <main>
        <section className="section section-welcome">
          <div className="container">
            <div className="customer-welcome-card">
              <div className="customer-welcome-icon" aria-hidden="true">✓</div>
              <h1 className="customer-welcome-title">Welcome to Carecova</h1>
              <p className="customer-welcome-lead">
                Your healthcare financing application is in. We’re here to support you through the process.
              </p>
              {loanId ? (
                <div className="customer-welcome-id-box">
                  <span className="customer-welcome-id-label">Your application ID</span>
                  <strong className="customer-welcome-id-value">{loanId}</strong>
                  <p className="customer-welcome-id-hint">Use this ID to track your application anytime.</p>
                </div>
              ) : (
                <p className="customer-welcome-id-hint">Check your email or SMS for your application ID.</p>
              )}
              <div className="customer-welcome-next">
                <h3>What happens next?</h3>
                <ul>
                  <li><strong>Review</strong> – We’ll review your application (usually within 24–48 hours).</li>
                  <li><strong>Contact</strong> – We may get in touch if we need any documents or details.</li>
                  <li><strong>Decision</strong> – You’ll receive an update and, if approved, your loan offer.</li>
                  <li><strong>Disbursement</strong> – Once you accept, funds go to your healthcare provider.</li>
                </ul>
              </div>
              <div className="success-actions customer-welcome-actions">
                {loanId ? (
                  <Button variant="primary" onClick={() => navigate(`/track?loanId=${loanId}`)}>
                    Track your application
                  </Button>
                ) : (
                  <Button variant="primary" onClick={() => navigate('/track')}>
                    Track your application
                  </Button>
                )}
                <Button variant="ghost" onClick={() => navigate('/')}>Return home</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
