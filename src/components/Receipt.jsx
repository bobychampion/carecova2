export default function Receipt({ payment, loanId }) {
  if (!payment) return null

  return (
    <div className="receipt-card">
      <div className="receipt-header">
        <h3>Payment Receipt</h3>
        <div className="receipt-status receipt-status--success">Completed</div>
      </div>

      <div className="receipt-details">
        <div className="receipt-detail-row">
          <span className="receipt-label">Transaction ID:</span>
          <span className="receipt-value">{payment.id}</span>
        </div>
        <div className="receipt-detail-row">
          <span className="receipt-label">Loan ID:</span>
          <span className="receipt-value">{loanId || payment.loanId}</span>
        </div>
        <div className="receipt-detail-row">
          <span className="receipt-label">Payment Amount:</span>
          <span className="receipt-value receipt-value--amount">
            ₦{payment.amount.toLocaleString()}
          </span>
        </div>
        <div className="receipt-detail-row">
          <span className="receipt-label">Payment Method:</span>
          <span className="receipt-value">{payment.method}</span>
        </div>
        <div className="receipt-detail-row">
          <span className="receipt-label">Date & Time:</span>
          <span className="receipt-value">
            {new Date(payment.processedAt).toLocaleString()}
          </span>
        </div>
        <div className="receipt-detail-row">
          <span className="receipt-label">Status:</span>
          <span className="receipt-value receipt-value--success">{payment.status}</span>
        </div>
      </div>

      <div className="receipt-footer">
        <p>Thank you for your payment. This receipt serves as proof of payment.</p>
      </div>
    </div>
  )
}
