export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email is required'
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Invalid email format'
  }
  return ''
}

export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return 'Phone number is required'
  }
  const phoneRegex = /^[0-9\s\-+()]+$/
  if (!phoneRegex.test(phone)) {
    return 'Invalid phone number format'
  }
  if (phone.replace(/\D/g, '').length < 10) {
    return 'Phone number must be at least 10 digits'
  }
  return ''
}

export const validateRequired = (value, fieldName) => {
  if (!value || !value.toString().trim()) {
    return `${fieldName} is required`
  }
  return ''
}

export const validateAmount = (amount) => {
  if (!amount) {
    return 'Estimated cost is required'
  }
  const numAmount = parseFloat(amount)
  if (isNaN(numAmount)) {
    return 'Please enter a valid amount'
  }
  if (numAmount < 50000) {
    return 'Minimum amount is ₦50,000'
  }
  if (numAmount > 5000000) {
    return 'Maximum amount is ₦5,000,000'
  }
  return ''
}

export const validateStep = (step, formData) => {
  const errors = {}

  switch (step) {
    case 1:
      // Personal Information + work details
      const nameError = validateRequired(formData.patientName, 'Full name')
      if (nameError) errors.patientName = nameError

      const emailError = validateEmail(formData.email)
      if (emailError) errors.email = emailError

      const phoneError = validatePhone(formData.phone)
      if (phoneError) errors.phone = phoneError

      if (!formData.employmentType || !['private', 'government'].includes(formData.employmentType)) {
        errors.employmentType = 'Employment sector is required'
      }
      break

    case 2:
      // Hospital & Treatment
      const hospitalError = validateRequired(formData.hospital, 'Hospital')
      if (hospitalError) errors.hospital = hospitalError

      const categoryError = validateRequired(formData.treatmentCategory, 'Treatment category')
      if (categoryError) errors.treatmentCategory = categoryError
      break

    case 3:
      // Financial Details
      const amountError = validateAmount(formData.estimatedCost)
      if (amountError) errors.estimatedCost = amountError

      if (!formData.preferredDuration || ![3, 6, 12].includes(formData.preferredDuration)) {
        errors.preferredDuration = 'Please select a repayment duration'
      }
      break

    case 4:
      // Documents / KYC
      const docs = formData.documents || {}
      if (!docs.treatment_estimate) {
        errors.documents = errors.documents || {}
        errors.documents.treatment_estimate = 'Treatment estimate is required'
      }
      if (!docs.id_document) {
        errors.documents = errors.documents || {}
        errors.documents.id_document = 'ID document is required'
      }
      break

    case 5:
      // Review - validate all fields
      const allErrors = validateStep(1, formData)
      Object.assign(errors, allErrors)
      Object.assign(errors, validateStep(2, formData))
      Object.assign(errors, validateStep(3, formData))
      Object.assign(errors, validateStep(4, formData))

      // Validate consent
      if (!formData.consentDataProcessing) {
        errors.consentDataProcessing = 'Data processing consent is required'
      }
      if (!formData.consentTerms) {
        errors.consentTerms = 'Terms and conditions acceptance is required'
      }
      break

    default:
      break
  }

  return errors
}
