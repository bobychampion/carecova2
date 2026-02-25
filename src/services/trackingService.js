import { loanService } from './loanService'

const calculateRepaymentSchedule = (loanAmount, duration, interestRate = 0.025) => {
  const monthlyInterest = interestRate
  const totalAmount = loanAmount * (1 + monthlyInterest * duration)
  const monthlyPayment = totalAmount / duration

  const schedule = []
  let remainingBalance = totalAmount

  for (let i = 1; i <= duration; i++) {
    const dueDate = new Date()
    dueDate.setMonth(dueDate.getMonth() + i)
    const payment = i === duration ? remainingBalance : monthlyPayment
    remainingBalance -= payment

    schedule.push({
      month: i,
      amount: Math.round(payment),
      dueDate: dueDate.toISOString().split('T')[0],
      paid: false,
    })
  }

  return {
    schedule,
    totalAmount: Math.round(totalAmount),
    monthlyPayment: Math.round(monthlyPayment),
  }
}

export const trackingService = {
  trackLoan: async (loanId) => {
    try {
      const loan = await loanService.getApplication(loanId)

      // If loan is approved but doesn't have repayment schedule, calculate it
      if (loan.status === 'approved' && !loan.repaymentSchedule) {
        const repayment = calculateRepaymentSchedule(
          loan.approvedAmount || loan.estimatedCost || loan.requestedAmount,
          loan.preferredDuration || loan.approvedDuration || 6
        )
        loan.repaymentSchedule = repayment.schedule
        loan.totalRepayment = repayment.totalAmount
        loan.monthlyInstallment = repayment.monthlyPayment
      }

      // Calculate outstanding balance
      if (loan.repaymentSchedule) {
        const paidAmount = loan.repaymentSchedule
          .filter((p) => p.paid)
          .reduce((sum, p) => sum + p.amount, 0)
        const totalAmount = loan.repaymentSchedule.reduce(
          (sum, p) => sum + p.amount,
          0
        )
        loan.outstandingBalance = totalAmount - paidAmount
        loan.totalPaid = paidAmount

        // Find next payment
        const nextPayment = loan.repaymentSchedule.find((p) => !p.paid)
        loan.nextPayment = nextPayment
          ? {
              amount: nextPayment.amount,
              dueDate: nextPayment.dueDate,
            }
          : null
      }

      return loan
    } catch (error) {
      throw error
    }
  },

  calculateRepaymentSchedule,
}
