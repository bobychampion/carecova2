import { loanService } from './loanService'
import { trackingService } from './trackingService'
import { auditService } from './auditService'

const ADMIN_STORAGE_KEY = 'carecova_admin_session'
const LOAN_STORAGE_KEY = 'carecova_loans'
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const API_ROOT = `${API_BASE_URL}/api`
const TOKEN_EXPIRY_SKEW_SECONDS = 30

const authListeners = new Set()
let refreshInFlight = null

export class AuthSessionError extends Error {
  constructor(message = 'Admin session expired. Please sign in again.') {
    super(message)
    this.name = 'AuthSessionError'
    this.code = 'AUTH_SESSION_EXPIRED'
  }
}

const getStoredSession = () => {
  try {
    const stored = localStorage.getItem(ADMIN_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const emitAuthEvent = (event) => {
  authListeners.forEach((listener) => {
    try {
      listener(event)
    } catch (error) {
      console.error('Auth listener failed:', error)
    }
  })
}

const saveSession = (session) => {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session))
  emitAuthEvent({ type: 'session_updated', session })
  return session
}

const clearSession = (reason = 'logged_out') => {
  const previousSession = getStoredSession()
  localStorage.removeItem(ADMIN_STORAGE_KEY)
  emitAuthEvent({ type: reason, session: previousSession || null })
}

const parseJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length < 2) return null

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const json = atob(padded)
    return JSON.parse(json)
  } catch {
    return null
  }
}

const isTokenExpired = (token) => {
  const payload = parseJwtPayload(token)
  if (!payload?.exp) return true
  const expiresAtMs = payload.exp * 1000
  const nowWithSkewMs = Date.now() + TOKEN_EXPIRY_SKEW_SECONDS * 1000
  return expiresAtMs <= nowWithSkewMs
}

const parseResponseBody = async (response) => {
  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const body = isJson ? await response.json() : await response.text()
  return { isJson, body }
}

const getResponseMessage = (responseBody, isJson, fallback = 'Request failed') => {
  return (
    (isJson &&
      (Array.isArray(responseBody?.message)
        ? responseBody.message.join(', ')
        : responseBody?.message)) ||
    (typeof responseBody === 'string' ? responseBody : fallback)
  )
}

const refreshSession = async () => {
  if (refreshInFlight) {
    return refreshInFlight
  }

  refreshInFlight = (async () => {
    const session = getStoredSession()
    if (!session?.refreshToken) {
      clearSession('session_expired')
      throw new AuthSessionError()
    }

    const response = await fetch(`${API_ROOT}/admins/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    })

    const { isJson, body } = await parseResponseBody(response)
    if (!response.ok) {
      const message = getResponseMessage(body, isJson, 'Session expired')
      clearSession('session_expired')
      throw new AuthSessionError(message)
    }

    const nextSession = saveSession({
      ...session,
      loggedIn: true,
      accessToken: body.accessToken,
      refreshToken: body.refreshToken,
      admin: body.admin || session.admin,
      loginTime: session.loginTime || new Date().toISOString(),
    })

    return nextSession
  })()

  try {
    return await refreshInFlight
  } finally {
    refreshInFlight = null
  }
}

const getValidAccessToken = async () => {
  const session = getStoredSession()
  if (!session?.accessToken) {
    throw new AuthSessionError()
  }

  if (!isTokenExpired(session.accessToken)) {
    return session.accessToken
  }

  const refreshed = await refreshSession()
  if (!refreshed?.accessToken) {
    throw new AuthSessionError()
  }
  return refreshed.accessToken
}

const normalizeLoan = (loan) => {
  if (!loan) return loan
  const monoConnectionStatus =
    loan.monoConnectionStatus ||
    (loan.monoAccountId
      ? 'linked'
      : loan.monoConnectInitiatedAt
        ? 'pending'
        : 'not_started')

  return {
    ...loan,
    id: loan.id || loan._id,
    patientName: loan.patientName || loan.fullName,
    hospital:
      loan.hospital ||
      loan.hospitalName ||
      loan.hospitalDetails?.name ||
      '—',
    estimatedCost: loan.estimatedCost ?? loan.requestedAmount ?? 0,
    monoConnectionStatus,
  }
}

const syncLoansToLocal = (loans) => {
  try {
    localStorage.setItem(LOAN_STORAGE_KEY, JSON.stringify(loans))
  } catch (error) {
    console.error('Error syncing loans to localStorage:', error)
  }
}

const buildQuery = (params = {}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      query.set(key, String(value))
    }
  })
  const text = query.toString()
  return text ? `?${text}` : ''
}

const adminRequest = async (path, options = {}, allowRefreshRetry = true) => {
  const token = await getValidAccessToken()
  const response = await fetch(`${API_ROOT}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })

  const { isJson, body } = await parseResponseBody(response)

  if (!response.ok) {
    const message = getResponseMessage(body, isJson)
    const unauthorized = response.status === 401 || response.status === 403

    if (unauthorized && allowRefreshRetry) {
      try {
        await refreshSession()
        return adminRequest(path, options, false)
      } catch {
        throw new AuthSessionError(message)
      }
    }

    if (unauthorized) {
      clearSession('session_expired')
      throw new AuthSessionError(message)
    }

    throw new Error(message)
  }

  return body
}

export const adminService = {
  login: async (username, password) => {
    try {
      const response = await fetch(`${API_ROOT}/admins/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usernameOrEmail: username,
          password,
        }),
      })

      const { isJson, body } = await parseResponseBody(response)

      if (!response.ok) {
        const message = getResponseMessage(body, isJson, 'Invalid credentials')
        throw new Error(message)
      }

      const session = {
        loggedIn: true,
        loginTime: new Date().toISOString(),
        accessToken: body.accessToken,
        refreshToken: body.refreshToken,
        admin: body.admin,
      }

      saveSession(session)
      auditService.record('login', { adminName: body.admin?.username || username })
      return session
    } catch (error) {
      throw new Error(error.message || 'Invalid credentials')
    }
  },

  logout: async () => {
    const session = getStoredSession()
    auditService.record('logout', { adminName: session?.admin?.username || 'admin' })

    try {
      if (session?.accessToken) {
        await fetch(`${API_ROOT}/admins/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({
            refreshToken: session?.refreshToken,
          }),
        })
      }
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      clearSession('logged_out')
    }
  },

  getSession: () => {
    const session = getStoredSession()
    if (!session || !session.loggedIn || !session.accessToken || !session.refreshToken) {
      return null
    }
    return session
  },

  isAuthenticated: () => {
    return adminService.getSession() !== null
  },

  initializeSession: async () => {
    const session = adminService.getSession()
    if (!session) return null

    if (!isTokenExpired(session.accessToken)) {
      return session
    }

    try {
      return await refreshSession()
    } catch {
      return null
    }
  },

  refreshSession,

  subscribeToAuthEvents: (listener) => {
    authListeners.add(listener)
    return () => authListeners.delete(listener)
  },

  getWallets: async (filters = {}) => {
    const query = buildQuery(filters)
    return adminRequest(`/wallets${query}`)
  },

  getWalletOverview: async (filters = {}) => {
    const query = buildQuery(filters)
    return adminRequest(`/wallets/overview${query}`)
  },

  getOrganizationEssentialWallets: async (filters = {}) => {
    const query = buildQuery(filters)
    return adminRequest(`/wallets/organization/essential${query}`)
  },

  getWalletTransactions: async (filters = {}) => {
    const query = buildQuery(filters)
    return adminRequest(`/wallets/transactions${query}`)
  },

  getWalletStatement: async (walletId, filters = {}) => {
    const query = buildQuery(filters)
    return adminRequest(`/wallets/${walletId}/statement${query}`)
  },

  fundWallet: async (walletId, payload) => {
    return adminRequest(`/wallets/${walletId}/fund`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  fundOrganizationWallet: async (payload) => {
    return adminRequest('/wallets/organization/fund', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  debitWallet: async (walletId, payload) => {
    return adminRequest(`/wallets/${walletId}/debit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  getAllLoans: async (filters = {}) => {
    const query = buildQuery(filters)
    const loans = await adminRequest(`/admin/loan-applications${query}`)
    const normalized = (loans || []).map(normalizeLoan)
    syncLoansToLocal(normalized)
    return normalized
  },

  getLoanById: async (loanId) => {
    const loan = await adminRequest(`/admin/loan-applications/${loanId}`)
    const normalized = normalizeLoan(loan)
    const allLocal = await loanService.getAllApplications()
    const index = allLocal.findIndex((item) => item.id === normalized.id)
    if (index >= 0) allLocal[index] = { ...allLocal[index], ...normalized }
    else allLocal.push(normalized)
    syncLoansToLocal(allLocal)
    return normalized
  },

  initiateMonoConnectForLoan: async (loanId, payload = {}) => {
    return adminRequest(`/admin/loan-applications/${loanId}/mono/connect/initiate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  getMonoInformedDecisionForLoan: async (loanId, payload = {}) => {
    return adminRequest(`/admin/loan-applications/${loanId}/mono/informed-decision`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  // Dashboard KPIs
  getKPIs: async () => {
    const loans = await adminService.getAllLoans()
    const now = new Date()
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)

    const newToday = loans.filter(l => new Date(l.submittedAt) >= oneDayAgo).length
    const newWeek = loans.filter(l => new Date(l.submittedAt) >= sevenDaysAgo).length
    const pending = loans.filter(l => l.status === 'pending').length
    const awaitingDocs = loans.filter(l => l.status === 'pending' && l.documents && Object.values(l.documents).some(d => d === null || d === undefined)).length
    const approved = loans.filter(l => l.status === 'approved').length
    const active = loans.filter(l => l.status === 'active').length

    // Overdue: active loans with unpaid installments past due date
    let overdueCount = 0
    let overdueValue = 0
    loans.filter(l => l.status === 'active' && l.repaymentSchedule).forEach(l => {
      const overdue = l.repaymentSchedule.filter(p => !p.paid && new Date(p.dueDate) < now)
      if (overdue.length > 0) {
        overdueCount++
        overdueValue += overdue.reduce((s, p) => s + p.amount, 0)
      }
    })

    return {
      newToday, newWeek, pending, awaitingDocs, approved, active,
      overdueCount, overdueValue,
      total: loans.length,
    }
  },

  // Dashboard queues
  getQueues: async () => {
    const loans = await adminService.getAllLoans()
    const now = new Date()
    const fortyEightHoursAgo = new Date(now - 48 * 60 * 60 * 1000)

    const needsReview = loans
      .filter(l => l.status === 'pending')
      .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))
      .slice(0, 10)

    const highRisk = loans
      .filter(l => l.status === 'pending' && (l.riskScore ?? 0) > 35)
      .sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0))
      .slice(0, 10)

    const stuck = loans
      .filter(l => l.status === 'pending' && new Date(l.submittedAt) < fortyEightHoursAgo)
      .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))
      .slice(0, 10)

    return { needsReview, highRisk, stuck }
  },

  // Dashboard insights
  getInsights: async () => {
    const loans = await adminService.getAllLoans()

    // Average decision time (for decided loans)
    const decided = loans.filter(l => l.decidedAt && l.submittedAt)
    let avgDecisionTimeHours = 0
    if (decided.length > 0) {
      const totalMs = decided.reduce((s, l) => s + (new Date(l.decidedAt) - new Date(l.submittedAt)), 0)
      avgDecisionTimeHours = Math.round(totalMs / decided.length / (1000 * 60 * 60))
    }

    // Approval rate
    const decidedCount = loans.filter(l => ['approved', 'rejected', 'active', 'completed'].includes(l.status)).length
    const approvedCount = loans.filter(l => ['approved', 'active', 'completed'].includes(l.status)).length
    const approvalRate = decidedCount > 0 ? Math.round((approvedCount / decidedCount) * 100) : 0

    // Top rejection reasons
    const rejectionReasons = {}
    loans.filter(l => l.status === 'rejected' && l.rejectionReason).forEach(l => {
      rejectionReasons[l.rejectionReason] = (rejectionReasons[l.rejectionReason] || 0) + 1
    })
    const topRejections = Object.entries(rejectionReasons)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count }))

    return { avgDecisionTimeHours, approvalRate, topRejections, decidedCount, approvedCount }
  },

  approveLoan: async (loanId, terms) => {
    return new Promise(async (resolve, reject) => {
      try {
        const loans = await loanService.getAllApplications()
        const loanIndex = loans.findIndex((l) => l.id === loanId)

        if (loanIndex === -1) {
          reject(new Error('Loan not found'))
          return
        }

        const loan = loans[loanIndex]
        const approvedAmount = terms.approvedAmount || loan.estimatedCost
        const duration = terms.duration || loan.preferredDuration

        const repayment = trackingService.calculateRepaymentSchedule(
          approvedAmount,
          duration
        )

        loan.status = 'approved'
        const now = new Date().toISOString()
        loan.approvedAt = now
        loan.decidedAt = now
        loan.approvedAmount = approvedAmount
        loan.approvedDuration = duration
        loan.repaymentSchedule = repayment.schedule
        loan.totalRepayment = repayment.totalAmount
        loan.monthlyInstallment = repayment.monthlyPayment
        loan.outstandingBalance = repayment.totalAmount
        loan.owner = 'admin'
        loan.decisionNotes = terms.notes || ''
        loan.decisionTags = terms.tags || []

        const STORAGE_KEY = 'carecova_loans'
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loans))

        auditService.record('approve', {
          loanId,
          adminName: 'admin',
          message: `Approved ₦${approvedAmount.toLocaleString()} for ${duration} months. ${terms.notes || ''}`,
        })

        resolve(loan)
      } catch (error) {
        reject(error)
      }
    })
  },

  rejectLoan: async (loanId, reason) => {
    return new Promise(async (resolve, reject) => {
      try {
        const loans = await loanService.getAllApplications()
        const loanIndex = loans.findIndex((l) => l.id === loanId)

        if (loanIndex === -1) {
          reject(new Error('Loan not found'))
          return
        }

        const loan = loans[loanIndex]
        const now = new Date().toISOString()
        loan.status = 'rejected'
        loan.rejectionReason = reason || 'Application rejected'
        loan.rejectedAt = now
        loan.decidedAt = now
        loan.owner = 'admin'

        const STORAGE_KEY = 'carecova_loans'
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loans))

        auditService.record('reject', {
          loanId,
          adminName: 'admin',
          reason: reason || 'Application rejected',
        })

        resolve(loan)
      } catch (error) {
        reject(error)
      }
    })
  },

  modifyOffer: async (loanId, terms) => {
    return new Promise(async (resolve, reject) => {
      try {
        const loans = await loanService.getAllApplications()
        const loanIndex = loans.findIndex((l) => l.id === loanId)

        if (loanIndex === -1) {
          reject(new Error('Loan not found'))
          return
        }

        const loan = loans[loanIndex]
        if (loan.status !== 'approved') {
          reject(new Error('Only approved offers can be modified'))
          return
        }

        const approvedAmount = terms.approvedAmount ?? loan.approvedAmount
        const duration = terms.duration ?? loan.approvedDuration ?? loan.preferredDuration
        const repayment = trackingService.calculateRepaymentSchedule(approvedAmount, duration)
        const now = new Date().toISOString()

        loan.approvedAmount = approvedAmount
        loan.approvedDuration = duration
        loan.repaymentSchedule = repayment.schedule
        loan.totalRepayment = repayment.totalAmount
        loan.monthlyInstallment = repayment.monthlyPayment
        loan.outstandingBalance = repayment.totalAmount
        loan.modifiedAt = now
        loan.modifyReason = terms.reason ?? null

        const STORAGE_KEY = 'carecova_loans'
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loans))

        auditService.record('modify_offer', {
          loanId,
          adminName: 'admin',
          message: `Modified to ₦${approvedAmount.toLocaleString()} for ${duration} months. ${terms.reason || ''}`,
        })

        resolve(loan)
      } catch (error) {
        reject(error)
      }
    })
  },

  requestMoreInfo: async (loanId, message) => {
    return new Promise(async (resolve, reject) => {
      try {
        const loans = await loanService.getAllApplications()
        const loanIndex = loans.findIndex((l) => l.id === loanId)

        if (loanIndex === -1) {
          reject(new Error('Loan not found'))
          return
        }

        const loan = loans[loanIndex]
        loan.status = 'incomplete'
        loan.infoRequest = message
        loan.infoRequestedAt = new Date().toISOString()
        loan.owner = 'admin'

        const STORAGE_KEY = 'carecova_loans'
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loans))

        auditService.record('request_info', {
          loanId,
          adminName: 'admin',
          message,
        })

        resolve(loan)
      } catch (error) {
        reject(error)
      }
    })
  },

  recordPayment: async (loanId, amount, paymentDate) => {
    return new Promise(async (resolve, reject) => {
      try {
        const loans = await loanService.getAllApplications()
        const loanIndex = loans.findIndex((l) => l.id === loanId)

        if (loanIndex === -1) {
          reject(new Error('Loan not found'))
          return
        }

        const loan = loans[loanIndex]

        if (!loan.repaymentSchedule) {
          reject(new Error('Loan does not have a repayment schedule'))
          return
        }

        const nextUnpaid = loan.repaymentSchedule.find((p) => !p.paid)
        if (!nextUnpaid) {
          reject(new Error('All installments have been paid'))
          return
        }

        nextUnpaid.paid = true
        nextUnpaid.paidDate = paymentDate || new Date().toISOString().split('T')[0]

        const paidAmount = loan.repaymentSchedule
          .filter((p) => p.paid)
          .reduce((sum, p) => sum + p.amount, 0)
        const totalAmount = loan.repaymentSchedule.reduce(
          (sum, p) => sum + p.amount,
          0
        )
        loan.outstandingBalance = totalAmount - paidAmount

        if (loan.outstandingBalance <= 0) {
          loan.status = 'completed'
        } else if (loan.status === 'approved') {
          loan.status = 'active'
        }

        const STORAGE_KEY = 'carecova_loans'
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loans))

        auditService.record('record_payment', {
          loanId,
          adminName: 'admin',
          message: `Recorded ₦${amount.toLocaleString()} payment on ${paymentDate}`,
        })

        resolve(loan)
      } catch (error) {
        reject(error)
      }
    })
  },
}
