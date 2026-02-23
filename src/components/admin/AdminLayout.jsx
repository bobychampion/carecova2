import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout() {
    const { isAuthenticated, loading, logout } = useAuth()

    if (loading) {
        return <div className="admin-loading">Loading CareCova Admin...</div>
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin" replace />
    }

    return (
        <div className="admin-layout">
            <AdminSidebar onLogout={logout} />
            <div className="admin-content-wrapper">
                <header className="admin-topbar">
                    <div className="admin-topbar-title">Medical Financing Admin</div>
                    <div className="admin-topbar-actions">
                        <span className="admin-user-badge">CA</span>
                        <span>Credit Admin</span>
                    </div>
                </header>
                <main className="admin-main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
