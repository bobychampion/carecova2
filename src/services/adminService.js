import { loanService } from './loanService'
import { trackingService } from './trackingService'
import { auditService } from './auditService'

const ADMIN_STORAGE_KEY = 'carecova_admin_session'
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
}

export const adminService = {
  login: async (username, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (
          username === ADMIN_CREDENTIALS.username &&
          password === ADMIN_CREDENTIALS.password
        ) {
          const session = {
            username,
            loggedIn: true,
            loginTime: new Date().toISOString(),
          }
          localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session))
          auditService.record('login', { adminName: username })
          resolve(session)
        } else {
          reject(new Error('Invalid credentials'))
        }
      }, 500)
    })
  },

  logout: () => {
    auditService.record('logout', { adminName: 'admin' })
    localStorage.removeItem(ADMIN_STORAGE_KEY)
  },

  getSession: () => {
    try {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY)
      if (!stored) return null
      const session = JSON.parse(stored)
      return session.loggedIn ? session : null
    } catch {
      return null
    }
  },

  isAuthenticated: () => {
    return adminService.getSession() !== null
  },

  getAllLoans: async () => {
    return loanService.getAllApplications()
  },

  // Dashboard KPIs
  getKPIs: async () => {
    const loans = await loanService.getAllApplications()
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
    const loans = await loanService.getAllApplications()
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
    const loans = await loanService.getAllApplications()

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
