import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import ProgressIndicator from '../components/ProgressIndicator'
import StepNavigation from '../components/StepNavigation'
import { loanService } from '../services/loanService'
import { hospitalService } from '../services/hospitalService'
import { applicationService } from '../services/applicationService'
import { validateStep } from '../utils/validation'
import ConsentCheckbox from '../components/ConsentCheckbox'
import SecurityBadge from '../components/SecurityBadge'

const TOTAL_STEPS = 4

export default function Apply() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const draftId = searchParams.get('draftId')

  const [hospitals, setHospitals] = useState([])
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loanId, setLoanId] = useState(null)
  const [errors, setErrors] = useState({})
  const [draftIdState, setDraftIdState] = useState(null)

  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    email: '',
    hospital: '',
    treatmentCategory: '',
    estimatedCost: '',
    preferredDuration: 6,
    consentDataProcessing: false,
    consentTerms: false,
    consentMarketing: false,
  })

  const treatmentCategories = [
    { value: '', label: 'Select Treatment Category' },
    { value: 'IVF & Fertility', label: 'IVF & Fertility' },
    { value: 'Dental & Optical', label: 'Dental & Optical' },
    { value: 'Wellness & Screening', label: 'Wellness & Screening' },
    { value: 'Cosmetic & Corrective', label: 'Cosmetic & Corrective' },
  ]

  useEffect(() => {
    const loadHospitals = async () => {
      try {
        const data = await hospitalService.getAllHospitals()
        setHospitals(data)
      } catch (error) {
        console.error('Error loading hospitals:', error)
      }
    }
    loadHospitals()
  }, [])

  useEffect(() => {
    const loadDraft = async () => {
      if (draftId) {
        try {
          const draft = await applicationService.getDraft(draftId)
          if (draft) {
            setFormData(draft.data)
            setCurrentStep(draft.step)
            setDraftIdState(draft.id)
          }
        } catch (error) {
          console.error('Error loading draft:', error)
        }
      }
    }
    loadDraft()

    // Check for repeat application parameters
    const searchParams = new URLSearchParams(window.location.search)
    const phone = searchParams.get('phone')
    const email = searchParams.get('email')
    const employmentType = searchParams.get('employmentType')

    if (phone || email) {
      // Load previous application data for repeat users
      const loadPreviousData = async () => {
        try {
          const loans = await loanService.getAllApplications()
          const previousLoan = loans.find(
            (l) => (phone && l.phone === phone) || (email && l.email === email)
          )

          if (previousLoan) {
            setFormData((prev) => ({
              ...prev,
              patientName: previousLoan.patientName || prev.patientName,
              phone: previousLoan.phone || prev.phone,
              email: previousLoan.email || prev.email,
              hospital: previousLoan.hospital || prev.hospital,
              treatmentCategory: previousLoan.treatmentCategory || prev.treatmentCategory,
              employmentType: employmentType || prev.employmentType,
            }))
          }
        } catch (error) {
          console.error('Error loading previous data:', error)
        }
      }
      loadPreviousData()
    }
  }, [draftId])

  useEffect(() => {
    // Auto-save draft on step change
    const userId = formData.phone || formData.email
    if (userId && currentStep > 0) {
      applicationService.autoSaveDraft(formData, currentStep, userId)
    }
  }, [currentStep, formData])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validateCurrentStep = () => {
    const stepErrors = validateStep(currentStep, formData)
    setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSaveDraft = async () => {
    const userId = formData.phone || formData.email
    if (!userId) {
      alert('Please enter your phone or email to save your progress')
      return
    }

    try {
      const draft = await applicationService.saveDraft({
        id: draftIdState,
        userId,
        step: currentStep,
        data: formData,
      })
      alert('Your application has been saved. You can resume later.')
      navigate('/')
    } catch (error) {
      alert('Failed to save draft. Please try again.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateCurrentStep()) {
      return
    }

    setLoading(true)

    try {
      const result = await loanService.submitApplication(formData)
      
      // Delete draft if it exists
      if (draftIdState) {
        await applicationService.deleteDraft(draftIdState)
      }

      setLoanId(result.id)
      setSubmitted(true)
    } catch (error) {
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2>Personal Information</h2>
            <p className="step-description">Let's start with your basic details</p>
            <div className="form-grid">
              <Input
                label="Full Name"
                type="text"
                placeholder="e.g. Adekunle Johnson"
                value={formData.patientName}
                onChange={(e) => handleChange('patientName', e.target.value)}
                onBlur={() => {
                  const stepErrors = validateStep(1, formData)
                  setErrors((prev) => ({ ...prev, ...stepErrors }))
                }}
                error={errors.patientName}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="name@provider.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => {
                  const stepErrors = validateStep(1, formData)
                  setErrors((prev) => ({ ...prev, ...stepErrors }))
                }}
                error={errors.email}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="0801 234 5678"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                onBlur={() => {
                  const stepErrors = validateStep(1, formData)
                  setErrors((prev) => ({ ...prev, ...stepErrors }))
                }}
                error={errors.phone}
                required
              />
            </div>
          </div>
        )

      case 2:
        const hospitalOptions = [
          { value: '', label: 'Choose a partner hospital' },
          ...hospitals.map((h) => ({ value: h.name, label: h.name })),
        ]

        return (
          <div className="step-content">
            <h2>Hospital & Treatment Selection</h2>
            <p className="step-description">Select your hospital and treatment type</p>
            <div className="form-grid">
              <Select
                label="Select Hospital"
                options={hospitalOptions}
                value={formData.hospital}
                onChange={(e) => handleChange('hospital', e.target.value)}
                onBlur={() => {
                  const stepErrors = validateStep(2, formData)
                  setErrors((prev) => ({ ...prev, ...stepErrors }))
                }}
                error={errors.hospital}
                required
              />
              <Select
                label="Procedure Category"
                options={treatmentCategories}
                value={formData.treatmentCategory}
                onChange={(e) => handleChange('treatmentCategory', e.target.value)}
                onBlur={() => {
                  const stepErrors = validateStep(2, formData)
                  setErrors((prev) => ({ ...prev, ...stepErrors }))
                }}
                error={errors.treatmentCategory}
                required
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="step-content">
            <h2>Financial Details</h2>
            <p className="step-description">Tell us about your treatment cost and preferred payment plan</p>
            <div className="form-grid">
              <Input
                label="Estimated Cost (₦)"
                type="number"
                placeholder="Amount in Naira"
                min="50000"
                max="5000000"
                value={formData.estimatedCost}
                onChange={(e) => handleChange('estimatedCost', e.target.value)}
                onBlur={() => {
                  const stepErrors = validateStep(3, formData)
                  setErrors((prev) => ({ ...prev, ...stepErrors }))
                }}
                error={errors.estimatedCost}
                required
              />
            </div>
            <div className="tenure-section">
              <label className="tenure-label">Payment Duration</label>
              <div className="tenure">
                {[3, 6, 12].map((months) => (
                  <button
                    key={months}
                    type="button"
                    className={`chip ${formData.preferredDuration === months ? 'active' : ''}`}
                    onClick={() => handleChange('preferredDuration', months)}
                  >
                    {months} Months
                  </button>
                ))}
              </div>
              {errors.preferredDuration && (
                <span className="input-error">{errors.preferredDuration}</span>
              )}
            </div>
          </div>
        )

      case 4:
        const interestRate = 0.025
        const totalRepayment = formData.estimatedCost
          ? parseFloat(formData.estimatedCost) * (1 + interestRate * formData.preferredDuration)
          : 0
        const monthlyInstallment = formData.estimatedCost
          ? totalRepayment / formData.preferredDuration
          : 0

        return (
          <div className="step-content">
            <h2>Review Your Application</h2>
            <p className="step-description">Please review your information before submitting</p>
            <div className="review-section">
              <div className="review-card">
                <h3>Personal Information</h3>
                <div className="review-item">
                  <strong>Name:</strong> {formData.patientName || 'Not provided'}
                </div>
                <div className="review-item">
                  <strong>Email:</strong> {formData.email || 'Not provided'}
                </div>
                <div className="review-item">
                  <strong>Phone:</strong> {formData.phone || 'Not provided'}
                </div>
              </div>

              <div className="review-card">
                <h3>Treatment Details</h3>
                <div className="review-item">
                  <strong>Hospital:</strong> {formData.hospital || 'Not selected'}
                </div>
                <div className="review-item">
                  <strong>Category:</strong> {formData.treatmentCategory || 'Not selected'}
                </div>
              </div>

              <div className="review-card">
                <h3>Financial Summary</h3>
                <div className="review-item">
                  <strong>Estimated Cost:</strong> ₦{formData.estimatedCost ? parseFloat(formData.estimatedCost).toLocaleString() : '0'}
                </div>
                <div className="review-item">
                  <strong>Repayment Period:</strong> {formData.preferredDuration} months
                </div>
                <div className="review-item">
                  <strong>Monthly Payment:</strong> ₦{Math.round(monthlyInstallment).toLocaleString()}
                </div>
                <div className="review-item">
                  <strong>Total Repayment:</strong> ₦{Math.round(totalRepayment).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (submitted) {
    return (
      <>
        <Header />
        <main>
          <section className="section">
            <div className="container">
              <div className="success-message">
                <h2>Application Submitted Successfully!</h2>
                <p>Your application ID is: <strong>{loanId}</strong></p>
                <p>
                  We'll review your application and get back to you within 24-48
                  hours via SMS or email.
                </p>
                <div className="success-actions">
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/track?loanId=${loanId}`)}
                  >
                    Track Your Application
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/')}>
                    Return Home
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    )
  }

  const canProceed = Object.keys(validateStep(currentStep, formData)).length === 0

  return (
    <>
      <Header />
      <main>
        <section className="page-hero">
          <div className="container">
            <h1>Apply for Healthcare Financing</h1>
            <p>Quick and easy healthcare loans for your peace of mind.</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <ProgressIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
            
            <form className="apply-form-wizard" onSubmit={handleSubmit}>
              {renderStep()}

              {errors.submit && (
                <div className="error-message">{errors.submit}</div>
              )}

              <StepNavigation
                currentStep={currentStep}
                totalSteps={TOTAL_STEPS}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onSave={handleSaveDraft}
                canProceed={canProceed}
                isLoading={loading}
              />
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
