import { useState, useEffect } from 'react'
import { customerAuthService } from '../services/customerAuthService'

export function useCustomerAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState(null)

  useEffect(() => {
    const check = () => {
      const ok = customerAuthService.isAuthenticated()
      setIsAuthenticated(ok)
      setCustomer(ok ? customerAuthService.getCurrentCustomer() : null)
      setLoading(false)
    }
    check()
  }, [])

  const loginWithOtp = async (phone, code) => {
    try {
      const result = await customerAuthService.verifyOtp(phone, code)
      setIsAuthenticated(true)
      setCustomer(result.customer)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const requestOtp = async (phone) => {
    try {
      await customerAuthService.requestOtp(phone)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const logout = () => {
    customerAuthService.logout()
    setIsAuthenticated(false)
    setCustomer(null)
  }

  return {
    isAuthenticated,
    customer,
    loading,
    loginWithOtp,
    requestOtp,
    logout,
  }
}
