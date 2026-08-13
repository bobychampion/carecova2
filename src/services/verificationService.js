const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const API_ROOT = API_BASE_URL ? `${API_BASE_URL}/api` : ''

async function request(path, options = {}) {
  const res = await fetch(`${API_ROOT}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.message || `Request failed (${res.status})`)
  return body
}

export const verificationService = {
  // Load the application context for this verification token.
  // Returns: { applicantFirstName, monoConnectionStatus, applicationId, ... }
  getVerificationContext: (token) =>
    request(`/loan-applications/financial-verification/${encodeURIComponent(token)}`),

  // Record a funnel analytics event (fire-and-forget; errors are swallowed).
  trackEvent: async (token, eventName, payload = {}) => {
    try {
      await request(`/loan-applications/financial-verification/${encodeURIComponent(token)}/event`, {
        method: 'POST',
        body: JSON.stringify({ eventName, ...payload }),
      })
    } catch {
      // analytics failures must not disrupt the customer journey
    }
  },

  // Exchange the Mono Connect code (from onSuccess callback) for the account ID.
  // Returns: { monoAccountId, monoConnectionStatus }
  completeConnection: (token, code) =>
    request(`/loan-applications/financial-verification/${encodeURIComponent(token)}/complete`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
}
