import { loanService } from './loanService'
import { trackingService } from './trackingService'

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
          resolve(session)
        } else {
          reject(new Error('Invalid credentials'))
        }
      }, 500)
    })
  },

  logout: () => {
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

        const STORAGE_KEY = 'carecova_loans'
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loans))

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

        const STORAGE_KEY = 'carecova_loans'
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loans))

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
        const repayment = trackingService.calculateRepaymentSchedule(
          approvedAmount,
          duration
        )

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

        resolve(loan)
      } catch (error) {
        reject(error)
      }
    })
  },
}
