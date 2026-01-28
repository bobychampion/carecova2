export default function SupportModal({ isOpen, onClose, context = {} }) {
  if (!isOpen) return null

  const { loanId, currentPage } = context

  const whatsappMessage = loanId
    ? `Hello, I need help with my loan application. Loan ID: ${loanId}`
    : 'Hello, I need help with CareCova.'

  const whatsappUrl = `https://wa.me/2348163471359?text=${encodeURIComponent(whatsappMessage)}`
  const phoneUrl = 'tel:+2348163471359'
  const emailUrl = 'mailto:support@carecova.com?subject=Support Request'

  return (
    <div className="support-modal-overlay" onClick={onClose}>
      <div className="support-modal" onClick={(e) => e.stopPropagation()}>
        <button className="support-modal-close" onClick={onClose}>
          ×
        </button>
        <h2>How can we help you?</h2>
        <p className="support-modal-description">
          Choose your preferred way to reach us
        </p>

        <div className="support-options">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="support-option support-option--whatsapp"
          >
            <div className="support-option-icon">💬</div>
            <div className="support-option-content">
              <h3>WhatsApp</h3>
              <p>Chat with us instantly</p>
              {loanId && <span className="support-context">Loan ID: {loanId}</span>}
            </div>
          </a>

          <a
            href={phoneUrl}
            className="support-option support-option--phone"
          >
            <div className="support-option-icon">📞</div>
            <div className="support-option-content">
              <h3>Phone Call</h3>
              <p>+234 816 347 1359</p>
            </div>
          </a>

          <a
            href={emailUrl}
            className="support-option support-option--email"
          >
            <div className="support-option-icon">✉️</div>
            <div className="support-option-content">
              <h3>Email</h3>
              <p>support@carecova.com</p>
            </div>
          </a>

          <div className="support-option support-option--chat">
            <div className="support-option-icon">💬</div>
            <div className="support-option-content">
              <h3>Live Chat</h3>
              <p>Coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
