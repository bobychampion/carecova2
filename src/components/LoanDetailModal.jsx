import { useState } from 'react'
import Button from './Button'
import StatusBadge from './StatusBadge'
import RepaymentSchedule from './RepaymentSchedule'
import Input from './Input'

function formatDocSize(bytes) {
  if (bytes == null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function LoanDetailModal({ loan, onClose, onApprove, onReject, onModifyOffer, onRecordPayment }) {
  const [showApproveForm, setShowApproveForm] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [showModifyForm, setShowModifyForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [approveData, setApproveData] = useState({
    approvedAmount: loan?.estimatedCost || 0,
    duration: loan?.preferredDuration || 6,
  })
  const [modifyData, setModifyData] = useState({
    approvedAmount: loan?.approvedAmount ?? loan?.estimatedCost ?? 0,
    duration: loan?.approvedDuration ?? loan?.preferredDuration ?? 6,
    reason: '',
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

  const handleModifyOffer = () => {
    onModifyOffer?.(loan.id, { approvedAmount: modifyData.approvedAmount, duration: modifyData.duration, reason: modifyData.reason || undefined })
    setShowModifyForm(false)
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
                <strong>Employment sector:</strong>
                <p>{loan.employmentType === 'government' ? 'Government / public sector' : 'Private sector'}</p>
              </div>
              {(loan.employerName || loan.jobTitle) && (
                <>
                  {loan.employerName && (
                    <div>
                      <strong>Employer:</strong>
                      <p>{loan.employerName}</p>
                    </div>
                  )}
                  {loan.jobTitle && (
                    <div>
                      <strong>Job title:</strong>
                      <p>{loan.jobTitle}</p>
                    </div>
                  )}
                </>
              )}
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

          {loan.documents && Object.keys(loan.documents).length > 0 && (
            <div className="loan-detail-section">
              <h3>Documents</h3>
              <div className="documents-list">
                {loan.documents.treatment_estimate && (
                  <div className="document-item">
                    <strong>Treatment estimate:</strong> {loan.documents.treatment_estimate.fileName}
                    {loan.documents.treatment_estimate.fileSize != null && (
                      <span className="document-size"> ({formatDocSize(loan.documents.treatment_estimate.fileSize)})</span>
                    )}
                  </div>
                )}
                {loan.documents.id_document && (
                  <div className="document-item">
                    <strong>ID document:</strong> {loan.documents.id_document.fileName}
                    {loan.documents.id_document.fileSize != null && (
                      <span className="document-size"> ({formatDocSize(loan.documents.id_document.fileSize)})</span>
                    )}
                  </div>
                )}
                {loan.documents.payslip && (
                  <div className="document-item">
                    <strong>Pay slip:</strong> {loan.documents.payslip.fileName}
                    {loan.documents.payslip.fileSize != null && (
                      <span className="document-size"> ({formatDocSize(loan.documents.payslip.fileSize)})</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="loan-detail-section">
            <h3>Verification &amp; Risk</h3>
            <p className="section-hint">Identity (Dojah), Credit (FirstCentral), Banking (Mono), Payroll (Remita).</p>
            <div className="verification-grid">
              <div className="verification-item">
                <strong>Identity / KYC (Dojah):</strong>
                <span className="verification-status">{loan.verificationStatus?.identity ?? 'Pending'}</span>
              </div>
              <div className="verification-item">
                <strong>Credit (FirstCentral):</strong>
                <span className="verification-status">{loan.verificationStatus?.credit ?? 'Pending'}</span>
              </div>
              <div className="verification-item">
                <strong>Banking / Income (Mono):</strong>
                <span className="verification-status">{loan.verificationStatus?.banking ?? 'Pending'}</span>
              </div>
              <div className="verification-item">
                <strong>Payroll (Remita, if govt):</strong>
                <span className="verification-status">{loan.verificationStatus?.payroll ?? (loan.employmentType === 'government' ? 'Pending' : 'Not run')}</span>
              </div>
            </div>
            <div className="risk-summary">
              <div><strong>Risk score:</strong> {loan.riskScore ?? '—'}</div>
              <div><strong>Recommendation:</strong> {loan.riskRecommendation ?? '—'}</div>
            </div>
          </div>

          {loan.status === 'approved' && loan.approvedAmount && (
            <div className="loan-detail-section">
              <h3>Approval Details</h3>
              {loan.approvedAt && (
                <p className="decision-timestamp">Approved on {new Date(loan.approvedAt).toLocaleDateString()} at {new Date(loan.approvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              )}
              {loan.modifiedAt && (
                <>
                  <p className="decision-timestamp">Last modified on {new Date(loan.modifiedAt).toLocaleDateString()} at {new Date(loan.modifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  {loan.modifyReason && <p><strong>Reason:</strong> {loan.modifyReason}</p>}
                </>
              )}
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

          {(loan.rejectionReason || loan.rejectedAt) && (
            <div className="loan-detail-section">
              <h3>Rejection</h3>
              {loan.rejectedAt && (
                <p className="decision-timestamp">Rejected on {new Date(loan.rejectedAt).toLocaleDateString()} at {new Date(loan.rejectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              )}
              {loan.rejectionReason && (
                <p><strong>Reason:</strong> {loan.rejectionReason}</p>
              )}
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

          {loan.status === 'approved' && onModifyOffer && (
            <>
              {!showModifyForm && (
                <Button variant="secondary" onClick={() => setShowModifyForm(true)}>
                  Modify offer
                </Button>
              )}
              {showModifyForm && (
                <div className="action-form">
                  <h4>Modify Offer</h4>
                  <Input
                    label="Approved Amount (₦)"
                    type="number"
                    value={modifyData.approvedAmount}
                    onChange={(e) => setModifyData({ ...modifyData, approvedAmount: parseFloat(e.target.value) })}
                  />
                  <Input
                    label="Duration (months)"
                    type="number"
                    min="3"
                    max="12"
                    value={modifyData.duration}
                    onChange={(e) => setModifyData({ ...modifyData, duration: parseInt(e.target.value) })}
                  />
                  <Input
                    label="Reason for change (optional)"
                    type="text"
                    value={modifyData.reason}
                    onChange={(e) => setModifyData({ ...modifyData, reason: e.target.value })}
                    placeholder="Enter reason for modification"
                  />
                  <div className="form-actions">
                    <Button variant="primary" onClick={handleModifyOffer}>Confirm modification</Button>
                    <Button variant="ghost" onClick={() => setShowModifyForm(false)}>Cancel</Button>
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
