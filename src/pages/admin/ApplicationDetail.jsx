import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminService } from '../../services/adminService'
import { computeAffordability, computeRiskFlags } from '../../utils/affordabilityEngine'
import StatusBadge from '../../components/StatusBadge'

import ApplicantSnapshot from '../../components/admin/ApplicationDetail/ApplicantSnapshot'
import VerificationRisk from '../../components/admin/ApplicationDetail/VerificationRisk'
import DecisionPanel from '../../components/admin/ApplicationDetail/DecisionPanel'
import MonoInformedDecisionModal from '../../components/admin/ApplicationDetail/MonoInformedDecisionModal'

export default function ApplicationDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [loan, setLoan] = useState(null)
    const [error, setError] = useState(null)
    const [monoInitiating, setMonoInitiating] = useState(false)
    const [monoRefreshing, setMonoRefreshing] = useState(false)
    const [monoFeedbackMessage, setMonoFeedbackMessage] = useState('')
    const [monoFeedbackError, setMonoFeedbackError] = useState('')
    const [showMonoInformedDecision, setShowMonoInformedDecision] = useState(false)

    const enrichLoan = (loanPayload) => ({
        ...loanPayload,
        affordability: computeAffordability(loanPayload),
        riskFlags: computeRiskFlags(loanPayload),
    })

    const loadLoanDetails = async ({ silent = false } = {}) => {
        try {
            if (!silent) setLoading(true)
            const found = await adminService.getLoanById(id)
            setLoan(enrichLoan(found))
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

    // Handlers passed to DecisionPanel
    const handleApprove = async (terms) => {
        try {
            const updated = await adminService.approveLoan(loan.id, terms)
            setLoan({ ...updated, affordability: loan.affordability, riskFlags: loan.riskFlags })
            alert('Application approved successfully')
        } catch (err) {
            alert(err.message || 'Error approving loan')
        }
    }

    const handleReject = async (reason) => {
        try {
            const updated = await adminService.rejectLoan(loan.id, reason)
            setLoan({ ...updated, affordability: loan.affordability, riskFlags: loan.riskFlags })
            alert('Application rejected successfully')
        } catch (err) {
            alert(err.message || 'Error rejecting loan')
        }
    }

    const handleRequestInfo = async (message) => {
        try {
            const updated = await adminService.requestMoreInfo(loan.id, message)
            setLoan({ ...updated, affordability: loan.affordability, riskFlags: loan.riskFlags })
            alert('Information request sent successfully')
        } catch (err) {
            alert(err.message || 'Error requesting information')
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

    const handleOpenInformedDecision = () => {
        setShowMonoInformedDecision(true)
    }

    const handleCloseInformedDecision = () => {
        setShowMonoInformedDecision(false)
    }

    if (loading) return <div className="admin-loading">Loading application {id}...</div>
    if (error) return <div className="admin-page"><div className="alert-box alert-error">{error}</div><button className="button button--secondary mt-4" onClick={() => navigate('/admin/applications')}>← Back to Applications</button></div>
    if (!loan) return null

    return (
        <div className="admin-page">
            <div className="admin-page-header flex-between align-center mb-5">
                <div>
                    <button className="back-link mb-2 text-sm text-primary font-bold bg-transparent border-none cursor-pointer" onClick={() => navigate('/admin/applications')}>
                        ← Back to List
                    </button>
                    <div className="flex items-center gap-3">
                        <h1 className="mb-0">Application {loan.id}</h1>
                        <StatusBadge status={loan.status} />
                    </div>
                    <p className="mt-1">Submitted on {new Date(loan.submittedAt).toLocaleDateString()} at {new Date(loan.submittedAt).toLocaleTimeString()}</p>
                </div>
            </div>

            <div className="detail-layout-3col">
                {/* Left Column: Applicant Snapshot */}
                <ApplicantSnapshot loan={loan} />

                {/* Middle Column: Verification & Risk */}
                <VerificationRisk
                    loan={loan}
                    onInitiateMonoConnect={handleInitiateMonoConnect}
                    onRefreshMonoStatus={handleRefreshMonoStatus}
                    monoInitiating={monoInitiating}
                    monoRefreshing={monoRefreshing}
                    monoFeedbackMessage={monoFeedbackMessage}
                    monoFeedbackError={monoFeedbackError}
                    onOpenInformedDecision={handleOpenInformedDecision}
                />

                {/* Right Column: Decision Panel */}
                <DecisionPanel
                    loan={loan}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onRequestInfo={handleRequestInfo}
                />
            </div>

            <MonoInformedDecisionModal
                open={showMonoInformedDecision}
                onClose={handleCloseInformedDecision}
                loan={loan}
            />
        </div>
    )
}
