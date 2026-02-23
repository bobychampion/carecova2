/**
 * Medical loan categories — admin-manageable.
 * Each has: max loan amount cap, default tenor, required documents, risk weight.
 */

export const LOAN_CATEGORIES = [
    {
        id: 'outpatient',
        name: 'Outpatient minor care',
        maxLoanAmount: 200000,
        defaultTenor: 3,
        requiredDocs: ['treatment_estimate', 'id_document'],
        riskWeight: 0.8,
        description: 'Minor procedures, consultations, and outpatient treatments',
    },
    {
        id: 'diagnostics',
        name: 'Diagnostics & tests',
        maxLoanAmount: 500000,
        defaultTenor: 3,
        requiredDocs: ['treatment_estimate', 'id_document'],
        riskWeight: 0.85,
        description: 'Lab work, imaging, scans, and comprehensive health screenings',
    },
    {
        id: 'surgery',
        name: 'Surgery',
        maxLoanAmount: 3000000,
        defaultTenor: 12,
        requiredDocs: ['treatment_estimate', 'id_document', 'payslip'],
        riskWeight: 1.2,
        description: 'Elective and non-elective surgical procedures',
    },
    {
        id: 'maternity',
        name: 'Maternity',
        maxLoanAmount: 1500000,
        defaultTenor: 6,
        requiredDocs: ['treatment_estimate', 'id_document', 'payslip'],
        riskWeight: 1.0,
        description: 'Prenatal care, delivery, C-section, and postnatal care',
    },
    {
        id: 'emergency',
        name: 'Emergency',
        maxLoanAmount: 5000000,
        defaultTenor: 12,
        requiredDocs: ['treatment_estimate', 'id_document'],
        riskWeight: 1.5,
        description: 'Accident, trauma, and life-threatening conditions',
    },
    {
        id: 'chronic',
        name: 'Chronic management',
        maxLoanAmount: 2000000,
        defaultTenor: 12,
        requiredDocs: ['treatment_estimate', 'id_document', 'payslip'],
        riskWeight: 1.3,
        description: 'Ongoing treatment for chronic conditions (dialysis, cancer, etc.)',
    },
    {
        id: 'pharmacy',
        name: 'Pharmacy / medication',
        maxLoanAmount: 300000,
        defaultTenor: 3,
        requiredDocs: ['treatment_estimate', 'id_document'],
        riskWeight: 0.7,
        description: 'Prescription medication and pharmaceutical supplies',
    },
    {
        id: 'fertility',
        name: 'IVF & Fertility',
        maxLoanAmount: 3000000,
        defaultTenor: 12,
        requiredDocs: ['treatment_estimate', 'id_document', 'payslip'],
        riskWeight: 1.1,
        description: 'Fertility treatments including IVF cycles',
    },
    {
        id: 'dental',
        name: 'Dental',
        maxLoanAmount: 1000000,
        defaultTenor: 6,
        requiredDocs: ['treatment_estimate', 'id_document'],
        riskWeight: 0.9,
        description: 'Dental procedures including implants, orthodontics',
    },
    {
        id: 'wellness',
        name: 'Wellness & Screening',
        maxLoanAmount: 500000,
        defaultTenor: 3,
        requiredDocs: ['treatment_estimate', 'id_document'],
        riskWeight: 0.7,
        description: 'Preventive health screenings and wellness programs',
    },
]

/**
 * Map treatment category strings (from form) to loan category IDs
 */
export const TREATMENT_TO_CATEGORY = {
    'Surgery': 'surgery',
    'Maternity': 'maternity',
    'Dental': 'dental',
    'Optical': 'diagnostics',
    'Emergency': 'emergency',
    'Chronic care': 'chronic',
    'Lab/Diagnostics': 'diagnostics',
    'IVF & Fertility': 'fertility',
    'Wellness & Screening': 'wellness',
    'Cosmetic & Corrective': 'surgery',
}

export function getCategoryForTreatment(treatmentCategory) {
    const catId = TREATMENT_TO_CATEGORY[treatmentCategory] || 'outpatient'
    return LOAN_CATEGORIES.find(c => c.id === catId) || LOAN_CATEGORIES[0]
}
