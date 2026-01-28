/**
 * Payment Service
 * Handles payment processing
 * 
 * Future API endpoint: POST /api/payments/process
 */

const PAYMENT_STORAGE_KEY = 'carecova_payments'

const generateTransactionId = () => {
  return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

const getPayments = () => {
  try {
    const stored = localStorage.getItem(PAYMENT_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error reading payments from localStorage:', error)
    return []
  }
}

const savePayment = (payment) => {
  try {
    const payments = getPayments()
    payments.push(payment)
    localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(payments))
  } catch (error) {
    console.error('Error saving payment to localStorage:', error)
  }
}

export const paymentService = {
  /**
   * Process a payment
   * @param {Object} paymentData - Payment details
   * @param {string} paymentData.loanId - Loan ID
   * @param {number} paymentData.amount - Payment amount
   * @param {string} paymentData.method - Payment method
   * @returns {Promise<Object>} Payment result
   */
  processPayment: async ({ loanId, amount, method }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const transactionId = generateTransactionId()

          const payment = {
            id: transactionId,
            loanId,
            amount,
            method,
            status: 'completed',
            processedAt: new Date().toISOString(),
            receiptUrl: `/receipts/${transactionId}`,
          }

          savePayment(payment)

          // Update loan repayment schedule (simulated)
          // In real implementation, this would be handled by backend
          const loans = JSON.parse(localStorage.getItem('carecova_loans') || '[]')
          const loan = loans.find((l) => l.id === loanId)

          if (loan && loan.repaymentSchedule) {
            const nextUnpaid = loan.repaymentSchedule.find((p) => !p.paid)
            if (nextUnpaid && amount >= nextUnpaid.amount) {
              nextUnpaid.paid = true
              nextUnpaid.paidDate = new Date().toISOString()
              localStorage.setItem('carecova_loans', JSON.stringify(loans))
            }
          }

          resolve(payment)
        } catch (error) {
          reject(error)
        }
      }, 1500)
    })
  },

  /**
   * Get payment history for a loan
   * @param {string} loanId - Loan ID
   * @returns {Promise<Array>} Array of payments
   */
  getPaymentHistory: async (loanId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const payments = getPayments()
        const loanPayments = payments.filter((p) => p.loanId === loanId)
        resolve(loanPayments)
      }, 300)
    })
  },

  /**
   * Get payment receipt
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Object>} Payment receipt
   */
  getReceipt: async (transactionId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const payments = getPayments()
        const payment = payments.find((p) => p.id === transactionId)
        if (payment) {
          resolve(payment)
        } else {
          reject(new Error('Receipt not found'))
        }
      }, 300)
    })
  },
}
