import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { verificationService } from '../../services/verificationService'
import VerificationIntro from './VerificationIntro'
import SecurityInfo from './SecurityInfo'
import BankSelector from './BankSelector'
import BankPreparation from './BankPreparation'
import MonoConnectLauncher from './MonoConnectLauncher'
import ConnectionSuccess from './ConnectionSuccess'
import ConnectionFailure from './ConnectionFailure'
import './verification.css'

// Steps:
//   intro → security → bank_select → bank_prep → mono_launch → success | failure
const STEPS = ['intro', 'security', 'bank_select', 'bank_prep', 'mono_launch', 'success', 'failure']

const STEP_LABELS = {
  intro: 'Introduction',
  security: 'Before You Continue',
  bank_select: 'Select Bank',
  bank_prep: 'Get Ready',
  mono_launch: 'Connect Bank',
  success: 'Done',
  failure: 'Try Again',
}

// Linear steps for the progress bar (success/failure branch off at the end)
const LINEAR_STEPS = ['intro', 'security', 'bank_select', 'bank_prep', 'mono_launch']

function progressOf(step) {
  const idx = LINEAR_STEPS.indexOf(step)
  if (idx < 0) return 1
  return (idx + 1) / LINEAR_STEPS.length
}

export default function FinancialVerificationPage() {
  const { token } = useParams()
  const [step, setStep] = useState('intro')
  const [ctx, setCtx] = useState(null)   // { applicantFirstName, monoConnectionStatus, ... }
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedBank, setSelectedBank] = useState(null)
  const [successMeta, setSuccessMeta] = useState(null) // { accountName, linkedAt }
  const attemptCount = useRef(0)

  // Track events for analytics; fire-and-forget.
  const track = (eventName, payload = {}) =>
    verificationService.trackEvent(token, eventName, {
      bank: selectedBank?.id,
      attempt: attemptCount.current,
      ...payload,
    })

  useEffect(() => {
    verificationService.getVerificationContext(token)
      .then((data) => {
        setCtx(data)
        setLoading(false)
        // If already linked, skip straight to success
        if (data.monoConnectionStatus === 'linked') {
          setSuccessMeta({ accountName: data.accountName, linkedAt: data.monoLinkedAt })
          setStep('success')
        }
        track('financial_verification_page_viewed')
      })
      .catch((err) => {
        setLoadError(err.message || 'Unable to load your verification page.')
        setLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // ── Navigation helpers ──────────────────────────────────────────────────
  const goTo = (nextStep) => setStep(nextStep)

  const handleIntroNext = () => {
    goTo('security')
  }

  const handleSecurityNext = () => {
    goTo('bank_select')
  }

  const handleBankSelected = (bank) => {
    setSelectedBank(bank)
    track('bank_selected', { bank: bank.id })
    track('bank_preparation_viewed', { bank: bank.id })
    goTo('bank_prep')
  }

  const handlePrepContinue = () => {
    attemptCount.current += 1
    track('mono_started')
    goTo('mono_launch')
  }

  const handleChangeBank = () => {
    setSelectedBank(null)
    goTo('bank_select')
  }

  const handleMonoSuccess = async (code) => {
    track('mono_completed')
    try {
      const result = await verificationService.completeConnection(token, code)
      setSuccessMeta({
        accountName: result.accountName || result.monoIncomeProfile?.accountName,
        linkedAt: result.monoLinkedAt || Date.now(),
      })
    } catch {
      // The webhook will still fire server-side.
      // Show success UI even if the complete call fails.
      setSuccessMeta({ linkedAt: Date.now() })
    }
    goTo('success')
  }

  const handleMonoClose = () => {
    // User closed the Mono widget without completing.
    track('bank_connection_abandoned')
    goTo('failure')
  }

  const handleMonoFailure = () => {
    track('mono_failed')
    goTo('failure')
  }

  const handleRetry = () => {
    track('bank_connection_retried')
    goTo('bank_prep')
  }

  // ── Loading / error states ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="vfp__fullscreen-center">
        <div className="vfp__status-icon vfp__status-icon--loading" style={{ width: 56, height: 56, fontSize: 28, marginBottom: 16 }}>
          🔒
        </div>
        <h2>Loading your verification page…</h2>
        <p>Please wait a moment.</p>
      </div>
    )
  }

  if (loadError) {
    const isExpired = loadError.toLowerCase().includes('expired') || loadError.toLowerCase().includes('invalid')
    return (
      <div className="vfp__fullscreen-center">
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2>{isExpired ? 'This link has expired' : 'Link not found'}</h2>
        <p style={{ marginBottom: 24 }}>
          {isExpired
            ? 'This verification link is no longer valid. Please contact CareCova to receive a new link.'
            : 'We could not find your verification page. Please check the link in your email or contact CareCova support.'}
        </p>
        <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
          {loadError}
        </p>
      </div>
    )
  }

  const showProgress = !['success', 'failure'].includes(step)
  const progress = progressOf(step)

  const stepIndex = LINEAR_STEPS.indexOf(step)

  return (
    <div className="vfp">
      {/* Header */}
      <header className="vfp__header">
        <span className="vfp__logo">CareCova</span>
        <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', fontWeight: 500 }}>
          Financial Verification
        </span>
      </header>

      {/* Progress */}
      {showProgress && (
        <div className="vfp__progress">
          <p className="vfp__progress-label">
            Step {Math.max(stepIndex + 1, 1)} of {LINEAR_STEPS.length} — {STEP_LABELS[step]}
          </p>
          <div className="vfp__progress-bar">
            <div className="vfp__progress-fill" style={{ width: `${progress * 100}%` }} />
          </div>
          <div className="vfp__steps">
            {LINEAR_STEPS.map((s, i) => (
              <span
                key={s}
                className={
                  'vfp__step-dot' +
                  (i < stepIndex ? ' vfp__step-dot--done' : '') +
                  (i === stepIndex ? ' vfp__step-dot--active' : '')
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="vfp__content">
        {step === 'intro' && (
          <VerificationIntro
            applicantFirstName={ctx?.applicantFirstName}
            onContinue={handleIntroNext}
          />
        )}

        {step === 'security' && (
          <SecurityInfo onContinue={handleSecurityNext} />
        )}

        {step === 'bank_select' && (
          <BankSelector onSelect={handleBankSelected} />
        )}

        {step === 'bank_prep' && selectedBank && (
          <BankPreparation
            bank={selectedBank}
            onContinue={handlePrepContinue}
            onChangeBank={handleChangeBank}
          />
        )}

        {step === 'mono_launch' && (
          <MonoConnectLauncher
            bank={selectedBank}
            token={token}
            customer={{
              name: ctx?.applicantFullName || ctx?.applicantFirstName || 'Applicant',
              email: ctx?.applicantEmail || '',
            }}
            onSuccess={handleMonoSuccess}
            onFailure={handleMonoFailure}
            onClose={handleMonoClose}
          />
        )}

        {step === 'success' && (
          <ConnectionSuccess
            bank={selectedBank}
            accountName={successMeta?.accountName}
            linkedAt={successMeta?.linkedAt}
          />
        )}

        {step === 'failure' && (
          <ConnectionFailure
            onRetry={handleRetry}
            onChangeBank={handleChangeBank}
          />
        )}
      </main>
    </div>
  )
}
