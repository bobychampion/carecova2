import { useState, useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import AdminSidebar from './AdminSidebar'
import NotificationBell from '../NotificationBell'
import { Menu, X } from 'lucide-react'

export default function AdminLayout() {
    const { isAuthenticated, session, loading, logout } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false)
    }, [])

    if (loading) {
        return <div className="admin-loading">Loading CareCova Admin...</div>
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin" replace />
    }

    return (
        <div className="admin-layout">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="admin-sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <AdminSidebar
                onLogout={logout}
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="admin-content-wrapper">
                <header className="admin-topbar">
                    <div className="admin-topbar-left">
                        <button
                            className="admin-hamburger"
                            onClick={() => setSidebarOpen(v => !v)}
                            aria-label="Toggle menu"
                        >
                            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                        <div className="admin-topbar-title">Medical Financing Admin</div>
                    </div>
                    <div className="admin-topbar-actions">
                        <NotificationBell notificationsPath="/admin/notifications" />
                        <span className="admin-user-badge">{session?.name?.split(' ').map(n => n[0]).join('')}</span>
                        <span className="admin-topbar-username capitalize">{session?.name} ({session?.role})</span>
                    </div>
                </header>
                <main className="admin-main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
