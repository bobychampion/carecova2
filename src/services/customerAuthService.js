const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const SESSION_KEY = 'carecova_customer_session'

export const customerAuthService = {
  requestOtp: async (phone) => {
    const res = await fetch(`${API_BASE}/api/customers/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.message || 'Failed to send code')
    return data
  },

  verifyOtp: async (phone, code) => {
    const res = await fetch(`${API_BASE}/api/customers/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.message || 'Invalid or expired code')

    const session = {
      token: data.token,
      phone: data.customer?.phone || phone,
      email: data.customer?.email || '',
      fullName: data.customer?.name || '',
      applications: data.applications || [],
      loggedInAt: new Date().toISOString(),
    }
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)) } catch {}
    return { success: true, customer: session }
  },

  getSession: () => {
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      if (!stored) return null
      const session = JSON.parse(stored)
      return session?.loggedInAt ? session : null
    } catch { return null }
  },

  getCurrentCustomer: () => customerAuthService.getSession(),

  isAuthenticated: () => customerAuthService.getSession() !== null,

  logout: () => {
    try { localStorage.removeItem(SESSION_KEY) } catch {}
  },

  // Called after apply — no-op since backend tracks via loan application
  findOrCreateCustomer: (phone, email, fullName) => {
    return { phone, email, fullName }
  },
}
