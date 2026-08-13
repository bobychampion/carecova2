export default function VerificationFAQ({ onClose }) {
  const faqs = [
    {
      q: 'Why do I need to connect my bank?',
      a: 'CareCova uses your financial transaction information to assess your eligibility and ability to repay the requested financing. This is a standard part of our application review process.',
    },
    {
      q: 'Can CareCova take money from my account?',
      a: 'No. This bank connection is for financial information access only. It does not give CareCova your banking password or allow CareCova to move money from your account.',
    },
    {
      q: "What if I don't remember my banking password?",
      a: "Use your bank's official password or login recovery process. You can find the recovery option in your bank's app or internet banking portal. Do not send your banking credentials to CareCova staff.",
    },
    {
      q: "What if my bank isn't listed?",
      a: "Contact CareCova support so we can help you determine the next available option for completing your financial verification.",
    },
    {
      q: 'Can I use a different account?',
      a: 'If you have another supported account that accurately represents your regular financial activity, contact CareCova support or follow the available account-selection instructions.',
    },
    {
      q: 'Is my information safe?',
      a: 'Your banking credentials are entered through Mono — a licensed open finance platform. CareCova only receives the financial transaction information required to review your application and does not store your banking password or PIN.',
    },
  ]

  return (
    <div className="vfp__overlay" onClick={onClose}>
      <div className="vfp__sheet" onClick={(e) => e.stopPropagation()}>
        <div className="vfp__sheet-handle" />
        <div className="vfp__sheet-header">
          <h2 className="vfp__sheet-title">Frequently Asked Questions</h2>
          <button className="vfp__sheet-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="vfp__faq-list">
          {faqs.map((faq) => (
            <div className="vfp__faq-item" key={faq.q}>
              <p className="vfp__faq-q">{faq.q}</p>
              <p className="vfp__faq-a">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
