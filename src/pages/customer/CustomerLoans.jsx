import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCustomerAuth } from '../../hooks/useCustomerAuth'
import { loanService } from '../../services/loanService'
import StatusBadge from '../../components/StatusBadge'

export default function CustomerLoans() {
  const { customer } = useCustomerAuth()
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!customer?.id) return
      try {
        const list = await loanService.getLoansByCustomerId(customer.id, customer.phone)
        if (!cancelled) setLoans(list)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [customer?.id, customer?.phone])

  if (loading) {
    return <div className="customer-portal-loading">Loading your loans...</div>
  }

  return (
    <div className="customer-loans-page">
      <h1 className="customer-loans-title">My loans</h1>
      <p className="customer-loans-subtitle">View and manage your healthcare financing applications.</p>

      {loans.length === 0 ? (
        <div className="customer-loans-empty">
          <p>You do not have any applications yet.</p>
          <Link to="/apply" className="button button--primary">Apply for financing</Link>
        </div>
      ) : (
        <div className="customer-loans-list">
          {loans.map((loan) => {
            const totalRepayment = loan.repaymentSchedule?.reduce((s, p) => s + p.amount, 0) || loan.totalRepayment || 0
            const paidAmount = loan.repaymentSchedule?.filter((p) => p.paid).reduce((s, p) => s + (p.paidAmount ?? p.amount), 0) || loan.totalPaid || 0
            const progress = totalRepayment > 0 ? Math.round((paidAmount / totalRepayment) * 100) : 0
            return (
              <Link to={`/portal/loans/${loan.id}`} key={loan.id} className="customer-loans-card">
                <div className="customer-loans-card-header">
                  <span className="customer-loans-card-id">{loan.id}</span>
                  <StatusBadge status={loan.status} />
                </div>
                <div className="customer-loans-card-body">
                  <div className="customer-loans-card-row">
                    <span>Amount</span>
                    <strong>₦{(loan.approvedAmount || loan.estimatedCost || 0).toLocaleString()}</strong>
                  </div>
                  <div className="customer-loans-card-row">
                    <span>Total repayable</span>
                    <strong>₦{totalRepayment.toLocaleString()}</strong>
                  </div>
                  {(loan.status === 'active' || loan.status === 'overdue' || loan.status === 'completed') && (
                    <div className="customer-loans-card-progress">
                      <div className="customer-loans-card-progress-bar" style={{ width: `${progress}%` }} />
                      <span>{progress}% repaid</span>
                    </div>
                  )}
                </div>
                <div className="customer-loans-card-footer">
                  Submitted {new Date(loan.submittedAt).toLocaleDateString()}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
