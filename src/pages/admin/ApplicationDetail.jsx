import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminService } from '../../services/adminService'
import { loanService } from '../../services/loanService'
import { computeAffordability, computeRiskFlags } from '../../utils/affordabilityEngine'
import StatusBadge from '../../components/StatusBadge'

import ApplicantSnapshot from '../../components/admin/ApplicationDetail/ApplicantSnapshot'
import VerificationRisk from '../../components/admin/ApplicationDetail/VerificationRisk'
import DecisionPanel from '../../components/admin/ApplicationDetail/DecisionPanel'

export default function ApplicationDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [loan, setLoan] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function loadLoanDetails() {
            try {
                setLoading(true)
                // Find loan by ID
                const allLoans = await loanService.getAllApplications()
                const found = allLoans.find(l => l.id === id)

                if (!found) {
                    setError('Application not found')
                    return
                }

                // Compute on-the-fly checkers
                const enriched = {
                    ...found,
                    affordability: computeAffordability(found),
                    riskFlags: computeRiskFlags(found)
                }

                setLoan(enriched)
            } catch (err) {
                console.error('Error loading application:', err)
                setError('Failed to load application details')
            } finally {
                setLoading(false)
            }
        }

        // Slight delay to simulate network
        setTimeout(loadLoanDetails, 300)
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
                <VerificationRisk loan={loan} />

                {/* Right Column: Decision Panel */}
                <DecisionPanel
                    loan={loan}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onRequestInfo={handleRequestInfo}
                />
            </div>
        </div>
    )
}
