import { useState } from 'react'
import Button from './Button'
import StatusBadge from './StatusBadge'
import RepaymentSchedule from './RepaymentSchedule'
import Input from './Input'

export default function LoanDetailModal({ loan, onClose, onApprove, onReject, onRecordPayment }) {
  const [showApproveForm, setShowApproveForm] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [approveData, setApproveData] = useState({
    approvedAmount: loan?.estimatedCost || 0,
    duration: loan?.preferredDuration || 6,
  })
  const [rejectReason, setRejectReason] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])

  if (!loan) return null

  const handleApprove = () => {
    onApprove(loan.id, approveData)
    setShowApproveForm(false)
  }

  const handleReject = () => {
    onReject(loan.id, rejectReason)
    setShowRejectForm(false)
    setRejectReason('')
  }

  const handleRecordPayment = () => {
    onRecordPayment(loan.id, parseFloat(paymentAmount), paymentDate)
    setShowPaymentForm(false)
    setPaymentAmount('')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Loan Details - {loan.id}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="loan-detail-section">
            <h3>Application Information</h3>
            <div className="detail-grid">
              <div>
                <strong>Patient Name:</strong>
                <p>{loan.patientName}</p>
              </div>
              <div>
                <strong>Phone:</strong>
                <p>{loan.phone}</p>
              </div>
              <div>
                <strong>Email:</strong>
                <p>{loan.email}</p>
              </div>
              <div>
                <strong>Hospital:</strong>
                <p>{loan.hospital}</p>
              </div>
              <div>
                <strong>Treatment Category:</strong>
                <p>{loan.treatmentCategory}</p>
              </div>
              <div>
                <strong>Estimated Cost:</strong>
                <p>₦{loan.estimatedCost.toLocaleString()}</p>
              </div>
              <div>
                <strong>Preferred Duration:</strong>
                <p>{loan.preferredDuration} months</p>
              </div>
              <div>
                <strong>Status:</strong>
                <p><StatusBadge status={loan.status} /></p>
              </div>
              <div>
                <strong>Submitted:</strong>
                <p>{new Date(loan.submittedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {loan.status === 'approved' && loan.approvedAmount && (
            <div className="loan-detail-section">
              <h3>Approval Details</h3>
              <div className="detail-grid">
                <div>
                  <strong>Approved Amount:</strong>
                  <p>₦{loan.approvedAmount.toLocaleString()}</p>
                </div>
                <div>
                  <strong>Repayment Duration:</strong>
                  <p>{loan.approvedDuration || loan.preferredDuration} months</p>
                </div>
                <div>
                  <strong>Monthly Installment:</strong>
                  <p>₦{loan.monthlyInstallment?.toLocaleString() || 'N/A'}</p>
                </div>
                <div>
                  <strong>Outstanding Balance:</strong>
                  <p>₦{loan.outstandingBalance?.toLocaleString() || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {loan.repaymentSchedule && loan.repaymentSchedule.length > 0 && (
            <div className="loan-detail-section">
              <h3>Repayment Schedule</h3>
              <RepaymentSchedule schedule={loan.repaymentSchedule} />
            </div>
          )}

          {loan.rejectionReason && (
            <div className="loan-detail-section">
              <h3>Rejection Reason</h3>
              <p>{loan.rejectionReason}</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {loan.status === 'pending' && (
            <>
              {!showApproveForm && !showRejectForm && (
                <>
                  <Button variant="primary" onClick={() => setShowApproveForm(true)}>
                    Approve
                  </Button>
                  <Button variant="secondary" onClick={() => setShowRejectForm(true)}>
                    Reject
                  </Button>
                </>
              )}
              {showApproveForm && (
                <div className="action-form">
                  <h4>Approve Loan</h4>
                  <Input
                    label="Approved Amount (₦)"
                    type="number"
                    value={approveData.approvedAmount}
                    onChange={(e) => setApproveData({ ...approveData, approvedAmount: parseFloat(e.target.value) })}
                  />
                  <Input
                    label="Duration (months)"
                    type="number"
                    min="3"
                    max="12"
                    value={approveData.duration}
                    onChange={(e) => setApproveData({ ...approveData, duration: parseInt(e.target.value) })}
                  />
                  <div className="form-actions">
                    <Button variant="primary" onClick={handleApprove}>Confirm Approval</Button>
                    <Button variant="ghost" onClick={() => setShowApproveForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}
              {showRejectForm && (
                <div className="action-form">
                  <h4>Reject Loan</h4>
                  <Input
                    label="Rejection Reason"
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason for rejection"
                  />
                  <div className="form-actions">
                    <Button variant="secondary" onClick={handleReject}>Confirm Rejection</Button>
                    <Button variant="ghost" onClick={() => setShowRejectForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </>
          )}

          {loan.status === 'active' && loan.repaymentSchedule && (
            <>
              {!showPaymentForm && (
                <Button variant="primary" onClick={() => setShowPaymentForm(true)}>
                  Record Payment
                </Button>
              )}
              {showPaymentForm && (
                <div className="action-form">
                  <h4>Record Payment</h4>
                  <Input
                    label="Payment Amount (₦)"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                  <Input
                    label="Payment Date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                  <div className="form-actions">
                    <Button variant="primary" onClick={handleRecordPayment}>Record Payment</Button>
                    <Button variant="ghost" onClick={() => setShowPaymentForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
