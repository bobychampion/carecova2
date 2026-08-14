import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Button from '../components/Button'
import Input from '../components/Input'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

function isTrackingCode(value) {
  return /^[A-Z]{2}-\d{4}-[A-Z0-9]+$/i.test(value.trim())
}

export default function Track() {
  const navigate = useNavigate()
  const [step, setStep] = useState('code')
  const [lookup, setLookup] = useState('') // the raw value user entered (code or phone)
  const [inputValue, setInputValue] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLookup = async (e) => {
    e.preventDefault()
    const value = inputValue.trim().toUpperCase()
    if (!value) { setError('Please enter your tracking number or phone number'); return }

    setLoading(true)
    setError('')

    try {
      const body = isTrackingCode(value) ? { applicationCode: value } : { phone: value }

      const res = await fetch(`${API_BASE}/api/customers/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Could not send code')

      setLookup(value)
      setMaskedEmail(data.maskedEmail || '')
      setStep('otp')
    } catch (err) {
      setError(err.message || 'Could not find an application with that tracking number. Please check and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    if (otpCode.length < 6) { setError('Enter the 6-digit code'); return }

    setLoading(true)
    setError('')

    try {
      // Pass either applicationCode or phone depending on what was used for lookup
      const body = isTrackingCode(lookup)
        ? { applicationCode: lookup, code: otpCode }
        : { phone: lookup, code: otpCode }

      const res = await fetch(`${API_BASE}/api/customers/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Invalid or expired code')

      // Store session (same as customerAuthService.verifyOtp)
      const session = {
        token: data.token,
        phone: data.customer?.phone || '',
        email: data.customer?.email || '',
        fullName: data.customer?.name || '',
        applications: data.applications || [],
        loggedInAt: new Date().toISOString(),
      }
      try { localStorage.setItem('carecova_customer_session', JSON.stringify(session)) } catch {}

      navigate('/portal')
    } catch (err) {
      setError(err.message || 'Invalid or expired code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setLoading(true)
    try {
      const body = isTrackingCode(lookup) ? { applicationCode: lookup } : { phone: lookup }
      await fetch(`${API_BASE}/api/customers/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } catch {}
    setLoading(false)
  }

  return (
    <>
      <Header />
      <main>
        <section className="page-hero">
          <div className="container">
            <h1>Track Your Application</h1>
            <p>Enter your tracking number to view your application status and details.</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="track-card">
              {step === 'code' ? (
                <form onSubmit={handleLookup} className="track-form">
                  <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '0.9375rem' }}>
                    Enter the tracking number from your confirmation email (e.g. <strong>CV-2026-WYZGW8</strong>), or your registered phone number.
                  </p>
                  {error && <div className="customer-login-error" style={{ marginBottom: '12px' }}>{error}</div>}
                  <Input
                    label="Tracking number or phone number"
                    type="text"
                    placeholder="CV-2026-XXXXXX or 08012345678"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    required
                  />
                  <Button type="submit" variant="primary" className="full-width" disabled={loading}>
                    {loading ? 'Looking up...' : 'Continue'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerify} className="track-form">
                  <div className="customer-login-phone-sent">
                    {maskedEmail ? (
                      <p>A 6-digit verification code was sent to <strong>{maskedEmail}</strong>.</p>
                    ) : (
                      <p>If we have a record for this, a code has been sent to your registered email.</p>
                    )}
                    <button type="button" className="link-button" onClick={() => { setStep('code'); setError(''); setOtpCode('') }}>
                      Try a different tracking number
                    </button>
                  </div>
                  {error && <div className="customer-login-error" style={{ marginBottom: '12px' }}>{error}</div>}
                  <Input
                    label="Verification code"
                    type="text"
                    inputMode="numeric"
                    placeholder="6-digit code"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                  <Button type="submit" variant="primary" className="full-width" disabled={loading || otpCode.length < 6}>
                    {loading ? 'Verifying...' : 'Verify and view my application'}
                  </Button>
                  <button
                    type="button"
                    className="link-button"
                    style={{ marginTop: 8, display: 'block', textAlign: 'center' }}
                    onClick={handleResend}
                    disabled={loading}
                  >
                    Resend code
                  </button>
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
