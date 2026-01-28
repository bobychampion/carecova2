/**
 * Eligibility Service
 * Calculates loan eligibility based on employment type, hospital, and treatment category
 * 
 * Future API endpoint: POST /api/eligibility/check
 */

const ELIGIBILITY_RULES = {
  employment: {
    'employed': { maxAmount: 2000000, multiplier: 1.0 },
    'self-employed': { maxAmount: 1500000, multiplier: 0.8 },
    'business-owner': { maxAmount: 3000000, multiplier: 1.2 },
    'unemployed': { maxAmount: 500000, multiplier: 0.5 },
  },
  treatmentCategory: {
    'IVF & Fertility': { multiplier: 1.0 },
    'Dental & Optical': { multiplier: 0.9 },
    'Wellness & Screening': { multiplier: 0.8 },
    'Cosmetic & Corrective': { multiplier: 0.85 },
  },
  hospital: {
    'premium': { multiplier: 1.1 },
    'standard': { multiplier: 1.0 },
    'basic': { multiplier: 0.9 },
  },
}

const HOSPITAL_TIERS = {
  'Lagos University Teaching Hospital': 'premium',
  'National Hospital Abuja': 'premium',
  'Eko Hospital': 'premium',
  'St. Nicholas Hospital': 'standard',
  'Lagoon Hospital': 'standard',
  'Reddington Hospital': 'standard',
}

export const eligibilityService = {
  /**
   * Check eligibility and calculate estimated loan amount
   * @param {Object} params - Eligibility parameters
   * @param {string} params.employmentType - Employment type
   * @param {string} params.hospital - Hospital name
   * @param {string} params.treatmentCategory - Treatment category
   * @returns {Promise<Object>} Eligibility result
   */
  checkEligibility: async ({ employmentType, hospital, treatmentCategory }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const employment = ELIGIBILITY_RULES.employment[employmentType] || ELIGIBILITY_RULES.employment['employed']
        const treatment = ELIGIBILITY_RULES.treatmentCategory[treatmentCategory] || { multiplier: 1.0 }
        const hospitalTier = HOSPITAL_TIERS[hospital] || 'standard'
        const hospitalMultiplier = ELIGIBILITY_RULES.hospital[hospitalTier].multiplier

        // Calculate base eligibility
        let estimatedAmount = employment.maxAmount

        // Apply multipliers
        estimatedAmount = estimatedAmount * treatment.multiplier * hospitalMultiplier

        // Round to nearest 50,000
        estimatedAmount = Math.round(estimatedAmount / 50000) * 50000

        const result = {
          eligible: true,
          estimatedAmount: Math.min(estimatedAmount, employment.maxAmount),
          maxAmount: employment.maxAmount,
          factors: {
            employment: employmentType,
            hospital: hospitalTier,
            treatment: treatmentCategory,
          },
          message: `Based on your profile, you may qualify for up to ₦${estimatedAmount.toLocaleString()}`,
        }

        resolve(result)
      }, 500)
    })
  },

  /**
   * Get eligibility preview without full details
   * @param {Object} params - Basic eligibility parameters
   * @returns {Promise<Object>} Quick eligibility preview
   */
  getQuickPreview: async ({ employmentType, hospital, treatmentCategory }) => {
    const result = await eligibilityService.checkEligibility({
      employmentType,
      hospital,
      treatmentCategory,
    })

    return {
      eligible: result.eligible,
      estimatedAmount: result.estimatedAmount,
      message: result.message,
    }
  },
}
