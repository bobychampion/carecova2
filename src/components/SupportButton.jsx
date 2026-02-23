import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import SupportModal from './SupportModal'
import { MessageCircle } from 'lucide-react'

export default function SupportButton() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  // Extract loan ID from URL if on track page
  const getContext = () => {
    const searchParams = new URLSearchParams(location.search)
    const loanId = searchParams.get('loanId')
    return { loanId, currentPage: location.pathname }
  }

  return (
    <>
      <button
        className="support-button"
        onClick={() => setIsOpen(true)}
        aria-label="Need help?"
      >
        <span className="support-button-icon"><MessageCircle size={24} /></span>
        <span className="support-button-text">Need help?</span>
      </button>
      {isOpen && (
        <SupportModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          context={getContext()}
        />
      )}
    </>
  )
}
