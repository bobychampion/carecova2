import { useState, useEffect } from 'react'
import { financierService } from '../services/financierService'

export const useFinancierAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState(null)

    useEffect(() => {
        const s = financierService.getSession()
        setSession(s)
        setIsAuthenticated(financierService.isAuthenticated())
        setLoading(false)
    }, [])

    const login = async (username, password) => {
        try {
            const s = await financierService.login(username, password)
            setSession(s)
            setIsAuthenticated(true)
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    const logout = () => {
        financierService.logout()
        setSession(null)
        setIsAuthenticated(false)
    }

    return {
        isAuthenticated,
        session,
        loading,
        login,
        logout,
    }
}
