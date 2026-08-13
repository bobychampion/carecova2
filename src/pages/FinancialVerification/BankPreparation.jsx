import { useState } from 'react'

export default function BankPreparation({ bank, onContinue, onChangeBank }) {
  const [showRecovery, setShowRecovery] = useState(false)

  return (
    <>
      <div className="vfp__step-tag">{bank.category}</div>
      <h1 className="vfp__heading">{bank.preparationTitle}</h1>
      <p className="vfp__subheading">{bank.credentialDescription}</p>

      <div className="vfp__info-section">
        <p className="vfp__info-section-title">Before you continue</p>
        <ul className="vfp__instruction-list">
          {bank.instructions.map((instruction, i) => (
            <li key={i}>
              <span className="vfp__instruction-num">{i + 1}</span>
              {instruction}
            </li>
          ))}
        </ul>
      </div>

      <div className="vfp__security-notice">
        <span className="vfp__security-notice-icon">🛡</span>
        <div className="vfp__security-notice-text">
          <strong>Your security matters.</strong> Your banking credentials are entered through
          Mono's secure connection process. Do not send your banking password, PIN, or OTP to
          CareCova staff through WhatsApp, email, SMS, or any other channel.
        </div>
      </div>

      {showRecovery && (
        <div className="vfp__info-section" style={{ borderColor: 'var(--color-warning)', background: 'var(--color-warning-bg)' }}>
          <p className="vfp__info-section-title" style={{ color: 'var(--color-warning)' }}>
            How to recover your login details
          </p>
          <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
            {bank.recoveryHint}
          </p>
        </div>
      )}

      <div className="vfp__actions">
        <button className="vfp__btn vfp__btn--primary" onClick={onContinue}>
          I have my login details — Continue
        </button>
        {!showRecovery && (
          <button
            className="vfp__btn vfp__btn--secondary"
            onClick={() => setShowRecovery(true)}
          >
            I don't remember my login details
          </button>
        )}
        <button className="vfp__btn vfp__btn--ghost" onClick={onChangeBank}>
          Select a different bank
        </button>
      </div>
    </>
  )
}
