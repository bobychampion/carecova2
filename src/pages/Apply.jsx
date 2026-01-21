import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import { loanService } from '../services/loanService'
import { hospitalService } from '../services/hospitalService'

export default function Apply() {
  const navigate = useNavigate()
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loanId, setLoanId] = useState(null)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    email: '',
    hospital: '',
    treatmentCategory: '',
    estimatedCost: '',
    preferredDuration: 6,
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

  const validateForm = () => {
    const newErrors = {}

    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Full name is required'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[0-9\s\-+()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (!formData.hospital) {
      newErrors.hospital = 'Please select a hospital'
    }
    if (!formData.treatmentCategory) {
      newErrors.treatmentCategory = 'Please select a treatment category'
    }
    if (!formData.estimatedCost) {
      newErrors.estimatedCost = 'Estimated cost is required'
    } else if (parseFloat(formData.estimatedCost) < 50000) {
      newErrors.estimatedCost = 'Minimum amount is ₦50,000'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const result = await loanService.submitApplication(formData)
      setLoanId(result.id)
      setSubmitted(true)
    } catch (error) {
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
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

  const hospitalOptions = [
    { value: '', label: 'Choose a partner hospital' },
    ...hospitals.map((h) => ({ value: h.name, label: h.name })),
  ]

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
          <div className="container apply-grid">
            <div className="apply-info">
              <h2>Application Requirements</h2>
              <ul>
                <li>Valid Nigerian phone number</li>
                <li>Email address</li>
                <li>Treatment estimate from partner hospital</li>
                <li>Minimum loan amount: ₦50,000</li>
              </ul>
              <div className="apply-note">
                <h3>CareCova Promise</h3>
                <p>
                  No collateral required. Transparent repayment schedules. Built
                  for Nigerian families and clinics.
                </p>
              </div>
            </div>

            <form className="apply-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="e.g. Adekunle Johnson"
                  value={formData.patientName}
                  onChange={(e) => handleChange('patientName', e.target.value)}
                  error={errors.patientName}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@provider.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  error={errors.email}
                  required
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="0801 234 5678"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  error={errors.phone}
                  required
                />

                <Select
                  label="Select Hospital"
                  options={hospitalOptions}
                  value={formData.hospital}
                  onChange={(e) => handleChange('hospital', e.target.value)}
                  error={errors.hospital}
                  required
                />

                <Select
                  label="Procedure Category"
                  options={treatmentCategories}
                  value={formData.treatmentCategory}
                  onChange={(e) =>
                    handleChange('treatmentCategory', e.target.value)
                  }
                  error={errors.treatmentCategory}
                  required
                />

                <Input
                  label="Estimated Cost (₦)"
                  type="number"
                  placeholder="Amount in Naira"
                  min="50000"
                  value={formData.estimatedCost}
                  onChange={(e) =>
                    handleChange('estimatedCost', e.target.value)
                  }
                  error={errors.estimatedCost}
                  required
                />
              </div>

              <div className="tenure-section">
                <label className="tenure-label">Payment Duration</label>
                <div className="tenure">
                  <button
                    type="button"
                    className={`chip ${formData.preferredDuration === 3 ? 'active' : ''}`}
                    onClick={() => handleChange('preferredDuration', 3)}
                  >
                    3 Months
                  </button>
                  <button
                    type="button"
                    className={`chip ${formData.preferredDuration === 6 ? 'active' : ''}`}
                    onClick={() => handleChange('preferredDuration', 6)}
                  >
                    6 Months
                  </button>
                  <button
                    type="button"
                    className={`chip ${formData.preferredDuration === 12 ? 'active' : ''}`}
                    onClick={() => handleChange('preferredDuration', 12)}
                  >
                    12 Months
                  </button>
                </div>
              </div>

              {errors.submit && (
                <div className="error-message">{errors.submit}</div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="full-width"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Financing Request'}
              </Button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
