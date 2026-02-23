export default function ProgressIndicator({ currentStep, totalSteps }) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1)
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100

  const labels = [
    'Applicant & Location',
    'Treatment Info',
    'Financial Info',
    'Guarantor (Optional)',
    'Review & Submit',
  ]

  return (
    <div className="progress-indicator">
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="progress-steps">
        {steps.map((step) => (
          <div
            key={step}
            className={`progress-step ${step < currentStep ? 'active' : ''} ${step === currentStep ? 'current' : ''}`}
          >
            <div className="progress-step-number">
              {step < currentStep ? '✓' : step}
            </div>
            <div className="progress-step-label">
              {labels[step - 1] || `Step ${step}`}
            </div>
          </div>
        ))}
      </div>
      <div className="progress-text">
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  )
}
