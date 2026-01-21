export default function RepaymentSchedule({ schedule = [], className = '' }) {
  if (!schedule || schedule.length === 0) {
    return (
      <div className={`repayment-schedule ${className}`}>
        <p>No repayment schedule available.</p>
      </div>
    )
  }

  return (
    <div className={`repayment-schedule ${className}`}>
      <table className="schedule-table">
        <thead>
          <tr>
            <th>Month</th>
            <th>Amount (₦)</th>
            <th>Due Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((payment, index) => (
            <tr key={index} className={payment.paid ? 'row--paid' : ''}>
              <td>{payment.month}</td>
              <td>{payment.amount.toLocaleString()}</td>
              <td>{new Date(payment.dueDate).toLocaleDateString()}</td>
              <td>
                {payment.paid ? (
                  <span className="payment-status paid">
                    Paid {payment.paidDate ? `(${new Date(payment.paidDate).toLocaleDateString()})` : ''}
                  </span>
                ) : (
                  <span className="payment-status pending">Pending</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
