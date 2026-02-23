import { useState } from 'react'

export default function Repayments() {
    // Mock data for repayments
    const [transactions] = useState([
        { id: 'TXN-001', loanId: 'APP-1002', name: 'Ngozi Okonjo', amount: 45000, date: new Date().toISOString(), status: 'Successful', method: 'Direct Debit' },
        { id: 'TXN-002', loanId: 'APP-1005', name: 'Oluwaseun Adeyemi', amount: 82500, date: new Date(Date.now() - 86400000).toISOString(), status: 'Successful', method: 'Salary Deduction' },
        { id: 'TXN-003', loanId: 'APP-1008', name: 'Chioma Eze', amount: 35000, date: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'Failed', method: 'Card' },
    ])

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1>Repayments Log</h1>
                <p>Track incoming installments and collection attempts</p>
            </div>

            <div className="admin-table-container mt-4">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Transaction ID</th>
                            <th>Applicant</th>
                            <th>Amount (₦)</th>
                            <th>Method</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(tx => (
                            <tr key={tx.id}>
                                <td className="font-mono text-sm text-muted">{tx.id}</td>
                                <td>
                                    <div className="font-medium">{tx.name}</div>
                                    <div className="text-xs text-muted">{tx.loanId}</div>
                                </td>
                                <td className="font-bold">{tx.amount.toLocaleString()}</td>
                                <td className="text-sm">{tx.method}</td>
                                <td className="text-sm">{new Date(tx.date).toLocaleDateString()}</td>
                                <td>
                                    <span className={`risk-badge ${tx.status === 'Successful' ? 'risk-badge-low' : 'risk-badge-high'}`}>
                                        {tx.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="button button--secondary text-xs p-1 px-3">View Receipt</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
