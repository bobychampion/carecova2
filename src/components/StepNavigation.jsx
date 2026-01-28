import Button from './Button'

export default function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSave,
  canProceed = true,
  isLoading = false,
}) {
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  return (
    <div className="step-navigation">
      <div className="step-navigation-actions">
        {!isFirstStep && (
          <Button type="button" variant="ghost" onClick={onPrevious}>
            Previous
          </Button>
        )}
        {onSave && (
          <Button type="button" variant="ghost" onClick={onSave}>
            Save & Continue Later
          </Button>
        )}
      </div>
      <div className="step-navigation-primary">
        {isLastStep ? (
          <Button type="submit" variant="primary" disabled={!canProceed || isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Application'}
          </Button>
        ) : (
          <Button type="button" variant="primary" onClick={onNext} disabled={!canProceed}>
            Continue
          </Button>
        )}
      </div>
    </div>
  )
}
