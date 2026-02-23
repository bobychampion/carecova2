import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '../../services/adminService'
import StatusBadge from '../../components/StatusBadge'

export default function Dashboard() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [kpis, setKpis] = useState(null)
    const [queues, setQueues] = useState(null)
    const [insights, setInsights] = useState(null)

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true)
                const [kpiData, queueData, insightData] = await Promise.all([
                    adminService.getKPIs(),
                    adminService.getQueues(),
                    adminService.getInsights()
                ])
                setKpis(kpiData)
                setQueues(queueData)
                setInsights(insightData)
            } catch (error) {
                console.error('Error loading dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    if (loading || !kpis || !queues || !insights) {
        return <div className="admin-loading">Loading dashboard metrics...</div>
    }

    return (
        <div className="admin-dashboard-page">
            <div className="admin-page-header">
                <h1>Dashboard</h1>
                <p>Overview of loan applications and operations</p>
            </div>

            <section className="admin-kpi-grid">
                <div className="admin-kpi-card">
                    <div className="kpi-title">New Applications</div>
                    <div className="kpi-value">{kpis.newToday} <span className="kpi-subtext">Today</span></div>
                    <div className="kpi-subtext">({kpis.newWeek} this week)</div>
                </div>
                <div className="admin-kpi-card warning">
                    <div className="kpi-title">Pending Review</div>
                    <div className="kpi-value">{kpis.pending}</div>
                    <div className="kpi-subtext">Requires human action</div>
                </div>
                <div className="admin-kpi-card info">
                    <div className="kpi-title">Awaiting Documents</div>
                    <div className="kpi-value">{kpis.awaitingDocs}</div>
                    <div className="kpi-subtext">Incomplete applications</div>
                </div>
                <div className="admin-kpi-card success">
                    <div className="kpi-title">Ready to Disburse</div>
                    <div className="kpi-value">{kpis.approved}</div>
                    <div className="kpi-subtext">Approved offers</div>
                </div>
                <div className="admin-kpi-card primary">
                    <div className="kpi-title">Active Loans</div>
                    <div className="kpi-value">{kpis.active}</div>
                    <div className="kpi-subtext">Currently repaying</div>
                </div>
                <div className="admin-kpi-card danger">
                    <div className="kpi-title">Overdue Payments</div>
                    <div className="kpi-value">{kpis.overdueCount} <span className="kpi-subtext">loans</span></div>
                    <div className="kpi-subtext">₦{kpis.overdueValue.toLocaleString()} in arrears</div>
                </div>
            </section>

            <div className="dashboard-content-grid">
                <div className="dashboard-main-col">
                    <section className="dashboard-queues">
                        <h2>Priority Queues</h2>

                        <div className="queue-panel">
                            <div className="queue-header">
                                <h3>Needs Review Now</h3>
                                <span className="queue-count">{queues.needsReview.length} items</span>
                            </div>
                            {queues.needsReview.length === 0 ? (
                                <div className="empty-state-small">No applications pending</div>
                            ) : (
                                <div className="queue-list">
                                    {queues.needsReview.map(app => (
                                        <div key={app.id} className="queue-item" onClick={() => navigate(`/admin/applications/${app.id}`)}>
                                            <div className="queue-item-primary">
                                                <span className="queue-item-id">{app.id}</span>
                                                <span className="queue-item-name">{app.fullName || app.patientName}</span>
                                            </div>
                                            <div className="queue-item-secondary">
                                                <span className="queue-item-amount">₦{app.requestedAmount?.toLocaleString()}</span>
                                                <span className="queue-item-time">{new Date(app.submittedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <button className="view-all-btn" onClick={() => navigate('/admin/applications')}>View all pending</button>
                                </div>
                            )}
                        </div>

                        <div className="queue-panel">
                            <div className="queue-header warning">
                                <h3>High Risk Applications</h3>
                                <span className="queue-count">{queues.highRisk.length} items</span>
                            </div>
                            {queues.highRisk.length === 0 ? (
                                <div className="empty-state-small">No high risk pending</div>
                            ) : (
                                <div className="queue-list">
                                    {queues.highRisk.map(app => (
                                        <div key={app.id} className="queue-item" onClick={() => navigate(`/admin/applications/${app.id}`)}>
                                            <div className="queue-item-primary">
                                                <span className="queue-item-name">{app.fullName || app.patientName}</span>
                                                <span className="risk-badge risk-badge-high">Risk: {app.riskScore}</span>
                                            </div>
                                            <div className="queue-item-secondary">
                                                <span className="queue-item-amount">₦{app.requestedAmount?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="queue-panel">
                            <div className="queue-header danger">
                                <h3>Stuck for &gt;48h</h3>
                                <span className="queue-count">{queues.stuck.length} items</span>
                            </div>
                            {queues.stuck.length === 0 ? (
                                <div className="empty-state-small">No stuck applications</div>
                            ) : (
                                <div className="queue-list">
                                    {queues.stuck.map(app => (
                                        <div key={app.id} className="queue-item" onClick={() => navigate(`/admin/applications/${app.id}`)}>
                                            <div className="queue-item-primary">
                                                <span className="queue-item-name">{app.fullName || app.patientName}</span>
                                                <StatusBadge status={app.status} />
                                            </div>
                                            <div className="queue-item-secondary">
                                                <span className="queue-item-time">Since {new Date(app.submittedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <div className="dashboard-side-col">
                    <section className="dashboard-insights">
                        <h2>Operational Insights</h2>

                        <div className="insight-card">
                            <h3>Average Decision Time</h3>
                            <div className="insight-value">{insights.avgDecisionTimeHours} <span className="insight-unit">hours</span></div>
                            <p className="insight-context">Based on {insights.decidedCount} decided applications</p>
                        </div>

                        <div className="insight-card">
                            <h3>Approval Rate</h3>
                            <div className="insight-value">{insights.approvalRate}%</div>
                            <div className="progress-bar-container mt-2">
                                <div className="progress-bar-fill success" style={{ width: `${insights.approvalRate}%` }}></div>
                            </div>
                            <p className="insight-context">{insights.approvedCount} approved out of {insights.decidedCount}</p>
                        </div>

                        <div className="insight-card">
                            <h3>Top Rejection Reasons</h3>
                            {insights.topRejections.length === 0 ? (
                                <p className="insight-context mt-2">No rejections yet</p>
                            ) : (
                                <ul className="rejection-list">
                                    {insights.topRejections.map((rej, idx) => (
                                        <li key={idx}>
                                            <span className="rejection-reason" title={rej.reason}>{rej.reason}</span>
                                            <span className="rejection-count">{rej.count}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
