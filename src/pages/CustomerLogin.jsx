import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Button from '../components/Button'
import Input from '../components/Input'
import { useCustomerAuth } from '../hooks/useCustomerAuth'

export default function CustomerLogin() {
  const navigate = useNavigate()
  const { requestOtp, loginWithOtp } = useCustomerAuth()
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRequestCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await requestOtp(phone)
    setLoading(false)
    if (result.success) {
      setStep('verify')
      setCode('')
    } else {
      setError(result.error || 'Could not send code')
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await loginWithOtp(phone, code)
    setLoading(false)
    if (result.success) {
      navigate('/portal')
    } else {
      setError(result.error || 'Invalid code')
    }
  }

  return (
    <>
      <Header />
      <main>
        <section className="section customer-login-section">
          <div className="container">
            <div className="customer-login-card">
              <h1 className="customer-login-title">Sign in to your account</h1>
              <p className="customer-login-subtitle">
                Use the phone number from your application to access your loans and repayments.
              </p>

              {step === 'phone' ? (
                <form onSubmit={handleRequestCode} className="customer-login-form">
                  {error && <div className="customer-login-error">{error}</div>}
                  <Input
                    label="Phone number"
                    type="tel"
                    placeholder="08012345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <Button type="submit" variant="primary" className="full-width" disabled={loading}>
                    {loading ? 'Sending code...' : 'Send verification code'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerify} className="customer-login-form">
                  {error && <div className="customer-login-error">{error}</div>}
                  <p className="customer-login-phone-sent">
                    Code sent to <strong>{phone}</strong>. <button type="button" className="link-button" onClick={() => setStep('phone')}>Change number</button>
                  </p>
                  <Input
                    label="Verification code"
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                  <Button type="submit" variant="primary" className="full-width" disabled={loading || code.length < 6}>
                    {loading ? 'Signing in...' : 'Verify and sign in'}
                  </Button>
                </form>
              )}

              <p className="customer-login-demo">Demo: use any 10-digit phone, then code <strong>123456</strong></p>
              <div className="customer-login-links">
                <Link to="/track">Track by application ID (no account)</Link>
                <Link to="/">Back to home</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
