import { useState } from 'react'
import VerificationFAQ from './VerificationFAQ'

export default function ConnectionFailure({ onRetry, onChangeBank }) {
  const [showFAQ, setShowFAQ] = useState(false)

  return (
    <>
      <div className="vfp__status-screen">
        <div className="vfp__status-icon vfp__status-icon--error">⚠️</div>
        <h1 className="vfp__status-heading">We couldn't complete your bank connection</h1>
        <p className="vfp__status-body">
          We couldn't complete the connection. This can happen if your banking credentials are
          incorrect, your bank requires an additional verification step, or the connection was
          interrupted.
        </p>
      </div>

      <div className="vfp__info-section">
        <p className="vfp__info-section-title">Things to check</p>
        <ul className="vfp__info-list">
          <li>
            <span className="icon icon--warn">!</span>
            Make sure your internet banking login details are correct.
          </li>
          <li>
            <span className="icon icon--warn">!</span>
            Check that your banking account is not locked or suspended.
          </li>
          <li>
            <span className="icon icon--warn">!</span>
            Ensure you have a stable internet connection.
          </li>
          <li>
            <span className="icon icon--warn">!</span>
            Keep your phone nearby for any OTP or verification step your bank may send.
          </li>
        </ul>
      </div>

      <div className="vfp__actions">
        <button className="vfp__btn vfp__btn--primary" onClick={onRetry}>
          Try Again
        </button>
        <button className="vfp__btn vfp__btn--secondary" onClick={onChangeBank}>
          Select a Different Bank
        </button>
        <button className="vfp__btn vfp__btn--ghost" onClick={() => setShowFAQ(true)}>
          Get Help
        </button>
      </div>

      {showFAQ && <VerificationFAQ onClose={() => setShowFAQ(false)} />}
    </>
  )
}
