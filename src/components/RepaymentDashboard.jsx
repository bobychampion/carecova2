import { Link } from 'react-router-dom'
import Button from './Button'
import ProgressBar from './ProgressBar'
import RepaymentSchedule from './RepaymentSchedule'
import StatusBadge from './StatusBadge'

export default function RepaymentDashboard({ loan }) {
  if (!loan || !loan.repaymentSchedule) {
    return null
  }

  const totalAmount = loan.repaymentSchedule.reduce((sum, p) => sum + p.amount, 0)
  const paidAmount = loan.repaymentSchedule
    .filter((p) => p.paid)
    .reduce((sum, p) => sum + p.amount, 0)
  const outstandingBalance = totalAmount - paidAmount
  const progressPercentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0

  const nextPayment = loan.repaymentSchedule.find((p) => !p.paid)

  return (
    <div className="repayment-dashboard">
      <div className="repayment-dashboard-header">
        <h2>Repayment Dashboard</h2>
        <StatusBadge status={loan.status} />
      </div>

      <div className="repayment-summary-cards">
        <div className="repayment-summary-card repayment-summary-card--primary">
          <div className="repayment-summary-label">Total Loan Amount</div>
          <div className="repayment-summary-value">
            ₦{totalAmount.toLocaleString()}
          </div>
        </div>

        <div className="repayment-summary-card">
          <div className="repayment-summary-label">Amount Paid</div>
          <div className="repayment-summary-value repayment-summary-value--success">
            ₦{paidAmount.toLocaleString()}
          </div>
        </div>

        <div className="repayment-summary-card">
          <div className="repayment-summary-label">Outstanding Balance</div>
          <div className="repayment-summary-value repayment-summary-value--warning">
            ₦{outstandingBalance.toLocaleString()}
          </div>
        </div>

        {nextPayment && (
          <div className="repayment-summary-card repayment-summary-card--highlight">
            <div className="repayment-summary-label">Next Payment Due</div>
            <div className="repayment-summary-value">
              ₦{nextPayment.amount.toLocaleString()}
            </div>
            <div className="repayment-summary-date">
              {new Date(nextPayment.dueDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
        )}
      </div>

      <div className="repayment-progress-section">
        <ProgressBar
          value={paidAmount}
          max={totalAmount}
          label="Repayment Progress"
          showPercentage={true}
        />
      </div>

      {nextPayment && (
        <div className="repayment-action-section">
          <Link to={`/make-payment?loanId=${loan.id}`}>
            <Button variant="primary" className="full-width">
              Make Payment Now
            </Button>
          </Link>
        </div>
      )}

      <div className="repayment-schedule-section">
        <h3>Payment History & Schedule</h3>
        <RepaymentSchedule schedule={loan.repaymentSchedule} />
      </div>
    </div>
  )
}
