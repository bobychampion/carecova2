/**
 * Affordability Engine — computes financial health indicators for admin review.
 * All from self-reported data (no external APIs).
 */

import { getRiskConfig } from '../data/riskConfig'
import { getCategoryForTreatment } from '../data/loanCategories'

function parseNum(val) {
    if (typeof val === 'number' && !isNaN(val)) return val
    if (typeof val === 'string') {
        const n = parseFloat(val.replace(/[^0-9.]/g, ''))
        return isNaN(n) ? 0 : n
    }
    return 0
}

function incomeFromRange(range) {
    const map = { '0-100000': 75000, '100000-500000': 300000, '500000-1000000': 750000, '1000000+': 1500000 }
    return map[range] || 0
}

/**
 * @param {Object} application
 * @returns {{ loanToIncomeRatio, expenseCoverage, disposableIncome, maxRecommendedInstallment,
 *             estimatedInstallment, installmentToIncomePct, affordabilityTag, details }}
 */
export function computeAffordability(application) {
    const config = getRiskConfig()

    const monthlyIncome = parseNum(application.monthlyIncome) || incomeFromRange(application.monthlyIncomeRange)
    const monthlyExpenses = parseNum(application.monthlyExpenses)
    const requestedAmount = parseNum(application.requestedAmount || application.estimatedCost)
    const tenor = application.preferredDuration || 6
    const activeLoansRepayment = parseNum(application.activeLoansMonthlyRepayment)

    const disposableIncome = monthlyIncome - monthlyExpenses
    const loanToIncomeRatio = monthlyIncome > 0 ? requestedAmount / monthlyIncome : Infinity
    const expenseCoverage = monthlyIncome > 0 ? monthlyExpenses / monthlyIncome : 1

    // Estimated monthly installment (principal + interest)
    const totalRepayment = requestedAmount * (1 + config.interestRate * tenor)
    const estimatedInstallment = totalRepayment / tenor
    const totalObligation = estimatedInstallment + activeLoansRepayment

    const maxRecommendedInstallment = monthlyIncome * (config.maxInstallmentToIncomePct / 100)
    const installmentToIncomePct = monthlyIncome > 0 ? Math.round((totalObligation / monthlyIncome) * 100) : 100

    // Affordability tag
    let affordabilityTag = 'Affordable'
    if (installmentToIncomePct > config.maxInstallmentToIncomePct || expenseCoverage >= config.maxExpenseRatio || disposableIncome <= 0) {
        affordabilityTag = 'Not Affordable'
    } else if (installmentToIncomePct > config.warnInstallmentToIncomePct || expenseCoverage > 0.6) {
        affordabilityTag = 'Tight'
    }

    return {
        monthlyIncome,
        monthlyExpenses,
        disposableIncome,
        loanToIncomeRatio: Math.round(loanToIncomeRatio * 100) / 100,
        expenseCoverage: Math.round(expenseCoverage * 100) / 100,
        maxRecommendedInstallment: Math.round(maxRecommendedInstallment),
        estimatedInstallment: Math.round(estimatedInstallment),
        totalObligation: Math.round(totalObligation),
        installmentToIncomePct,
        affordabilityTag,
    }
}

/**
 * Compute document completeness score
 */
export function computeCompleteness(application) {
    const category = getCategoryForTreatment(application.treatmentCategory)
    const requiredDocs = category.requiredDocs || ['treatment_estimate', 'id_document']

    const requiredFields = ['fullName', 'phone', 'state', 'lga', 'city', 'homeAddress',
        'treatmentCategory', 'healthDescription', 'urgency', 'hospitalPreference',
        'employmentType', 'monthlyExpenses', 'requestedAmount', 'repaymentMethod']

    let totalItems = requiredFields.length + requiredDocs.length
    let completedItems = 0
    const missing = []

    // Check required fields
    for (const field of requiredFields) {
        const val = application[field]
        if (val != null && String(val).trim()) {
            completedItems++
        } else {
            missing.push(field.replace(/([A-Z])/g, ' $1').toLowerCase().trim())
        }
    }

    // Check required documents
    for (const docKey of requiredDocs) {
        const doc = application.documents?.[docKey]
        if (doc && doc.fileName) {
            completedItems++
        } else {
            missing.push(docKey.replace(/_/g, ' '))
        }
    }

    // Sector-specific: check if salaried has sector
    if (application.employmentType === 'salaried') {
        totalItems++
        if (application.employmentSector) {
            completedItems++
        } else {
            missing.push('employment sector')
        }
    }

    const score = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

    return { score, totalItems, completedItems, missing }
}

/**
 * Risk flags that drive badge color and queue sorting
 */
export function computeRiskFlags(application) {
    const config = getRiskConfig()
    const affordability = computeAffordability(application)
    const completeness = computeCompleteness(application)
    const category = getCategoryForTreatment(application.treatmentCategory)
    const requestedAmount = parseNum(application.requestedAmount || application.estimatedCost)
    const flags = []

    if (affordability.affordabilityTag === 'Not Affordable') {
        flags.push({ id: 'affordability_risk', label: 'Affordability risk', severity: 'high' })
    } else if (affordability.affordabilityTag === 'Tight') {
        flags.push({ id: 'affordability_risk', label: 'Affordability risk', severity: 'medium' })
    }

    if (completeness.score < 70) {
        flags.push({ id: 'documentation_risk', label: 'Documentation risk', severity: completeness.score < 50 ? 'high' : 'medium' })
    }

    if (application.employmentType === 'salaried' && !application.employmentSector) {
        flags.push({ id: 'employment_clarity_risk', label: 'Employment clarity risk', severity: 'medium' })
    }

    if (requestedAmount > category.maxLoanAmount) {
        flags.push({ id: 'provider_mismatch_risk', label: 'Amount exceeds category cap', severity: 'high' })
    }

    if (requestedAmount > config.largeAmountThreshold) {
        flags.push({ id: 'high_amount_risk', label: 'High amount request', severity: 'medium' })
    }

    return flags
}
