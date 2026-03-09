/**
 * Customer (applicant) auth: phone + OTP login, session, find-or-create customer.
 * MVP: mock OTP (use 123456 for any phone). Session stored in localStorage.
 */

import { mockCustomers } from '../data/mockCustomers'

const CUSTOMERS_KEY = 'carecova_customers'
const SESSION_KEY = 'carecova_customer_session'

// In-memory mock OTP for demo (use code 123456 for any phone)
const pendingOtps = new Map()

function getCustomers() {
  try {
    const stored = localStorage.getItem(CUSTOMERS_KEY)
    if (stored) return JSON.parse(stored)
    return JSON.parse(JSON.stringify(mockCustomers))
  } catch {
    return JSON.parse(JSON.stringify(mockCustomers))
  }
}

function saveCustomers(customers) {
  try {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers))
  } catch (e) {
    console.error('Error saving customers:', e)
  }
}

function normalizePhone(phone) {
  if (!phone || typeof phone !== 'string') return ''
  return phone.replace(/\D/g, '').slice(-10)
}

export const customerAuthService = {
  /**
   * Request OTP for phone. In MVP we always "send" 123456.
   */
  requestOtp: async (phone) => {
    const normalized = normalizePhone(phone)
    if (!normalized || normalized.length < 10) {
      throw new Error('Please enter a valid 10-digit phone number')
    }
    const code = '123456'
    pendingOtps.set(normalized, { code, at: Date.now() })
    return { success: true, message: 'Code sent. For demo use 123456.' }
  },

  /**
   * Verify OTP and sign in. Finds or creates customer by phone.
   */
  verifyOtp: async (phone, code) => {
    const normalized = normalizePhone(phone)
    const pending = pendingOtps.get(normalized)
    const demoCode = '123456'
    if (code !== demoCode && (!pending || pending.code !== code)) {
      throw new Error('Invalid code. For demo use 123456.')
    }
    pendingOtps.delete(normalized)

    const customers = getCustomers()
    let customer = customers.find(
      (c) => normalizePhone(c.phone) === normalized
    )
    if (!customer) {
      customer = {
        id: `cust-${Date.now()}`,
        phone: phone.trim(),
        email: '',
        fullName: '',
        createdAt: new Date().toISOString(),
      }
      customers.push(customer)
      saveCustomers(customers)
    }

    const session = {
      customerId: customer.id,
      phone: customer.phone,
      fullName: customer.fullName,
      email: customer.email,
      loggedInAt: new Date().toISOString(),
    }
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } catch (e) {
      console.error('Error saving session:', e)
    }
    return { success: true, customer: { ...customer } }
  },

  getSession: () => {
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      if (!stored) return null
      const session = JSON.parse(stored)
      return session.loggedInAt ? session : null
    } catch {
      return null
    }
  },

  getCurrentCustomer: () => {
    const session = customerAuthService.getSession()
    if (!session || !session.customerId) return null
    const customers = getCustomers()
    return customers.find((c) => c.id === session.customerId) || null
  },

  isAuthenticated: () => {
    return customerAuthService.getSession() !== null
  },

  logout: () => {
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch (e) {
      console.error('Error clearing session:', e)
    }
  },

  /**
   * Find customer by phone or email; create if not found. Used after apply.
   */
  findOrCreateCustomer: (phone, email, fullName) => {
    const normalized = normalizePhone(phone)
    const customers = getCustomers()
    let customer = customers.find(
      (c) =>
        normalizePhone(c.phone) === normalized ||
        (email && (c.email || '').toLowerCase() === (email || '').toLowerCase().trim())
    )
    if (!customer) {
      customer = {
        id: `cust-${Date.now()}`,
        phone: (phone || '').trim(),
        email: (email || '').trim(),
        fullName: (fullName || '').trim(),
        createdAt: new Date().toISOString(),
      }
      customers.push(customer)
      saveCustomers(customers)
    } else {
      if (email && !customer.email) customer.email = email.trim()
      if (fullName && !customer.fullName) customer.fullName = fullName.trim()
      saveCustomers(customers)
    }
    return customer
  },
}
