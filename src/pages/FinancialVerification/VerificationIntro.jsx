export default function VerificationIntro({ applicantFirstName, onContinue }) {
  const greeting = applicantFirstName ? `Hi ${applicantFirstName},` : 'Hi there,'

  return (
    <>
      <div className="vfp__step-tag">Financial Verification</div>
      <h1 className="vfp__heading">Complete Your Financial Verification</h1>
      <p className="vfp__subheading">
        {greeting} you're almost done. To assess your eligibility for CareCova financing,
        we need to securely review your recent financial transactions.
      </p>

      <div className="vfp__info-section">
        <p className="vfp__info-section-title">What we will review</p>
        <ul className="vfp__info-list">
          <li>
            <span className="icon">✓</span>
            Income and regular inflows
          </li>
          <li>
            <span className="icon">✓</span>
            Regular expenses and financial obligations
          </li>
          <li>
            <span className="icon">✓</span>
            Account activity over recent months
          </li>
          <li>
            <span className="icon">✓</span>
            Your ability to repay the requested financing
          </li>
        </ul>
      </div>

      <div className="vfp__security-notice">
        <span className="vfp__security-notice-icon">🔒</span>
        <p className="vfp__security-notice-text">
          Your bank account is only being connected so we can review the financial information
          required to assess your application. CareCova will not be able to move money from
          your account through this connection.
        </p>
      </div>

      <div className="vfp__actions">
        <button className="vfp__btn vfp__btn--primary" onClick={onContinue}>
          Continue
        </button>
      </div>
    </>
  )
}
