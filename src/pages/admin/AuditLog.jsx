import { useState, useEffect } from 'react'
import { auditService } from '../../services/auditService'

export default function AuditLog() {
    const [logs, setLogs] = useState([])

    useEffect(() => {
        // AuditService fetches from localStorage
        setLogs(auditService.getAll())
    }, [])

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1>Audit Log</h1>
                <p>Immutable history of all administrative actions taken.</p>
            </div>

            <div className="admin-table-container mt-4">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Admin Name</th>
                            <th>Action</th>
                            <th>Target Loan ID</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr><td colSpan="5" className="empty-table">No audit logs found.</td></tr>
                        ) : (
                            logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((log, idx) => (
                                <tr key={idx}>
                                    <td className="text-sm whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="font-medium">{log.adminName}</td>
                                    <td>
                                        <span className="risk-badge risk-badge-low capitalize">
                                            {log.action.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="font-mono text-xs">{log.loanId || '—'}</td>
                                    <td className="text-sm max-w-md truncate">{log.details ? JSON.stringify(log.details) : '—'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
