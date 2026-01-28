import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Button from '../components/Button'
import PaymentMethodSelector from '../components/PaymentMethodSelector'
import Input from '../components/Input'
import { trackingService } from '../services/trackingService'
import { paymentService } from '../services/paymentService'

export default function MakePayment() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const loanId = searchParams.get('loanId')

  const [loan, setLoan] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState('wallet')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadLoan = async () => {
      if (loanId) {
        try {
          const loanData = await trackingService.trackLoan(loanId)
          setLoan(loanData)
          if (loanData.nextPayment) {
            setAmount(loanData.nextPayment.amount.toString())
          }
        } catch (err) {
          setError('Loan not found')
        }
      }
    }
    loadLoan()
  }, [loanId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid payment amount')
      return
    }

    if (!loan) {
      setError('Loan information not available')
      return
    }

    setLoading(true)

    try {
      const result = await paymentService.processPayment({
        loanId: loan.id,
        amount: parseFloat(amount),
        method: selectedMethod,
      })

      navigate(`/payment-confirmation?transactionId=${result.transactionId}&loanId=${loan.id}`)
    } catch (err) {
      setError(err.message || 'Payment processing failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!loan) {
    return (
      <>
        <Header />
        <main>
          <section className="section">
            <div className="container">
              <div className="loading">Loading payment information...</div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    )
  }

  const nextPayment = loan.nextPayment
  const maxAmount = loan.outstandingBalance || nextPayment?.amount || 0

  return (
    <>
      <Header />
      <main>
        <section className="page-hero">
          <div className="container">
            <h1>Make a Payment</h1>
            <p>Complete your payment securely</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="payment-container">
              <div className="payment-summary">
                <h2>Payment Summary</h2>
                <div className="payment-summary-item">
                  <span>Loan ID:</span>
                  <strong>{loan.id}</strong>
                </div>
                {nextPayment && (
                  <div className="payment-summary-item">
                    <span>Next Payment Due:</span>
                    <strong>₦{nextPayment.amount.toLocaleString()}</strong>
                  </div>
                )}
                <div className="payment-summary-item">
                  <span>Outstanding Balance:</span>
                  <strong>₦{loan.outstandingBalance?.toLocaleString() || '0'}</strong>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="payment-form">
                <Input
                  label="Payment Amount (₦)"
                  type="number"
                  min="1"
                  max={maxAmount}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Enter amount (max: ₦${maxAmount.toLocaleString()})`}
                  required
                />

                <PaymentMethodSelector
                  selectedMethod={selectedMethod}
                  onSelect={setSelectedMethod}
                />

                {error && <div className="error-message">{error}</div>}

                <Button type="submit" variant="primary" className="full-width" disabled={loading}>
                  {loading ? 'Processing Payment...' : 'Proceed to Payment'}
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
