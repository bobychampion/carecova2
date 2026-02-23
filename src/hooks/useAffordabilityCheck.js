import { useState, useEffect } from 'react';
import { formatNaira, parseMoney } from '../utils/currencyUtils';

const RISK_THRESHOLDS = {
    MAX_AMOUNT_TO_INCOME_RATIO: 4,
    AFFORDABILITY_RATIO_MEDIUM: 0.35
};

export function useAffordabilityCheck(requestedAmount, monthlyIncome, monthlyExpenses, tenorMonths) {
    const [riskAssessment, setRiskAssessment] = useState({
        riskLevel: 'LOW',
        riskReasons: [],
        disposableIncome: 0,
        estimatedInstallment: 0,
        affordabilityRatio: 0
    });

    useEffect(() => {
        // Parse inputs safely
        const amount = parseMoney(requestedAmount) || 0;
        const income = parseMoney(monthlyIncome) || 0;
        const expenses = parseMoney(monthlyExpenses) || 0;
        const months = parseInt(tenorMonths, 10) || 6; // Default to 6 if not provided

        if (amount === 0 || income === 0) {
            setRiskAssessment({
                riskLevel: 'LOW',
                riskReasons: [],
                disposableIncome: income - expenses,
                estimatedInstallment: 0,
                affordabilityRatio: 0
            });
            return;
        }

        const disposableIncome = income - expenses;
        // Rough estimate (principal / months). You could add default mock fees here if wanted.
        const estimatedInstallment = amount / months;
        const affordabilityRatio = estimatedInstallment / income;

        let riskLevel = 'LOW';
        let riskReasons = [];

        // Check High Risk rules
        if (disposableIncome <= 0) {
            riskLevel = 'HIGH';
            riskReasons.push('Disposable income is zero or negative.');
        } else if (amount > income * RISK_THRESHOLDS.MAX_AMOUNT_TO_INCOME_RATIO) {
            riskLevel = 'HIGH';
            riskReasons.push(`Requested amount is > ${RISK_THRESHOLDS.MAX_AMOUNT_TO_INCOME_RATIO}x monthly income.`);
        }
        // Check Medium Risk rules
        else if (affordabilityRatio > RISK_THRESHOLDS.AFFORDABILITY_RATIO_MEDIUM) {
            riskLevel = 'MEDIUM';
            riskReasons.push(`Installment exceeds ${(RISK_THRESHOLDS.AFFORDABILITY_RATIO_MEDIUM * 100).toFixed(0)}% of income.`);
        }

        setRiskAssessment({
            riskLevel,
            riskReasons,
            disposableIncome,
            estimatedInstallment,
            affordabilityRatio
        });
    }, [requestedAmount, monthlyIncome, monthlyExpenses, tenorMonths]);

    return riskAssessment;
}

export function useRiskBadge(riskLevel) {
    switch (riskLevel) {
        case 'HIGH':
            return { label: 'High Risk', className: 'badge-danger' };
        case 'MEDIUM':
            return { label: 'Medium Risk', className: 'badge-warning' };
        case 'LOW':
        default:
            return { label: 'Low Risk', className: 'badge-success' };
    }
}
