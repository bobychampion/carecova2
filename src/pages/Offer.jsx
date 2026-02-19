import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Button from '../components/Button'
import Input from '../components/Input'
import RepaymentSchedule from '../components/RepaymentSchedule'
import { loanService } from '../services/loanService'

const DEMO_OTP = '123456'

export default function Offer() {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const [loan, setLoan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!applicationId) {
        setError('Application ID is required')
        setLoading(false)
        return
      }
      try {
        const data = await loanService.getApplication(applicationId.trim())
        if (data.status !== 'approved') {
          setError('No offer available for this application.')
          setLoan(null)
        } else {
          setLoan(data)
          setError('')
        }
      } catch (err) {
        setError('Application not found.')
        setLoan(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [applicationId])

  const handleAcceptOffer = () => {
    setShowOtp(true)
    setOtpError('')
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a 6-digit OTP')
      return
    }
    setAccepting(true)
    setOtpError('')
    try {
      await loanService.acceptOffer(loan.id, otp)
      navigate(`/track?loanId=${loan.id}`)
    } catch (err) {
      setOtpError(err.message || 'Invalid OTP. For demo use 123456.')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main>
          <section className="section">
            <div className="container">
              <div className="loading">Loading offer...</div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !loan) {
    return (
      <>
        <Header />
        <main>
          <section className="section">
            <div className="container">
              <div className="offer-error">
                <h2>Unable to load offer</h2>
                <p>{error}</p>
                <Button variant="primary" onClick={() => navigate('/track')}>
                  Back to Track
                </Button>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    )
  }

  const alreadyAccepted = !!loan.offerAcceptedAt

  return (
    <>
      <Header />
      <main>
        <section className="page-hero">
          <div className="container">
            <h1>Your loan offer</h1>
            <p>Application {loan.id} – Review and accept your offer.</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="offer-card">
              <h2>Offer summary</h2>
              <div className="offer-summary">
                <div className="offer-row">
                  <strong>Approved amount</strong>
                  <span>₦{loan.approvedAmount?.toLocaleString() ?? loan.estimatedCost?.toLocaleString()}</span>
                </div>
                <div className="offer-row">
                  <strong>Repayment duration</strong>
                  <span>{loan.approvedDuration ?? loan.preferredDuration} months</span>
                </div>
                <div className="offer-row">
                  <strong>Monthly installment</strong>
                  <span>₦{loan.monthlyInstallment?.toLocaleString() ?? '—'}</span>
                </div>
              </div>

              {loan.repaymentSchedule && loan.repaymentSchedule.length > 0 && (
                <div className="offer-schedule">
                  <h3>Repayment schedule</h3>
                  <RepaymentSchedule schedule={loan.repaymentSchedule} />
                </div>
              )}

              {alreadyAccepted ? (
                <div className="offer-accepted">
                  <p>You have already accepted this offer.</p>
                  <Button variant="primary" onClick={() => navigate(`/track?loanId=${loan.id}`)}>
                    View repayment
                  </Button>
                </div>
              ) : !showOtp ? (
                <div className="offer-actions">
                  <Button variant="primary" onClick={handleAcceptOffer}>
                    Accept offer
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/track')}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleOtpSubmit} className="offer-otp-form">
                  <p className="offer-otp-hint">Enter the 6-digit OTP sent to your phone or email to confirm acceptance.</p>
                  <p className="offer-demo-hint">For demo, use OTP: {DEMO_OTP}</p>
                  <Input
                    label="OTP"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '')
                      setOtp(v)
                      setOtpError('')
                    }}
                    error={otpError}
                  />
                  <div className="form-actions">
                    <Button type="submit" variant="primary" disabled={accepting || otp.length !== 6}>
                      {accepting ? 'Confirming...' : 'Confirm acceptance'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => { setShowOtp(false); setOtp(''); setOtpError('') }}>
                      Back
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
