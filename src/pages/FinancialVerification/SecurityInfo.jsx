import { useState } from 'react'
import VerificationFAQ from './VerificationFAQ'

export default function SecurityInfo({ onContinue }) {
  const [showFAQ, setShowFAQ] = useState(false)

  return (
    <>
      <div className="vfp__step-tag">Before You Continue</div>
      <h1 className="vfp__heading">What You Will Need</h1>
      <p className="vfp__subheading">
        You will be guided to connect your bank account through Mono, a licensed open finance
        platform. Please have the following ready.
      </p>

      <div className="vfp__info-section">
        <p className="vfp__info-section-title">You will need</p>
        <ul className="vfp__info-list">
          <li>
            <span className="icon">🏦</span>
            The bank account you use to receive your income
          </li>
          <li>
            <span className="icon">🔑</span>
            Your mobile or internet banking login details for that account
          </li>
          <li>
            <span className="icon">📱</span>
            Your phone, in case your bank requires additional verification
          </li>
          <li>
            <span className="icon">⏱</span>
            A few minutes to complete the process
          </li>
        </ul>
      </div>

      <div className="vfp__info-section">
        <p className="vfp__info-section-title">Important</p>
        <ul className="vfp__info-list">
          <li>
            <span className="icon icon--warn">🛡</span>
            Your banking credentials are entered securely through Mono. CareCova does not ask
            you to enter or send your banking password, PIN, or OTP to us.
          </li>
          <li>
            <span className="icon icon--warn">🛡</span>
            CareCova will only receive the financial information required for your application
            and will not be able to move money from your bank account through this connection.
          </li>
        </ul>
      </div>

      <div className="vfp__actions">
        <button className="vfp__btn vfp__btn--primary" onClick={onContinue}>
          Continue
        </button>
        <button className="vfp__btn vfp__btn--ghost" onClick={() => setShowFAQ(true)}>
          I have a question
        </button>
      </div>

      {showFAQ && <VerificationFAQ onClose={() => setShowFAQ(false)} />}
    </>
  )
}
