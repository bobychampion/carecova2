/**
 * Sales commission: two-stream model (approval + interest at disbursement, repayment bonus on completion).
 * All amounts from config; per-loan overrides supported.
 */

import { getRiskConfig } from '../data/riskConfig'

const COMMISSIONS_KEY = 'carecova_sales_commissions'

function getCommissions() {
  try {
    const stored = localStorage.getItem(COMMISSIONS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveCommissions(list) {
  try {
    localStorage.setItem(COMMISSIONS_KEY, JSON.stringify(list))
  } catch (e) {
    console.error('Error saving commissions:', e)
  }
}

function getOverrides(loan) {
  return loan.commissionOverrides || {}
}

function getPct(loan, key, config) {
  const overrides = getOverrides(loan)
  return overrides[key] ?? config[key] ?? 0
}

/**
 * Create approval commission (2% of approved amount) when loan is credit-approved.
 */
export function createApprovalCommission(loan) {
  if (!loan.assignedTo) return
  const config = getRiskConfig()
  const pct = getPct(loan, 'salesApprovalCommissionPct', config)
  const amount = Math.round((loan.approvedAmount || 0) * pct)
  if (amount <= 0) return

  const list = getCommissions()
  list.push({
    id: `comm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    loanId: loan.id,
    salesUsername: loan.assignedTo,
    type: 'approval',
    amount,
    status: 'available',
    createdAt: new Date().toISOString(),
    unlockedAt: new Date().toISOString(),
  })
  saveCommissions(list)
}

/**
 * Create interest commission (7% of projected interest), locked; unlocked proportionally per repayment.
 */
export function createInterestCommission(loan) {
  if (!loan.assignedTo) return
  const config = getRiskConfig()
  const totalInterest = loan.totalInterest ?? Math.round((loan.totalRepayment || 0) - (loan.approvedAmount || 0))
  if (totalInterest <= 0) return

  const pct = getPct(loan, 'salesInterestCommissionPct', config)
  const amount = Math.round(totalInterest * pct)
  if (amount <= 0) return

  const list = getCommissions()
  list.push({
    id: `comm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    loanId: loan.id,
    salesUsername: loan.assignedTo,
    type: 'interest',
    amount,
    totalProjectedInterest: totalInterest,
    unlockedAmount: 0,
    status: 'locked',
    createdAt: new Date().toISOString(),
  })
  saveCommissions(list)
}

/**
 * On repayment: unlock a proportional slice of the 7% interest commission.
 * interestPortionOfPayment = part of this payment that is interest (e.g. amount * (totalInterest / totalRepayment)).
 */
export function unlockInterestProportional(loan, paymentAmount, totalInterestCollectedSoFar, totalProjectedInterest) {
  if (!loan.assignedTo || !totalProjectedInterest || totalProjectedInterest <= 0) return
  const config = getRiskConfig()
  if ((config.salesInterestUnlockRule || 'proportional') !== 'proportional') return

  const list = getCommissions()
  const interestRecord = list.find(
    (c) => c.loanId === loan.id && c.type === 'interest' && c.status === 'locked'
  )
  if (!interestRecord) return

  const interestPortionOfPayment = Math.round(
    paymentAmount * (totalProjectedInterest / (loan.totalRepayment || 1))
  )
  const totalUnlockedBefore = interestRecord.unlockedAmount || 0
  const maxUnlock = interestRecord.amount - totalUnlockedBefore
  const unlockThisTime = Math.min(
    Math.round((interestPortionOfPayment / totalProjectedInterest) * interestRecord.amount),
    maxUnlock
  )
  if (unlockThisTime <= 0) return

  interestRecord.unlockedAmount = totalUnlockedBefore + unlockThisTime
  if (interestRecord.unlockedAmount >= interestRecord.amount) {
    interestRecord.status = 'available'
    interestRecord.unlockedAt = new Date().toISOString()
  }
  saveCommissions(list)
}

/**
 * On loan completion: unlock 5% of total interest actually collected (repayment bonus).
 */
export function unlockRepaymentBonus(loan) {
  if (!loan.assignedTo) return
  const totalPaid = loan.totalPaid || 0
  const principal = loan.approvedAmount || 0
  const totalInterestCollected = Math.max(0, totalPaid - principal)

  const config = getRiskConfig()
  const pct = getPct(loan, 'salesRepaymentBonusPct', config)
  const amount = Math.round(totalInterestCollected * pct)
  if (amount <= 0) return

  const list = getCommissions()
  list.push({
    id: `comm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    loanId: loan.id,
    salesUsername: loan.assignedTo,
    type: 'repayment_bonus',
    amount,
    status: 'available',
    createdAt: new Date().toISOString(),
    unlockedAt: new Date().toISOString(),
  })
  saveCommissions(list)

  // Also release any remaining locked interest commission to available
  list.forEach((c) => {
    if (c.loanId === loan.id && c.type === 'interest' && c.status === 'locked') {
      c.status = 'available'
      c.unlockedAt = new Date().toISOString()
      c.unlockedAmount = c.amount
    }
  })
  saveCommissions(list)
}

/**
 * Wallet aggregates for a sales user: totalEarned, locked, available, withdrawn.
 */
export function getWalletAggregates(username) {
  const list = getCommissions().filter((c) => c.salesUsername === username)
  let locked = 0
  let available = 0
  let withdrawn = 0

  list.forEach((c) => {
    if (c.status === 'locked') {
      locked += c.amount - (c.unlockedAmount || 0)
      available += c.unlockedAmount || 0
    } else if (c.status === 'available') {
      available += c.type === 'interest' ? (c.unlockedAmount ?? c.amount) : c.amount
    } else if (c.status === 'withdrawn') {
      withdrawn += c.amount
    }
  })

  const totalEarned = list.reduce((s, c) => s + c.amount, 0)
  return { totalEarned, locked, available, withdrawn }
}

/**
 * Move available commission to withdrawn (simulated payout).
 */
export function withdrawCommission(username, amount) {
  const list = getCommissions()
  const available = list.filter((c) => c.salesUsername === username && c.status === 'available')
  let toWithdraw = Math.min(amount, available.reduce((s, c) => s + (c.type === 'interest' ? (c.unlockedAmount ?? c.amount) : c.amount), 0))
  const now = new Date().toISOString()

  for (const c of available) {
    if (toWithdraw <= 0) break
    const amt = c.type === 'interest' ? (c.unlockedAmount ?? c.amount) : c.amount
    const take = Math.min(amt, toWithdraw)
    if (take > 0) {
      c.status = 'withdrawn'
      c.withdrawnAt = now
      toWithdraw -= take
    }
  }
  saveCommissions(list)
  return getWalletAggregates(username)
}

export function getCommissionsForLoan(loanId) {
  return getCommissions().filter((c) => c.loanId === loanId)
}
