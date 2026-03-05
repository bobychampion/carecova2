import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '../services/adminService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [session, setSession] = useState(() => adminService.getSession())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const initializedSession = await adminService.initializeSession()
      if (!mounted) return
      setSession(initializedSession)
      setLoading(false)
    }

    init()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const unsubscribe = adminService.subscribeToAuthEvents((event) => {
      if (event.type === 'session_updated') {
        setSession(event.session || null)
        return
      }

      setSession(null)

      if (event.type === 'session_expired' || event.type === 'logged_out') {
        navigate('/admin', { replace: true })
      }
    })

    const syncSessionAcrossTabs = () => {
      setSession(adminService.getSession())
    }

    window.addEventListener('storage', syncSessionAcrossTabs)
    return () => {
      unsubscribe()
      window.removeEventListener('storage', syncSessionAcrossTabs)
    }
  }, [navigate])

  const login = useCallback(async (username, password) => {
    try {
      const nextSession = await adminService.login(username, password)
      setSession(nextSession)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  const logout = useCallback(async () => {
    await adminService.logout()
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      admin: session?.admin || null,
      isAuthenticated: Boolean(session?.loggedIn && session?.accessToken && session?.refreshToken),
      loading,
      login,
      logout,
      refreshSession: adminService.refreshSession,
    }),
    [session, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
