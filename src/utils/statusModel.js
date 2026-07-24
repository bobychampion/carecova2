export const APPLICATION_STATUS = {
  SUBMITTED: 'submitted',
  PENDING: 'pending',
  PENDING_STAGE1: 'pending_stage1',
  INCOMPLETE: 'incomplete',
  PENDING_ADMIN_REVIEW: 'pending_admin_review',
  SALES_REJECTED: 'sales_rejected',
  ADMIN_REJECTED: 'admin_rejected',
  APPROVED: 'approved',
  APPROVED_FOR_DISBURSEMENT: 'approved_for_disbursement',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  AVAILABLE_FOR_FINANCING: 'available_for_financing',
  UNDER_FINANCIER_REVIEW: 'under_financier_review',
  RESERVED_FOR_FINANCING: 'reserved_for_financing',
  FINANCED: 'financed',
  FINANCING_DECLINED: 'financing_declined',
}

export const FINANCING_STATUS = {
  AVAILABLE_FOR_FINANCING: 'available_for_financing',
  UNDER_FINANCIER_REVIEW: 'under_financier_review',
  RESERVED_FOR_FINANCING: 'reserved_for_financing',
  FINANCED: 'financed',
  FINANCING_DECLINED: 'financing_declined',
}

export const DISBURSEMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
}

export function isSalesStage(status) {
  return [
    APPLICATION_STATUS.SUBMITTED,
    APPLICATION_STATUS.PENDING,
    APPLICATION_STATUS.PENDING_STAGE1,
    APPLICATION_STATUS.INCOMPLETE,
  ].includes(status)
}

export function isAdminStage(status) {
  return [
    APPLICATION_STATUS.PENDING_ADMIN_REVIEW,
  ].includes(status)
}

export function isCreditStage(status, disbursementStatus) {
  if (status === APPLICATION_STATUS.APPROVED || status === APPLICATION_STATUS.APPROVED_FOR_DISBURSEMENT) {
    return true
  }
  if (status === APPLICATION_STATUS.ACTIVE && disbursementStatus === DISBURSEMENT_STATUS.PENDING) {
    return true
  }
  return false
}

export function isPostDisbursement(status) {
  return status === APPLICATION_STATUS.ACTIVE || status === APPLICATION_STATUS.COMPLETED
}

export function isFinancingStage(loan) {
  const financingStatus = loan?.financing_status
  if (!financingStatus) return false
  return [
    FINANCING_STATUS.AVAILABLE_FOR_FINANCING,
    FINANCING_STATUS.UNDER_FINANCIER_REVIEW,
    FINANCING_STATUS.RESERVED_FOR_FINANCING,
  ].includes(financingStatus)
}

export function isFinanced(loan) {
  return loan?.financing_status === FINANCING_STATUS.FINANCED
}

export function getStageLabel(loan) {
  if (isFinancingStage(loan)) return 'Stage 4 – External Financing'
  if (isFinanced(loan)) return 'Stage 5 – Financed'

  const status = loan?.status
  if (!status) return '—'

  if (isSalesStage(status)) return 'Stage 1 – Sales'
  if (isAdminStage(status)) return 'Stage 2 – Admin'
  if (isCreditStage(status, loan?.disbursementStatus)) return 'Stage 3 – Credit'
  if (isPostDisbursement(status)) return 'Lifecycle – Post Approval'
  return '—'
}

export function getStatusBadgeConfig(status, financingStatus) {
  if (financingStatus === FINANCING_STATUS.AVAILABLE_FOR_FINANCING) {
    return { label: 'Available for Financing', icon: '●', className: 'status--financing-available' }
  }
  if (financingStatus === FINANCING_STATUS.UNDER_FINANCIER_REVIEW) {
    return { label: 'Under Financier Review', icon: '◎', className: 'status--financing-review' }
  }
  if (financingStatus === FINANCING_STATUS.RESERVED_FOR_FINANCING) {
    return { label: 'Reserved for Financing', icon: '◆', className: 'status--financing-reserved' }
  }
  if (financingStatus === FINANCING_STATUS.FINANCED) {
    return { label: 'Financed', icon: '★', className: 'status--financing-financed' }
  }
  if (financingStatus === FINANCING_STATUS.FINANCING_DECLINED) {
    return { label: 'Financing Declined', icon: '✗', className: 'status--financing-declined' }
  }

  switch (status) {
    case APPLICATION_STATUS.SUBMITTED:
    case APPLICATION_STATUS.PENDING:
    case APPLICATION_STATUS.PENDING_STAGE1:
    case APPLICATION_STATUS.INCOMPLETE:
      return { label: 'Pending', icon: '●', className: 'status--pending' }
    case APPLICATION_STATUS.PENDING_ADMIN_REVIEW:
      return { label: 'Pending Admin Review', icon: '●', className: 'status--pending' }
    case APPLICATION_STATUS.SALES_REJECTED:
      return { label: 'Sales Rejected', icon: '✗', className: 'status--rejected' }
    case APPLICATION_STATUS.ADMIN_REJECTED:
    case APPLICATION_STATUS.REJECTED:
      return { label: 'Rejected', icon: '✗', className: 'status--rejected' }
    case APPLICATION_STATUS.APPROVED:
      return { label: 'Approved', icon: '✓', className: 'status--approved' }
    case APPLICATION_STATUS.APPROVED_FOR_DISBURSEMENT:
      return { label: 'Approved for Disbursement', icon: '✓', className: 'status--approved' }
    case APPLICATION_STATUS.ACTIVE:
      return { label: 'Active', icon: '●', className: 'status--active' }
    case APPLICATION_STATUS.COMPLETED:
      return { label: 'Completed', icon: '★', className: 'status--completed' }
    default:
      return { label: status || 'Pending', icon: '●', className: 'status--pending' }
  }
}

