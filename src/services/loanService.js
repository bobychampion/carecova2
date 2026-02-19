import { sampleLoans } from '../data/sampleLoans'

const STORAGE_KEY = 'carecova_loans'

const initializeLoans = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleLoans))
    return sampleLoans
  }
  return JSON.parse(stored)
}

const getLoans = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : initializeLoans()
  } catch (error) {
    console.error('Error reading loans from localStorage:', error)
    return initializeLoans()
  }
}

const saveLoans = (loans) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loans))
  } catch (error) {
    console.error('Error saving loans to localStorage:', error)
  }
}

const generateLoanId = () => {
  const loans = getLoans()
  const lastId = loans.length > 0 ? loans[loans.length - 1].id : 'LN-100000'
  const lastNum = parseInt(lastId.split('-')[1])
  return `LN-${String(lastNum + 1).padStart(6, '0')}`
}

export const loanService = {
  submitApplication: async (applicationData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (
            !applicationData.patientName ||
            !applicationData.phone ||
            !applicationData.email ||
            !applicationData.hospital ||
            !applicationData.treatmentCategory ||
            !applicationData.estimatedCost
          ) {
            reject(new Error('All fields are required'))
            return
          }

          const loans = getLoans()
          const newLoan = {
            id: generateLoanId(),
            patientName: applicationData.patientName,
            phone: applicationData.phone,
            email: applicationData.email,
            hospital: applicationData.hospital,
            treatmentCategory: applicationData.treatmentCategory,
            estimatedCost: parseFloat(applicationData.estimatedCost),
            preferredDuration: parseInt(applicationData.preferredDuration),
            employmentType: applicationData.employmentType || 'private',
            employerName: applicationData.employerName || '',
            jobTitle: applicationData.jobTitle || '',
            status: 'pending',
            submittedAt: new Date().toISOString(),
            documents: applicationData.documents || {},
          }

          loans.push(newLoan)
          saveLoans(loans)

          resolve(newLoan)
        } catch (error) {
          reject(error)
        }
      }, 500)
    })
  },

  getApplication: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const loans = getLoans()
        const loan = loans.find((l) => l.id === id)
        if (loan) {
          resolve(loan)
        } else {
          reject(new Error('Application not found'))
        }
      }, 300)
    })
  },

  getAllApplications: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getLoans())
      }, 300)
    })
  },

  acceptOffer: async (loanId, otp) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const loans = getLoans()
        const loan = loans.find((l) => l.id === loanId)
        if (!loan) {
          reject(new Error('Application not found'))
          return
        }
        if (loan.status !== 'approved') {
          reject(new Error('No offer available for this application'))
          return
        }
        const MOCK_OTP = '123456'
        if (otp !== MOCK_OTP) {
          reject(new Error('Invalid OTP. For demo use 123456.'))
          return
        }
        loan.offerAcceptedAt = new Date().toISOString()
        saveLoans(loans)
        resolve(loan)
      }, 300)
    })
  },
}
