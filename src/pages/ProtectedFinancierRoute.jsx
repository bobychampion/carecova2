import { Navigate } from 'react-router-dom'
import { useFinancierAuth } from '../hooks/useFinancierAuth'

export default function ProtectedFinancierRoute({ children }) {
    const { isAuthenticated, loading, session } = useFinancierAuth()

    if (loading) return <div className="loading">Loading...</div>
    if (!isAuthenticated) return <Navigate to="/financier-login" replace />
    if (session?.role !== 'financier') return <Navigate to="/admin" replace />
    return children
}
