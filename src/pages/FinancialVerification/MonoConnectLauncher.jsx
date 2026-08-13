import { useEffect, useRef, useState } from 'react'

const MONO_PUBLIC_KEY = import.meta.env.VITE_MONO_PUBLIC_KEY || ''

export default function MonoConnectLauncher({ bank, token, customer, onSuccess, onFailure, onClose }) {
  const connectRef = useRef(null)
  const [launched, setLaunched] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!MONO_PUBLIC_KEY) {
      setError('Bank connection is temporarily unavailable. Please contact CareCova support.')
      return
    }

    let instance = null
    let cancelled = false

    async function initAndOpen() {
      try {
        const { default: Connect } = await import('@mono.co/connect.js')

        if (cancelled) return

        instance = new Connect({
          key: MONO_PUBLIC_KEY,
          scope: 'auth',
          data: {
            customer: {
              name: customer?.name || 'Applicant',
              email: customer?.email || undefined,
            },
          },

          onSuccess: ({ code }) => {
            if (!cancelled) onSuccess(code)
          },

          onClose: () => {
            if (!cancelled) onClose()
          },

          onEvent: () => {
            // analytics are handled by verificationService.trackEvent in the page controller
          },
        })

        connectRef.current = instance
        instance.setup()
        instance.open()
        setLaunched(true)
      } catch (err) {
        if (!cancelled) {
          setError('Could not open the bank connection widget. Please try again.')
          onFailure()
        }
      }
    }

    initAndOpen()

    return () => {
      cancelled = true
      // Mono Connect does not expose a destroy/cleanup method in v2.
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) {
    return (
      <div className="vfp__status-screen">
        <div className="vfp__status-icon vfp__status-icon--error">⚠️</div>
        <h2 className="vfp__status-heading">Connection Unavailable</h2>
        <p className="vfp__status-body">{error}</p>
      </div>
    )
  }

  return (
    <div className="vfp__status-screen">
      <div className="vfp__status-icon vfp__status-icon--loading">🏦</div>
      <h2 className="vfp__status-heading">
        {launched ? 'Complete verification in the window above' : 'Opening bank connection…'}
      </h2>
      <p className="vfp__status-body">
        {bank ? `Connecting to ${bank.name}.` : 'Connecting your bank.'} Enter your banking
        details in the secure Mono window. Your credentials are not shared with CareCova.
      </p>
      {launched && (
        <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', marginTop: 8 }}>
          If the window closed before you finished, tap the button below.
        </p>
      )}
      {launched && (
        <button
          className="vfp__btn vfp__btn--secondary"
          style={{ marginTop: 16, width: 'auto', padding: '12px 24px' }}
          onClick={() => connectRef.current?.open()}
        >
          Reopen Connection Window
        </button>
      )}
    </div>
  )
}
