import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { financierService } from '../services/financierService'

export default function FinancierLogin() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await financierService.login(username, password)
            navigate('/admin/financing')
        } catch (err) {
            setError(err.message || 'Invalid credentials')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="admin-page flex items-center justify-center" style={{ minHeight: '100vh' }}>
            <div className="card" style={{ maxWidth: '420px', width: '100%' }}>
                <div className="card-header text-center">
                    <h2>Financier Portal</h2>
                    <p className="text-muted">Sign in to access financing applications</p>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="input-label">Financier Username</label>
                            <input
                                type="text"
                                className="input"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="e.g., financier1"
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <input
                                type="password"
                                className="input"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                            />
                        </div>
                        {error && <div className="alert-box alert-error mb-3">{error}</div>}
                        <button type="submit" className="button button--primary w-full" disabled={loading}>
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>
                    <div style={{ marginTop: '16px' }}>
                        <p className="text-xs text-muted">
                            Demo credentials: <code>financier1</code> / <code>financier123</code> or{' '}
                            <code>financier2</code> / <code>financier123</code>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
