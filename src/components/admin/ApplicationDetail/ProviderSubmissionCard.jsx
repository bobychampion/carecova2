import { useState, useEffect, useCallback } from 'react'
import { Send, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, Banknote, ChevronDown } from 'lucide-react'
import { adminService } from '../../../services/adminService'

const fmt = (n) => n != null ? `₦${Number(n).toLocaleString()}` : '—'
const fmtDate = (d) => d ? new Date(d).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

function StatusBadge({ status }) {
  const map = {
    approved: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Approved', icon: <CheckCircle size={13} /> },
    declined: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Declined', icon: <XCircle size={13} /> },
    manual_review: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Manual Review', icon: <AlertCircle size={13} /> },
    pending: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Pending', icon: <Clock size={13} /> },
  }
  const s = map[status] || { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb', label: status || '—', icon: null }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '999px', fontSize: '0.8125rem', fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.icon} {s.label}
    </span>
  )
}

function EligibilityBadge({ eligible }) {
  return eligible
    ? <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16a34a' }}>✓ Eligible</span>
    : <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#dc2626' }}>✗ Not Eligible</span>
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '7px 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ fontSize: '0.8125rem', color: '#6b7280', minWidth: '150px' }}>{label}</span>
      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827', textAlign: 'right' }}>{value ?? '—'}</span>
    </div>
  )
}

export default function ProviderSubmissionCard({ loan, onUpdated }) {
  const [eligibleProviders, setEligibleProviders] = useState([])
  const [selectedProviderId, setSelectedProviderId] = useState('')
  const [bvnInput, setBvnInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const providerDecision = loan?.providerDecision
  const hasDecision = !!providerDecision?.status
  const submittedProvider = loan?.lendingProviderId
  const submittedAt = loan?.providerSubmittedAt

  const loadEligibleProviders = useCallback(async () => {
    if (!loan?.id) return
    setLoading(true)
    try {
      const result = await adminService.getEligibleLendingProviders(loan.id)
      const providers = result?.eligibleProviders ?? []
      setEligibleProviders(providers)
      // Auto-select the first eligible provider
      const first = providers.find((p) => p.eligibility?.eligible)
      if (first && !selectedProviderId) setSelectedProviderId(first.id)
    } catch (err) {
      setError(err.message || 'Failed to load eligible providers')
    } finally {
      setLoading(false)
    }
  }, [loan?.id])

  useEffect(() => {
    loadEligibleProviders()
  }, [loadEligibleProviders])

  const handleSubmit = async () => {
    if (!selectedProviderId) return
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      await adminService.submitToLendingProvider(loan.id, selectedProviderId, bvnInput || undefined)
      setSuccess(`Application submitted to ${selectedProviderId.toUpperCase()}. The credit decision will appear here shortly.`)
      setBvnInput('')
      onUpdated?.()
    } catch (err) {
      setError(err.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedProviderInfo = eligibleProviders.find((p) => p.id === selectedProviderId)
  const isEligible = selectedProviderInfo?.eligibility?.eligible ?? false

  return (
    <div className="detail-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#111827' }}>Provider Submission</h3>
          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>Multi-provider lending framework</p>
        </div>
        {hasDecision && <StatusBadge status={providerDecision.status} />}
      </div>

      {/* Provider selector */}
      {!hasDecision && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
            Select Provider
          </label>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '0.8125rem' }}>
              <RefreshCw size={14} className="spin" /> Loading providers…
            </div>
          ) : eligibleProviders.length === 0 ? (
            <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>No providers registered.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {eligibleProviders.map((p) => (
                <label
                  key={p.id}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: `1.5px solid ${selectedProviderId === p.id ? '#2563eb' : '#e2e8f0'}`, background: selectedProviderId === p.id ? '#eff6ff' : '#f9fafb', cursor: 'pointer' }}
                >
                  <input
                    type="radio"
                    name="provider"
                    value={p.id}
                    checked={selectedProviderId === p.id}
                    onChange={() => setSelectedProviderId(p.id)}
                    style={{ marginTop: '2px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>{p.name}</span>
                      <EligibilityBadge eligible={p.eligibility?.eligible} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                      {fmt(p.minLoanAmount)} – {fmt(p.maxLoanAmount)}
                      {p.supportedLoanTypes?.length ? ` · ${p.supportedLoanTypes.join(', ')}` : ''}
                    </div>
                    {!p.eligibility?.eligible && p.eligibility?.missingFields?.length > 0 && (
                      <div style={{ marginTop: '4px', fontSize: '0.75rem', color: '#dc2626' }}>
                        Missing: {p.eligibility.missingFields.join(', ')}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BVN override */}
      {!hasDecision && !loan?.bvn && (
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>
            Patient BVN <span style={{ color: '#9ca3af' }}>(required — enter if not already on record)</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={11}
            placeholder="11-digit BVN"
            value={bvnInput}
            onChange={(e) => setBvnInput(e.target.value.replace(/\D/g, ''))}
            style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '7px', border: '1.5px solid #e2e8f0', fontSize: '0.8125rem', background: '#fff', color: '#111827' }}
          />
        </div>
      )}

      {/* Already submitted info */}
      {submittedProvider && submittedAt && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '12px', fontSize: '0.8125rem', color: '#374151' }}>
          Submitted to <strong>{submittedProvider.toUpperCase()}</strong> on {fmtDate(submittedAt)}
        </div>
      )}

      {/* Decision details */}
      {hasDecision && (
        <div style={{ marginBottom: '16px' }}>
          <InfoRow label="Decision" value={<StatusBadge status={providerDecision.status} />} />
          {providerDecision.creditScore != null && <InfoRow label="Credit Score" value={providerDecision.creditScore} />}
          {providerDecision.riskRating && <InfoRow label="Risk Rating" value={providerDecision.riskRating} />}
          {providerDecision.recommendedAmount != null && <InfoRow label="Recommended Amount" value={fmt(providerDecision.recommendedAmount)} />}
          {providerDecision.recommendedTenure != null && <InfoRow label="Recommended Tenure" value={`${providerDecision.recommendedTenure} months`} />}
          {providerDecision.affordabilityScore != null && <InfoRow label="Affordability Score" value={`${(providerDecision.affordabilityScore * 100).toFixed(0)}%`} />}
          {providerDecision.confidenceScore != null && <InfoRow label="Confidence Score" value={`${(providerDecision.confidenceScore * 100).toFixed(0)}%`} />}
          {providerDecision.decidedAt && <InfoRow label="Decided At" value={fmtDate(providerDecision.decidedAt)} />}
          {providerDecision.declineReasons?.length > 0 && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', marginTop: '8px' }}>
              <p style={{ margin: '0 0 6px', fontSize: '0.8125rem', fontWeight: 600, color: '#991b1b' }}>Decline Reasons</p>
              <ul style={{ margin: 0, paddingLeft: '16px' }}>
                {providerDecision.declineReasons.map((r, i) => (
                  <li key={i} style={{ fontSize: '0.8125rem', color: '#dc2626', marginBottom: '2px' }}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Repayment account */}
      {loan?.providerRepaymentAccountNumber && (
        <div style={{ padding: '10px 12px', borderRadius: '7px', background: '#eff6ff', border: '1px solid #bfdbfe', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
            <Banknote size={13} color="#2563eb" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Repayment Account</span>
          </div>
          <p style={{ margin: '0 0 2px', fontSize: '0.875rem', fontWeight: 700, color: '#111827', letterSpacing: '1px' }}>{loan.providerRepaymentAccountNumber}</p>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#374151' }}>{loan.providerRepaymentAccountName} · {loan.providerRepaymentBank}</p>
        </div>
      )}

      {error && (
        <div style={{ padding: '10px 12px', borderRadius: '7px', background: '#fef2f2', border: '1px solid #fecaca', fontSize: '0.8125rem', color: '#dc2626', marginBottom: '12px' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '10px 12px', borderRadius: '7px', background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '0.8125rem', color: '#16a34a', marginBottom: '12px' }}>
          {success}
        </div>
      )}

      {/* Submit button */}
      {!hasDecision && (
        <button
          onClick={handleSubmit}
          disabled={submitting || !selectedProviderId || !isEligible}
          title={!isEligible ? selectedProviderInfo?.eligibility?.reason : undefined}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '10px', borderRadius: '8px', border: 'none', background: submitting || !isEligible ? '#93c5fd' : 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: submitting || !isEligible ? 'not-allowed' : 'pointer', opacity: !isEligible ? 0.6 : 1 }}
        >
          {submitting ? <RefreshCw size={15} className="spin" /> : <Send size={15} />}
          {submitting ? 'Submitting…' : `Submit to ${selectedProviderInfo?.name ?? 'Provider'}`}
        </button>
      )}

      {hasDecision && (
        <button
          onClick={loadEligibleProviders}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f9fafb', color: '#374151', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}
        >
          <RefreshCw size={13} /> Re-check Eligibility
        </button>
      )}
    </div>
  )
}
