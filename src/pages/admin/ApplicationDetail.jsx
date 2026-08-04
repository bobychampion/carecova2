import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminService } from '../../services/adminService'
import { auditService } from '../../services/auditService'
import { useAuth } from '../../hooks/useAuth'
import { computeAffordability, computeRiskFlags } from '../../utils/affordabilityEngine'
import StatusBadge from '../../components/StatusBadge'
import { getStageLabel } from '../../utils/statusModel'

import ApplicantSnapshot from '../../components/admin/ApplicationDetail/ApplicantSnapshot'
import VerificationRisk from '../../components/admin/ApplicationDetail/VerificationRisk'
import DecisionPanel from '../../components/admin/ApplicationDetail/DecisionPanel'
import SalesDataCollection from '../../components/admin/ApplicationDetail/SalesDataCollection'
import DirectDebitCard from '../../components/admin/DirectDebitCard'
import P2VestCard from '../../components/admin/ApplicationDetail/P2VestCard'
import AiPreScreenCard from '../../components/admin/ApplicationDetail/AiPreScreenCard'
import TransactionAnalysisCard from '../../components/admin/ApplicationDetail/TransactionAnalysisCard'
import MonoAssessmentCard from '../../components/admin/ApplicationDetail/MonoAssessmentCard'
import InlineLoader from '../../components/ui/InlineLoader'
import Modal from '../../components/ui/Modal'
import RequestDocumentsModal from '../../components/admin/ApplicationDetail/RequestDocumentsModal'

export default function ApplicationDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { session } = useAuth()
    const [loading, setLoading] = useState(true)
    const [loan, setLoan] = useState(null)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('review') // review | credit | history
    const [monoInitiating, setMonoInitiating] = useState(false)
    const [monoRefreshing, setMonoRefreshing] = useState(false)
    const [monoFeedbackMessage, setMonoFeedbackMessage] = useState('')
    const [monoFeedbackError, setMonoFeedbackError] = useState('')
    const [feedbackModal, setFeedbackModal] = useState({ open: false, title: '', message: '' })
    const [showRequestDocs, setShowRequestDocs] = useState(false)
    const [providers, setProviders] = useState([])
    const [selectedProviderId, setSelectedProviderId] = useState('')
    const [assigningProvider, setAssigningProvider] = useState(false)
    const [assignProviderError, setAssignProviderError] = useState('')

    const loadLoanDetails = async ({ silent = false } = {}) => {
        try {
            if (!silent) setLoading(true)
            const found = await adminService.getLoanById(id)
            setLoan({
                ...found,
                affordability: computeAffordability(found),
                riskFlags: computeRiskFlags(found),
            })
            setError(null)
        } catch (err) {
            console.error('Error loading application:', err)
            setError('Failed to load application details')
        } finally {
            if (!silent) setLoading(false)
        }
    }

    useEffect(() => {
        // Slight delay to simulate network
        const timer = setTimeout(() => {
            loadLoanDetails()
        }, 300)
        return () => clearTimeout(timer)
    }, [id])

    useEffect(() => {
        if (session?.role === 'admin') {
            adminService.getProviders().then(setProviders).catch(() => {})
        }
    }, [session?.role])

    const handleAssignProvider = async () => {
        if (!selectedProviderId) return
        setAssigningProvider(true)
        setAssignProviderError('')
        try {
            await adminService.assignProviderToLoan(loan.id, selectedProviderId)
            await loadLoanDetails({ silent: true })
            openFeedback('Provider Assigned', 'The provider has been linked to this application.')
            setSelectedProviderId('')
        } catch (err) {
            setAssignProviderError(err.message || 'Failed to assign provider')
        } finally {
            setAssigningProvider(false)
        }
    }

    // Handlers
    const openFeedback = (title, message) => {
        setFeedbackModal({ open: true, title, message })
    }

    const handleApproveStage1 = async (data) => {
        try {
            const updated = await adminService.approveStage1(loan.id, data)
            setLoan({ ...updated, affordability: loan.affordability, riskFlags: loan.riskFlags })
            openFeedback('Stage 1 Approved', 'Application has been moved to credit review.')
        } catch (err) {
            openFeedback('Stage 1 Approval Failed', err.message || 'Error approving Stage 1')
        }
    }

    const handleApprove = async (terms) => {
        try {
            const updated = await adminService.approveLoan(loan.id, terms)
            setLoan({ ...updated, affordability: loan.affordability, riskFlags: loan.riskFlags })
            openFeedback('Application Approved', 'The loan has been approved successfully.')
        } catch (err) {
            openFeedback('Approval Failed', err.message || 'Error approving loan')
        }
    }

    const handleReject = async (reason) => {
        try {
            const updated = await adminService.rejectLoan(loan.id, reason)
            setLoan({ ...updated, affordability: loan.affordability, riskFlags: loan.riskFlags })
            openFeedback('Application Rejected', 'The application has been rejected.')
        } catch (err) {
            openFeedback('Rejection Failed', err.message || 'Error rejecting loan')
        }
    }

    const handleRequestInfo = async (message) => {
        try {
            const updated = await adminService.requestMoreInfo(loan.id, message)
            setLoan({ ...updated, affordability: loan.affordability, riskFlags: loan.riskFlags })
            openFeedback('Request Sent', 'Information request sent successfully to the applicant.')
        } catch (err) {
            openFeedback('Request Failed', err.message || 'Error requesting information')
        }
    }

    const handleInitiateMonoConnect = async () => {
        if (!loan?.id) return

        try {
            setMonoInitiating(true)
            setMonoFeedbackMessage('')
            setMonoFeedbackError('')

            const response = await adminService.initiateMonoConnectForLoan(loan.id, {
                redirectUrl:
                    import.meta.env.VITE_MONO_REDIRECT_URL ||
                    `${window.location.origin}/track`,
            })

            setMonoFeedbackMessage(
                response?.message || 'Mono connect link has been sent to the user email',
            )
            await loadLoanDetails({ silent: true })
        } catch (err) {
            setMonoFeedbackError(err.message || 'Failed to initiate Mono connect')
        } finally {
            setMonoInitiating(false)
        }
    }

    const handleRefreshMonoStatus = async () => {
        try {
            setMonoRefreshing(true)
            await loadLoanDetails({ silent: true })
        } finally {
            setMonoRefreshing(false)
        }
    }

    if (loading) {
        return (
            <div className="admin-page flex items-center justify-center" style={{ minHeight: '100vh' }}>
                <InlineLoader
                    label={`Loading application ${id}…`}
                    subtitle="Fetching loan details, affordability metrics and Mono status"
                />
            </div>
        )
    }
    if (error) return <div className="admin-page"><div className="alert-box alert-error">{error}</div><button className="button button--secondary mt-4" onClick={() => navigate('/admin/applications')}>← Back to Applications</button></div>
    if (!loan) return <div className="admin-page"><div className="alert-box alert-error">Application not found</div><button className="button button--secondary mt-4" onClick={() => navigate('/admin/applications')}>← Back to Applications</button></div>
    const salesCanDoStage1 =
        session?.role === 'sales' &&
        loan.assignedTo === session.username &&
        !(loan.stage1ApprovedBy || loan.stage1ApprovedAt)

    const isSalesOwnedEarly =
        session?.role === 'sales' &&
        loan.assignedTo === session.username &&
        (loan.status === 'pending' || loan.status === 'incomplete')

    return (
        <>
        <div className="admin-page">

            {/* ── Page header ── */}
            <div style={{ marginBottom: '24px' }}>
                <button
                    className="back-link"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: '#2563eb', fontWeight: 600, padding: '0', marginBottom: '12px', display: 'inline-block' }}
                    onClick={() => navigate('/admin/applications')}
                >
                    ← Back to Applications
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                        <h1 style={{ margin: '0 0 6px', fontSize: '1.375rem', fontWeight: 700, color: '#111827' }}>
                            {loan.fullName || loan.patientName || 'Applicant'}
                        </h1>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', fontSize: '0.8125rem', color: '#6b7280' }}>
                            {loan.applicationCode && (
                                <span style={{ fontWeight: 700, color: '#1d4ed8' }}>{loan.applicationCode}</span>
                            )}
                            <span>ID: {loan.id}</span>
                            <span>·</span>
                            <span>Submitted {new Date(loan.submittedAt).toLocaleDateString()} at {new Date(loan.submittedAt).toLocaleTimeString()}</span>
                            {loan.assignedTo && (
                                <>
                                    <span>·</span>
                                    <span>Assigned to <strong style={{ color: '#374151' }}>{loan.assignedTo === session?.username ? 'Me' : loan.assignedTo}</strong></span>
                                </>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <StatusBadge status={loan.status} financingStatus={loan.financing_status} />
                        <span className="stage-pill">{getStageLabel(loan)}</span>
                    </div>
                </div>

                {/* Financing banner */}
                {loan.financing_status && (
                    <div style={{ marginTop: '12px', padding: '10px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '0.8125rem' }}>
                        <span style={{ color: '#6b7280' }}>Financing:</span>
                        <StatusBadge status={loan.status} financingStatus={loan.financing_status} />
                        {loan.reserved_by_financier_id && <span><span style={{ color: '#6b7280' }}>Reserved by</span> {loan.reserved_by_financier_id}</span>}
                        {loan.financing_amount && <span><span style={{ color: '#6b7280' }}>Amount</span> ₦{loan.financing_amount.toLocaleString()}</span>}
                        {loan.financed_at && <span><span style={{ color: '#6b7280' }}>Financed</span> {new Date(loan.financed_at).toLocaleDateString()}</span>}
                    </div>
                )}

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '4px', marginTop: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '0' }}>
                    {[
                        { key: 'review', label: 'Review' },
                        { key: 'credit', label: 'Credit & AI' },
                        { key: 'history', label: 'Audit History' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                padding: '8px 16px', fontSize: '0.875rem', fontWeight: 600,
                                color: activeTab === key ? '#2563eb' : '#6b7280',
                                borderBottom: activeTab === key ? '2px solid #2563eb' : '2px solid transparent',
                                marginBottom: '-2px', borderRadius: '0', transition: 'color 0.15s',
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tab content ── */}
            {activeTab === 'review' ? (
                <div style={{ display: 'grid', gridTemplateColumns: isSalesOwnedEarly ? '1fr' : '3fr 2fr', gap: '24px', alignItems: 'start' }}>
                    {/* Main column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <ApplicantSnapshot loan={loan} onUpdated={() => loadLoanDetails({ silent: true })} />
                        {salesCanDoStage1 ? (
                            <SalesDataCollection
                                loan={loan}
                                onSave={() => {}}
                                onApproveStage1={handleApproveStage1}
                            />
                        ) : (
                            <VerificationRisk
                                loan={loan}
                                onInitiateMonoConnect={handleInitiateMonoConnect}
                                onRefreshMonoStatus={handleRefreshMonoStatus}
                                monoInitiating={monoInitiating}
                                monoRefreshing={monoRefreshing}
                                monoFeedbackMessage={monoFeedbackMessage}
                                monoFeedbackError={monoFeedbackError}
                                onUpdated={(updated) => {
                                    if (updated) {
                                        setLoan({ ...updated, affordability: loan.affordability, riskFlags: loan.riskFlags })
                                    } else {
                                        loadLoanDetails({ silent: true })
                                    }
                                }}
                            />
                        )}
                        {/* DirectDebitCard suspended — keep code, reactivate when needed */}
                    </div>

                    {/* Right panel — decision + docs + provider */}
                    {!isSalesOwnedEarly && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <DecisionPanel
                                loan={loan}
                                session={session}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                onRequestInfo={handleRequestInfo}
                            />

                            <div className="detail-card">
                                <h3 style={{ margin: '0 0 12px', fontSize: '0.9375rem', fontWeight: 600 }}>Documents</h3>
                                {loan.documentRequests?.length > 0 ? (
                                    <div style={{ marginBottom: '12px' }}>
                                        {loan.documentRequests.map((doc) => (
                                            <div key={doc.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.8125rem' }}>
                                                <span style={{ fontSize: '0.9rem' }}>{doc.status === 'uploaded' ? '✅' : '⏳'}</span>
                                                <div style={{ flex: 1 }}>
                                                    <span style={{ fontWeight: 600 }}>{doc.label}</span>
                                                    {doc.note && <span style={{ color: '#6b7280', marginLeft: '6px' }}>— {doc.note}</span>}
                                                </div>
                                                {doc.status === 'uploaded' && doc.fileUrl && (
                                                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontSize: '0.75rem' }}>View</a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ margin: '0 0 12px', color: '#9ca3af', fontSize: '0.8125rem' }}>No documents requested yet.</p>
                                )}
                                <button
                                    onClick={() => setShowRequestDocs(true)}
                                    style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '7px', padding: '7px 14px', color: '#1d4ed8', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', width: '100%' }}
                                >
                                    Request Documents from Applicant
                                </button>
                            </div>

                            {session?.role === 'admin' && (
                                <div className="detail-card">
                                    <h3 style={{ margin: '0 0 4px', fontSize: '0.9375rem', fontWeight: 600 }}>Assign Provider</h3>
                                    {loan.providerName || loan.provider?.name ? (
                                        <p style={{ margin: '0 0 12px', fontSize: '0.8125rem', color: '#6b7280' }}>
                                            Linked: <strong style={{ color: '#111827' }}>{loan.providerName || loan.provider?.name}</strong>
                                        </p>
                                    ) : (
                                        <p style={{ margin: '0 0 12px', fontSize: '0.8125rem', color: '#9ca3af' }}>No provider linked yet.</p>
                                    )}
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <select
                                            value={selectedProviderId}
                                            onChange={(e) => { setSelectedProviderId(e.target.value); setAssignProviderError('') }}
                                            style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.875rem', background: '#fff', outline: 'none' }}
                                        >
                                            <option value="">Select a provider…</option>
                                            {providers.map((p) => (
                                                <option key={p.id || p._id} value={p.id || p._id}>
                                                    {p.name || p.facilityName || p.email}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleAssignProvider}
                                            disabled={!selectedProviderId || assigningProvider}
                                            style={{
                                                padding: '8px 16px', borderRadius: '8px', border: 'none',
                                                background: selectedProviderId ? '#2563eb' : '#e5e7eb',
                                                color: selectedProviderId ? '#fff' : '#9ca3af',
                                                fontWeight: 600, fontSize: '0.875rem',
                                                cursor: selectedProviderId ? 'pointer' : 'not-allowed',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {assigningProvider ? 'Saving…' : 'Assign'}
                                        </button>
                                    </div>
                                    {assignProviderError && (
                                        <p style={{ margin: '8px 0 0', fontSize: '0.8125rem', color: '#dc2626' }}>{assignProviderError}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : activeTab === 'credit' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
                        <AiPreScreenCard
                            loan={loan}
                            onUpdated={(updated) => setLoan({ ...updated, affordability: loan.affordability, riskFlags: loan.riskFlags })}
                        />
                        <MonoAssessmentCard
                            loan={loan}
                            onUpdated={(updated) => {
                                if (updated) setLoan({ ...updated, affordability: loan.affordability, riskFlags: loan.riskFlags })
                                else loadLoanDetails({ silent: true })
                            }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
                        <P2VestCard
                            loan={loan}
                            onUpdated={() => loadLoanDetails({ silent: true })}
                        />
                        <TransactionAnalysisCard
                            loan={loan}
                            onUpdated={(updated) => {
                                if (updated) setLoan({ ...updated, affordability: loan.affordability, riskFlags: loan.riskFlags })
                                else loadLoanDetails({ silent: true })
                            }}
                        />
                    </div>
                </div>
            ) : (
                <div className="detail-card">
                    <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 600 }}>Audit Trail</h3>
                    <AuditTimeline loanId={loan.id} />
                </div>
            )}

        </div>
        <Modal
            isOpen={feedbackModal.open}
            onClose={() => setFeedbackModal(prev => ({ ...prev, open: false }))}
            title={feedbackModal.title}
            size="sm"
            footer={
                <button
                    type="button"
                    className="button button--primary w-full"
                    onClick={() => setFeedbackModal(prev => ({ ...prev, open: false }))}
                >
                    OK
                </button>
            }
        >
            <p className="text-sm text-muted">{feedbackModal.message}</p>
        </Modal>

        {showRequestDocs && (
          <RequestDocumentsModal
            loanId={loan.id}
            applicantEmail={loan.email}
            onClose={() => setShowRequestDocs(false)}
            onSuccess={(updated) => {
              setLoan({ ...updated, affordability: loan.affordability, riskFlags: loan.riskFlags })
              setShowRequestDocs(false)
              openFeedback('Documents Requested', loan.email ? `Upload link sent to ${loan.email}` : 'Upload link generated — no email on file.')
            }}
          />
        )}
        </>
    )
}

function AuditTimeline({ loanId }) {
    const logs = auditService.getForLoan(loanId)

    if (logs.length === 0) return <div className="empty-state p-8 text-center bg-gray-50 border-radius-sm">No recorded activity for this loan ID.</div>

    return (
        <div className="timeline-items p-4">
            {logs.map(log => (
                <div key={log.id} className="timeline-item flex gap-4 mb-6" style={{ borderLeft: '2px solid #e5e7eb', paddingLeft: '1.5rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-6px', top: '0', width: '10px', height: '10px', borderRadius: '50%', background: '#6366f1' }}></div>
                    <div className="timeline-content">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm capitalize">{log.action?.replace('_', ' ') || 'Action'}</span>
                            <span className="text-xs text-muted">by {log.adminName || 'Admin'}</span>
                        </div>
                        <p className="text-sm text-gray-700 italic border-left-large pl-3 py-1" style={{ borderLeft: '3px solid #6366f1' }}>"{log.details || 'No details available'}"</p>
                        <span className="text-xs text-muted block mt-1">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
