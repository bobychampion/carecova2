import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCustomerAuth } from '../../hooks/useCustomerAuth'
import { loanService } from '../../services/loanService'
import RepaymentDashboard from '../../components/RepaymentDashboard'
import StatusBadge from '../../components/StatusBadge'

export default function CustomerLoanDetail() {
  const { id } = useParams()
  const { customer } = useCustomerAuth()
  const [loan, setLoan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!id || !customer?.id) return
      try {
        const myLoans = await loanService.getLoansByCustomerId(customer.id, customer.phone)
        const found = myLoans.find((l) => l.id === id)
        if (!cancelled) {
          setLoan(found || null)
          setForbidden(!found && myLoans.length > 0)
        }
      } catch (e) {
        if (!cancelled) setLoan(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id, customer?.id, customer?.phone])

  if (loading) {
    return <div className="customer-portal-loading">Loading loan details...</div>
  }

  if (forbidden || !loan) {
    return (
      <div className="customer-portal-error">
        <h2>Loan not found</h2>
        <p>This loan doesn’t belong to your account or doesn’t exist.</p>
        <Link to="/portal/loans">Back to my loans</Link>
      </div>
    )
  }

  const isApproved = loan.status === 'approved' && !loan.offerAcceptedAt
  const isActiveOrCompleted = loan.status === 'active' || loan.status === 'overdue' || loan.status === 'completed'

  return (
    <div className="customer-loan-detail">
      <div className="customer-loan-detail-header">
        <Link to="/portal/loans" className="customer-loan-detail-back">← My loans</Link>
        <h1 className="customer-loan-detail-title">Application {loan.id}</h1>
        <StatusBadge status={loan.status} />
      </div>

      {isApproved && (
        <div className="customer-loan-detail-cta">
          <p>Your application has been approved. Review and accept your offer to proceed.</p>
          <Link to={`/offer/${loan.id}`} className="button button--primary">View and accept offer</Link>
        </div>
      )}

      {isActiveOrCompleted && loan.repaymentSchedule && (
        <RepaymentDashboard loan={loan} />
      )}

      {!isApproved && !isActiveOrCompleted && (
        <div className="customer-loan-detail-info">
          <h2>Application details</h2>
          <dl className="customer-loan-detail-dl">
            <dt>Patient</dt>
            <dd>{loan.fullName || loan.patientName}</dd>
            <dt>Hospital</dt>
            <dd>{loan.hospital || '—'}</dd>
            <dt>Treatment</dt>
            <dd>{loan.treatmentCategory || '—'}</dd>
            <dt>Amount requested</dt>
            <dd>₦{(loan.estimatedCost || loan.requestedAmount || 0).toLocaleString()}</dd>
            <dt>Submitted</dt>
            <dd>{new Date(loan.submittedAt).toLocaleDateString()}</dd>
          </dl>
          <p className="customer-loan-detail-status-note">We’ll review your application and get in touch. You can track status here or via the link we sent you.</p>
        </div>
      )}
    </div>
  )
}
