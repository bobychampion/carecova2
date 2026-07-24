import { APPLICATION_STATUS, FINANCING_STATUS, getStatusBadgeConfig } from '../utils/statusModel'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const API_ROOT = API_BASE_URL ? `${API_BASE_URL}/api` : ''
const USE_BACKEND = !!API_BASE_URL
const BACKEND_ID_REGEX = /^[a-f0-9]{24}$/i
const FINANCING_LOG_KEY = 'carecova_financing_log'
const FINANCING_SESSION_KEY = 'carecova_financing_session'

function looksLikeBackendId(value) {
  if (typeof value !== 'string') return false
  return BACKEND_ID_REGEX.test(value.trim())
}

function getFinancingLog() {
  try {
    const stored = localStorage.getItem(FINANCING_LOG_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveFinancingLog(log) {
  localStorage.setItem(FINANCING_LOG_KEY, JSON.stringify(log))
  if (log.length > 1000) {
    const trimmed = log.slice(0, 1000)
    saveFinancingLog(trimmed)
  }
}

function getLoans() {
  try {
    const stored = localStorage.getItem('carecova_loans')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveLoans(loans) {
  localStorage.setItem('carecova_loans', JSON.stringify(loans))
}

function recordFinancingActivity(loanId, financierId, userId, action, notes = '') {
  const log = getFinancingLog()
  const entry = {
    id: `FIN-ACT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    loanId,
    financierId,
    userId,
    action,
    notes,
    createdAt: new Date().toISOString(),
  }
  log.unshift(entry)
  saveFinancingLog(log)
  return entry
}

function getStoredFinancingSession() {
  try {
    const stored = localStorage.getItem(FINANCING_SESSION_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function saveFinancingSession(session) {
  if (session) {
    localStorage.setItem(FINANCING_SESSION_KEY, JSON.stringify(session))
    if (session.loggedIn && session.financierName) {
      const adminSession = {
        loggedIn: true,
        role: 'financier',
        username: session.financierId || session.userId,
        name: session.financierName,
        loginTime: new Date().toISOString(),
      }
      localStorage.setItem('carecova_admin_session', JSON.stringify(adminSession))
    }
  } else {
    localStorage.removeItem(FINANCING_SESSION_KEY)
    localStorage.removeItem('carecova_admin_session')
  }
}

export const isLoanAvailableForFinancing = (loan) => {
  if (!loan) return false
  const financingStatus = loan.financing_status
  if (!financingStatus) return false
  return (
    financingStatus === FINANCING_STATUS.AVAILABLE_FOR_FINANCING ||
    financingStatus === FINANCING_STATUS.FINANCING_DECLINED
  )
}

export const isLoanReservedForFinancing = (loan) => {
  return loan?.financing_status === FINANCING_STATUS.RESERVED_FOR_FINANCING
}

export const isLoanUnderFinancierReview = (loan) => {
  return loan?.financing_status === FINANCING_STATUS.UNDER_FINANCIER_REVIEW
}

export const isLoanFinanced = (loan) => {
  return loan?.financing_status === FINANCING_STATUS.FINANCED
}

export const canFinancierReserve = (loan, financierId) => {
  if (!loan) return false
  if (isLoanReservedForFinancing(loan)) return false
  if (isLoanFinanced(loan)) return false
  return isLoanAvailableForFinancing(loan)
}

export const canFinancierActOnLoan = (loan, financierId, userId) => {
  if (!loan) return false
  if (!isLoanReservedForFinancing(loan)) return false
  if (loan.reserved_by_financier_id !== financierId) return false
  if (loan.reserved_by_user_id !== userId) return false
  return true
}

export const financierService = {
  initializeSession: () => {
    let session = getStoredFinancingSession()
    if (!session) {
      session = {
        loggedIn: false,
        role: null,
        financierName: null,
        financierId: null,
        userId: null,
      }
    }
    return session
  },

  login: async (username, password) => {
    if (USE_BACKEND) {
      const response = await fetch(`${API_ROOT}/financiers/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body?.message || 'Invalid credentials')
      const session = {
        loggedIn: true,
        role: 'financier',
        financierName: body.financier?.name || body.name || username,
        financierId: body.financier?.id || body.id || username,
        userId: body.user?.id || body.userId || username,
        accessToken: body.accessToken,
        refreshToken: body.refreshToken,
      }
      saveFinancingSession(session)
      return session
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const USERS_KEY = 'carecova_admin_users'
        let users = {}
        try {
          const stored = localStorage.getItem(USERS_KEY)
          if (stored) users = JSON.parse(stored)
        } catch {
          users = {}
        }

        let demoFinanciers = null
        try {
          const adminStored = localStorage.getItem(USERS_KEY)
          if (adminStored) {
            const adminUsers = JSON.parse(adminStored)
            demoFinanciers = Object.values(adminUsers).filter(u => u.role === 'financier')
          }
        } catch {}

        if (!demoFinanciers || demoFinanciers.length === 0) {
          demoFinanciers = [
            { username: 'financier1', password: 'financier123', role: 'financier', name: 'ABC Finance', status: 'active' },
            { username: 'financier2', password: 'financier123', role: 'financier', name: 'XYZ Capital', status: 'active' },
          ]
          demoFinanciers.forEach(u => {
            if (!users[u.username]) users[u.username] = u
          })
          localStorage.setItem(USERS_KEY, JSON.stringify(users))
        }

        const user = Object.values(users).find(
          (u) => u.username === username && u.role === 'financier'
        )

        if (user && user.password === password) {
          if (user.status === 'suspended') {
            reject(new Error('Account suspended'))
            return
          }
          const session = {
            loggedIn: true,
            role: 'financier',
            financierName: user.name || username,
            financierId: user.username,
            userId: user.username,
          }
          saveFinancingSession(session)
          resolve(session)
        } else {
          reject(new Error('Invalid financier credentials'))
        }
      }, 500)
    })
  },

  logout: () => {
    saveFinancingSession(null)
  },

  getSession: () => {
    return getStoredFinancingSession()
  },

  isAuthenticated: () => {
    const s = getStoredFinancingSession()
    return Boolean(s?.loggedIn)
  },

  getAvailableForFinancing: async () => {
    const session = getStoredFinancingSession()
    if (USE_BACKEND && session?.accessToken) {
      const response = await fetch(`${API_ROOT}/financiers/loans/available`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      })
      if (!response.ok) throw new Error('Failed to fetch available loans')
      const data = await response.json()
      const items = Array.isArray(data) ? data : data?.items || data?.data || []
      return items.map(normalizeLoanFromApi)
    }

    const loans = getLoans()
    return loans.filter((loan) => {
      const financed = loan.financing_status === FINANCING_STATUS.FINANCED
      const rejected = loan.financing_status === FINANCING_STATUS.FINANCING_DECLINED
      const declinedButAvailable = loan.financing_status === FINANCING_STATUS.FINANCING_DECLINED
      return (
        loan.status === 'approved' &&
        (!loan.financing_status || financed || rejected || declinedButAvailable)
      )
    })
  },

  getMyReservations: async (financierId) => {
    const session = getStoredFinancingSession()
    if (USE_BACKEND && session?.accessToken) {
      const response = await fetch(`${API_ROOT}/financiers/loans/reservations`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      })
      if (!response.ok) throw new Error('Failed to fetch reservations')
      const data = await response.json()
      const items = Array.isArray(data) ? data : data?.items || data?.data || []
      return items.map(normalizeLoanFromApi)
    }

    const loans = getLoans()
    const myId = financierId || session?.financierId || session?.userId
    return loans.filter((loan) => {
      if (loan.financing_status !== FINANCING_STATUS.RESERVED_FOR_FINANCING) return false
      if (loan.reserved_by_financier_id !== myId) return false
      return true
    })
  },

  getActivityLog: async (loanId) => {
    const session = getStoredFinancingSession()
    if (USE_BACKEND && session?.accessToken) {
      const url = loanId
        ? `${API_ROOT}/financiers/loans/${loanId}/financing-activity`
        : `${API_ROOT}/financiers/financing-activity`
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      })
      if (!response.ok) throw new Error('Failed to fetch financing activity')
      return await response.json()
    }

    const activities = getFinancingLog()
    if (loanId) {
      return activities.filter((a) => a.loanId === loanId)
    }
    return activities
  },

  startFinancierReview: async (loanId, notes = '') => {
    const session = getStoredFinancingSession()
    if (!session?.loggedIn) throw new Error('Not authenticated')

    if (USE_BACKEND && session.accessToken) {
      const trimmed = loanId.trim()
      if (!trimmed || trimmed === 'undefined') throw new Error('Application not found')
      const response = await fetch(`${API_ROOT}/financiers/loans/${trimmed}/start-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ notes }),
      })
      if (!response.ok) {
        const body = await response.json()
        throw new Error(body?.message || 'Failed to start review')
      }
      return await response.json()
    }

    const loans = getLoans()
    const loanIndex = loans.findIndex((l) => l.id === loanId)
    if (loanIndex === -1) throw new Error('Application not found')

    const loan = loans[loanIndex]
    if (!['approved'].includes(loan.status)) {
      throw new Error('Only approved applications are available for financing')
    }

    const currentStatus = loan.financing_status
    if (
      currentStatus &&
      ![
        FINANCING_STATUS.AVAILABLE_FOR_FINANCING,
        FINANCING_STATUS.FINANCING_DECLINED,
      ].includes(currentStatus)
    ) {
      throw new Error('This application is not available for review')
    }

    loan.financing_status = FINANCING_STATUS.UNDER_FINANCIER_REVIEW
    loan.lastReviewedByFinancier = session.financierName
    loan.lastReviewStartedAt = new Date().toISOString()
    saveLoans(loans)

    recordFinancingActivity(
      loanId,
      session.financierId,
      session.userId,
      'START_REVIEW',
      notes || `Started review by ${session.financierName || session.userId}`
    )

    return loan
  },

  reserveForFinancing: async (loanId, notes = '') => {
    const session = getStoredFinancingSession()
    if (!session?.loggedIn) throw new Error('Not authenticated')

    if (USE_BACKEND && session.accessToken) {
      const trimmed = loanId.trim()
      if (!trimmed || trimmed === 'undefined') throw new Error('Application not found')
      const response = await fetch(`${API_ROOT}/financiers/loans/${trimmed}/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ notes }),
      })
      if (!response.ok) {
        const body = await response.json()
        if (response.status === 409) {
          throw new Error('This application has already been reserved by another financier.')
        }
        throw new Error(body?.message || 'Failed to reserve application')
      }
      return await response.json()
    }

    const loans = getLoans()
    const loanIndex = loans.findIndex((l) => l.id === loanId)
    if (loanIndex === -1) throw new Error('Application not found')

    const loan = loans[loanIndex]
    const currentFStatus = loan.financing_status

    if (
      currentFStatus === FINANCING_STATUS.RESERVED_FOR_FINANCING ||
      currentFStatus === FINANCING_STATUS.FINANCED
    ) {
      throw new Error('This application has already been reserved by another financier.')
    }

    if (
      currentFStatus &&
      ![FINANCING_STATUS.AVAILABLE_FOR_FINANCING, FINANCING_STATUS.FINANCING_DECLINED].includes(
        currentFStatus
      )
    ) {
      throw new Error('This application is not available for reservation')
    }

    const financierId = session.financierId || session.userId
    const now = new Date().toISOString()

    loan.financing_status = FINANCING_STATUS.RESERVED_FOR_FINANCING
    loan.reserved_by_financier_id = financierId
    loan.reserved_by_user_id = session.userId
    loan.reserved_at = now
    loan.financier_notes = notes || ''

    saveLoans(loans)

    recordFinancingActivity(
      loanId,
      financierId,
      session.userId,
      'RESERVE_FOR_FINANCING',
      notes || `Reserved by ${session.financierName || session.userId}`
    )

    return loan
  },

  approveFinancing: async (loanId, financingAmount, notes = '') => {
    const session = getStoredFinancingSession()
    if (!session?.loggedIn) throw new Error('Not authenticated')

    if (USE_BACKEND && session.accessToken) {
      const trimmed = loanId.trim()
      if (!trimmed || trimmed === 'undefined') throw new Error('Application not found')
      const response = await fetch(`${API_ROOT}/financiers/loans/${trimmed}/approve-financing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ financingAmount, notes }),
      })
      if (!response.ok) {
        const body = await response.json()
        throw new Error(body?.message || 'Failed to approve financing')
      }
      return await response.json()
    }

    const loans = getLoans()
    const loanIndex = loans.findIndex((l) => l.id === loanId)
    if (loanIndex === -1) throw new Error('Application not found')

    const loan = loans[loanIndex]
    const financierId = session.financierId || session.userId

    if (!canFinancierActOnLoan(loan, financierId, session.userId)) {
      throw new Error('You are not authorized to approve financing for this application')
    }

    const amount = parseFloat(financingAmount || 0)
    if (!amount || amount <= 0) {
      throw new Error('Financing amount must be greater than zero')
    }

    const now = new Date().toISOString()

    loan.financing_status = FINANCING_STATUS.FINANCED
    loan.financed_at = now
    loan.financing_amount = amount
    loan.financed_by = session.financierName || financierId
    loan.financing_notes = notes || ''
    loan.financed_by_user_id = session.userId

    saveLoans(loans)

    recordFinancingActivity(
      loanId,
      financierId,
      session.userId,
      'APPROVE_FINANCING',
      notes || `Approved financing of ₦${amount.toLocaleString()} by ${session.financierName || financierId}`
    )

    return loan
  },

  declineFinancing: async (loanId, notes = '') => {
    const session = getStoredFinancingSession()
    if (!session?.loggedIn) throw new Error('Not authenticated')

    if (USE_BACKEND && session.accessToken) {
      const trimmed = loanId.trim()
      if (!trimmed || trimmed === 'undefined') throw new Error('Application not found')
      const response = await fetch(`${API_ROOT}/financiers/loans/${trimmed}/decline-financing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ notes }),
      })
      if (!response.ok) {
        const body = await response.json()
        throw new Error(body?.message || 'Failed to decline financing')
      }
      return await response.json()
    }

    const loans = getLoans()
    const loanIndex = loans.findIndex((l) => l.id === loanId)
    if (loanIndex === -1) throw new Error('Application not found')

    const loan = loans[loanIndex]
    const financierId = session.financierId || session.userId

    const wasReserved = isLoanReservedForFinancing(loan) && loan.reserved_by_financier_id === financierId

    if (wasReserved) {
      recordFinancingActivity(
        loanId,
        financierId,
        session.userId,
        'RELEASE_RESERVATION',
        notes || `Reservation released by ${session.financierName || financierId}`
      )
    }

    loan.financing_status = FINANCING_STATUS.FINANCING_DECLINED
    loan.reserved_by_financier_id = null
    loan.reserved_by_user_id = null
    loan.reserved_at = null
    loan.financier_notes = notes || ''
    loan.financing_amount = null
    loan.financed_at = null

    saveLoans(loans)

    recordFinancingActivity(
      loanId,
      financierId,
      session.userId,
      'DECLINE_FINANCING',
      notes || `Declined financing by ${session.financierName || financierId}`
    )

    return loan
  },

  getDashboardStats: async () => {
    const session = getStoredFinancingSession()
    if (!session?.loggedIn) return null

    if (USE_BACKEND && session.accessToken) {
      const response = await fetch(`${API_ROOT}/financiers/dashboard`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      })
      if (!response.ok) throw new Error('Failed to fetch dashboard stats')
      return await response.json()
    }

    const loans = getLoans()
    const myId = session.financierId || session.userId

    const available = loans.filter(
      (l) =>
        l.financing_status === FINANCING_STATUS.AVAILABLE_FOR_FINANCING && l.status === 'approved'
    ).length

    const myReviews = loans.filter(
      (l) =>
        l.financing_status === FINANCING_STATUS.UNDER_FINANCIER_REVIEW &&
        l.lastReviewedByFinancier === session.financierName
    ).length

    const myReservations = loans.filter(
      (l) =>
        l.financing_status === FINANCING_STATUS.RESERVED_FOR_FINANCING &&
        l.reserved_by_financier_id === myId
    ).length

    const myFinanced = loans.filter(
      (l) =>
        l.financing_status === FINANCING_STATUS.FINANCED &&
        l.financed_by_user_id === session.userId
    ).length

    return {
      available,
      myReviews,
      myReservations,
      myFinanced,
    }
  },
}

function normalizeLoanFromApi(loan) {
  if (!loan) return loan
  const source = loan.loan && typeof loan.loan === 'object' ? loan.loan : loan
  const toNaira = (nairaValue, koboValue) => {
    if (typeof nairaValue === 'number' && Number.isFinite(nairaValue)) return nairaValue
    const fromKobo = Number(koboValue)
    return Number.isFinite(fromKobo) ? fromKobo / 100 : undefined
  }
  const normalizedSchedule = Array.isArray(source.repaymentSchedule)
    ? source.repaymentSchedule.map((item, index) => {
        const amount = toNaira(item?.amount, item?.amountKobo) ?? 0
        const paidAmount = toNaira(item?.paidAmount, item?.paidAmountKobo) ?? 0
        const normalizedStatus = String(item?.status || '').toLowerCase()
        const isPaid = item?.paid === true || normalizedStatus === 'paid'
        return {
          ...item,
          month: item?.month ?? index + 1,
          amount,
          amountKobo: Number(item?.amountKobo) || Math.round(amount * 100),
          paidAmount,
          paidAmountKobo: Number(item?.paidAmountKobo) || Math.round(paidAmount * 100),
          paid: isPaid || paidAmount >= amount,
          paymentDate: item?.paymentDate || item?.paidAt || item?.paidOn || null,
          paidOn: item?.paidOn || item?.paymentDate || item?.paidAt || null,
          paymentMethod: item?.paymentMethod || item?.paymentChannel || null,
          txReference: item?.txReference || item?.paymentReference || null,
        }
      })
    : undefined
  const approvedAmount = source.approvedAmount ?? source.approved_amount ?? source.estimatedCost ?? source.requestedAmount ?? 0
  const rawStatus = source.status ?? source.applicationStatus ?? source.stage ?? null
  let status = rawStatus
  if (!status && (source.disbursedAt || source.disbursementConfirmedAt)) status = 'active'
  if (status === 'disbursed') status = 'active'
  if (status === 'ready_to_disburse') status = 'approved'
  return {
    ...source,
    id: source.id || source._id,
    status,
    patientName: source.patientName || source.fullName,
    fullName: source.fullName || source.patientName,
    hospital: source.hospital || source.hospitalName || '—',
    estimatedCost: source.estimatedCost ?? source.requestedAmount ?? 0,
    approvedAmount: typeof approvedAmount === 'number' ? approvedAmount : Number(approvedAmount) || 0,
    financing_status: source.financing_status || loan.financing_status,
    reserved_by_financier_id: source.reserved_by_financier_id || loan.reserved_by_financier_id,
    reserved_by_user_id: source.reserved_by_user_id || loan.reserved_by_user_id,
    reserved_at: source.reserved_at || loan.reserved_at,
    financed_at: source.financed_at || loan.financed_at,
    financing_amount: source.financing_amount ?? loan.financing_amount,
    financier_notes: source.financier_notes || loan.financier_notes,
    submittedAt: source.submittedAt || source.createdAt,
    disbursedAt: source.disbursedAt ?? source.disbursementConfirmedAt,
    totalPaid: toNaira(source.totalPaid, source.totalPaidKobo) ?? (source.totalPaid || 0),
    outstandingBalance:
      toNaira(source.outstandingBalance, source.outstandingBalanceKobo) ??
      (source.outstandingBalance || 0),
    totalRepayment: toNaira(source.totalRepayment, source.totalRepaymentKobo) ?? source.totalRepayment,
    totalInterest: toNaira(source.totalInterest, source.totalInterestKobo) ?? source.totalInterest,
    repaymentSchedule: normalizedSchedule ?? source.repaymentSchedule,
  }
}
