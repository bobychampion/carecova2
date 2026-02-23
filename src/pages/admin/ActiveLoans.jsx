import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import StatusBadge from '../../components/StatusBadge'

export default function ActiveLoans() {
    const [loans, setLoans] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchActiveLoans() {
            try {
                const all = await adminService.getAllLoans()
                // Mock filtering active loans for demo purposes
                const active = all.filter(l => l.status === 'active' || l.status === 'approved')
                setLoans(active)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchActiveLoans()
    }, [])

    if (loading) return <div className="admin-loading">Loading active loans...</div>

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1>Active Loans</h1>
                <p>Monitor disbursed loans and repayment health</p>
            </div>

            <div className="admin-table-container mt-4">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Borrower</th>
                            <th>Sector Route</th>
                            <th>Principal (₦)</th>
                            <th>Total Repayment (₦)</th>
                            <th>Tenor</th>
                            <th>Status</th>
                            <th>Next Due Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loans.length === 0 ? (
                            <tr><td colSpan="7" className="empty-table">No active loans found.</td></tr>
                        ) : (
                            loans.map(loan => {
                                const principal = loan.approvedAmount || loan.requestedAmount || 0
                                const tenor = loan.approvedDuration || loan.preferredDuration || 6
                                const total = principal * (1 + (0.025 * tenor))
                                // Mock due date
                                const due = new Date()
                                due.setDate(due.getDate() + 15)

                                return (
                                    <tr key={loan.id} className="clickable-row">
                                        <td>
                                            <div className="font-medium">{loan.fullName || loan.patientName}</div>
                                            <div className="text-xs text-muted font-mono">{loan.id}</div>
                                        </td>
                                        <td className="capitalize">{loan.employmentSector || 'Private'}</td>
                                        <td className="font-medium">{principal.toLocaleString()}</td>
                                        <td>{total.toLocaleString()}</td>
                                        <td>{tenor} months</td>
                                        <td><StatusBadge status={loan.status} /></td>
                                        <td className="text-sm font-medium">{due.toLocaleDateString()}</td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
