/**
 * Lending engine — schedule generation and compounding logic.
 * Single source of truth for interest and repayment schedule; uses riskConfig for rates.
 */

import { getRiskConfig } from '../data/riskConfig'

/**
 * Compute repayment schedule (simple interest: principal * (1 + rate * tenor)).
 * @param {number} principal - Loan amount
 * @param {number} tenorMonths - Duration in months
 * @param {Object} [config] - Optional config override (defaults to getRiskConfig())
 * @returns {{ schedule: Array<{month, amount, dueDate, paid}>, totalAmount: number, totalInterest: number, monthlyPayment: number }}
 */
export function computeSchedule(principal, tenorMonths, config = null) {
  const cfg = config || getRiskConfig()
  const rate = cfg.lendingInterestRatePerMonth ?? cfg.interestRate ?? 0.05
  const totalAmount = principal * (1 + rate * tenorMonths)
  const monthlyPayment = totalAmount / tenorMonths
  const totalInterest = totalAmount - principal

  const schedule = []
  let remainingBalance = totalAmount

  for (let i = 1; i <= tenorMonths; i++) {
    const dueDate = new Date()
    dueDate.setMonth(dueDate.getMonth() + i)
    const payment = i === tenorMonths ? remainingBalance : monthlyPayment
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
    totalInterest: Math.round(totalInterest),
    monthlyPayment: Math.round(monthlyPayment),
  }
}

/**
 * Number of full months between two dates (for compounding).
 */
function fullMonthsBetween(fromDate, toDate) {
  const from = new Date(fromDate)
  const to = new Date(toDate)
  const months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
  return Math.max(0, months)
}

/**
 * Apply compounding to outstanding balance when loan has overdue installments.
 * Rule: after due date + grace period, each month outstanding *= (1 + compoundRate).
 * Does not mutate schedule; sets loan.outstandingBalance and loan.compoundInterest for display.
 * @param {Object} loan - Loan with repaymentSchedule, totalPaid, status
 * @param {Date} [asOfDate] - Date to compute as-of (default: now)
 * @param {Object} [config] - Optional config (defaults to getRiskConfig())
 */
export function applyCompounding(loan, asOfDate = new Date(), config = null) {
  const cfg = config || getRiskConfig()
  if (!cfg.compoundingEnabled || !loan.repaymentSchedule) return

  const now = new Date(asOfDate)
  const unpaid = loan.repaymentSchedule.filter((p) => !p.paid)
  if (unpaid.length === 0) return

  const totalScheduled = loan.repaymentSchedule.reduce((s, p) => s + p.amount, 0)
  const paidAmount = loan.totalPaid || 0
  const baseOutstanding = totalScheduled - paidAmount
  if (baseOutstanding <= 0) return

  const graceDays = cfg.gracePeriodDays ?? 0
  const compoundRate = cfg.compoundMonthlyRate ?? 0.05

  // First overdue due date (earliest unpaid installment)
  const firstUnpaidDue = unpaid.reduce((earliest, p) => {
    const d = new Date(p.dueDate)
    return !earliest || d < earliest ? d : earliest
  }, null)
  if (!firstUnpaidDue) return

  const graceEnd = new Date(firstUnpaidDue)
  graceEnd.setDate(graceEnd.getDate() + graceDays)
  if (now < graceEnd) return

  const monthsOverdue = fullMonthsBetween(graceEnd, now)
  if (monthsOverdue <= 0) return

  const compoundedOutstanding = baseOutstanding * Math.pow(1 + compoundRate, monthsOverdue)
  const compoundInterest = compoundedOutstanding - baseOutstanding

  loan.outstandingBalance = Math.round(compoundedOutstanding)
  loan.compoundInterest = Math.round(compoundInterest)
}
