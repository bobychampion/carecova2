import { useState } from 'react'
import { adminService } from '../../../services/adminService'

const fmtNaira = (n) =>
  n != null && !Number.isNaN(Number(n)) ? `₦${Number(n).toLocaleString()}` : '—'

const fmtPct = (n) =>
  n != null ? `${typeof n === 'number' && n < 1 ? Math.round(n * 100) : Math.round(n)}%` : '—'

const RISK_META = {
  LOW: { color: '#059669', bg: '#dcfce7', label: 'Low Risk' },
  MEDIUM: { color: '#d97706', bg: '#fef3c7', label: 'Medium Risk' },
  HIGH: { color: '#dc2626', bg: '#fee2e2', label: 'High Risk' },
}

function InfoRow({ label, value, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: mono ? '#2563eb' : '#111827' }}>{value}</span>
    </div>
  )
}

export default function MonoAssessmentCard({ loan, onUpdated }) {
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState('')

  const isLinked = loan.monoConnectionStatus === 'linked'
  const snapshot = loan.monoAssessmentSnapshot
  const cwCache = loan.monoCreditworthinessCache
  const incomeProfile = loan.monoIncomeProfile

  // Parse creditworthiness data from stored cache
  const cwData = cwCache && cwCache.status === 'success'
    ? (cwCache.data ?? cwCache)
    : null
  const cwSummary = cwData?.summary ?? {}
  const creditScore = cwData?.credit_score ?? loan.monoCreditScore ?? snapshot?.creditScore
  const riskRating = cwData?.risk_rating ?? loan.monoRiskRating ?? snapshot?.riskRating
  const canAfford = cwData?.can_afford ?? cwSummary?.can_afford ?? loan.monoCanAfford ?? snapshot?.canAfford
  const totalDebt = cwData?.total_debt ?? cwSummary?.total_debt ?? loan.monoTotalExistingDebt ?? snapshot?.totalExistingDebt
  const dti = cwData?.debt_to_income_ratio ?? cwSummary?.debt_to_income_ratio ?? loan.monoTotalDebtToIncomeRatio ?? snapshot?.totalDebtToIncomeRatio
  const cwFetchedAt = cwCache?.fetchedAt ? new Date(cwCache.fetchedAt).toLocaleString() : null

  const riskMeta = riskRating ? (RISK_META[String(riskRating).toUpperCase()] ?? null) : null

  // Income data: prefer incomeProfile > snapshot
  const monthlyIncome = incomeProfile?.monthlyIncome ?? snapshot?.monthlyIncome ?? snapshot?.averageMonthlyIncome
  const employer = incomeProfile?.employer ?? snapshot?.employer
  const stability = incomeProfile?.stabilityScore ?? snapshot?.incomeStabilityScore
  const stabilityLabel = snapshot?.incomeStabilityLabel
  const accountName = incomeProfile?.accountName ?? snapshot?.accountName
  const accountNumber = incomeProfile?.accountNumber ?? snapshot?.accountNumber

  const handleFetchCreditworthiness = async () => {
    setFetching(true)
    setError('')
    try {
      const updated = await adminService.fetchMonoCreditworthiness(loan.id)
      if (onUpdated) onUpdated(updated)
    } catch (err) {
      setError(err.message || 'Credit check failed')
    } finally {
      setFetching(false)
    }
  }

  return (
    <div className="detail-card" style={{ borderLeft: '4px solid #0ea5e9' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
        <div>
          <h2 style={{ marginBottom: '4px' }}>Mono Data Lookup</h2>
          <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
            Income profile and credit data from connected bank account
          </div>
        </div>
        {riskMeta && (
          <span style={{
            background: riskMeta.bg, color: riskMeta.color,
            fontWeight: 700, padding: '3px 10px', borderRadius: '12px',
            fontSize: '0.8rem', whiteSpace: 'nowrap',
          }}>
            {riskMeta.label}
          </span>
        )}
      </div>

      {/* Income Profile */}
      {(monthlyIncome || accountName || employer) && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '0.72rem', color: '#374151', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
            Income Profile
          </div>
          <div style={{ background: '#f0f9ff', borderRadius: '8px', padding: '10px 12px' }}>
            {accountName && <InfoRow label="Account Name" value={accountName} />}
            {accountNumber && <InfoRow label="Account Number" value={accountNumber} />}
            {employer && <InfoRow label="Employer (from bank)" value={employer} />}
            {monthlyIncome && <InfoRow label="Monthly Income" value={fmtNaira(monthlyIncome)} mono />}
            {stability != null && (
              <InfoRow
                label="Income Stability"
                value={`${stabilityLabel ?? ''} ${fmtPct(stability)}`.trim()}
                mono
              />
            )}
          </div>
        </div>
      )}

      {/* Credit / Debt */}
      {(creditScore != null || totalDebt != null || canAfford != null) && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '0.72rem', color: '#374151', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
            Credit Data {cwFetchedAt && <span style={{ fontWeight: 400, textTransform: 'none', color: '#9ca3af' }}>— fetched {cwFetchedAt}</span>}
          </div>
          <div style={{ background: '#fafafa', borderRadius: '8px', padding: '10px 12px' }}>
            {creditScore != null && <InfoRow label="Credit Score" value={String(creditScore)} mono />}
            {riskRating && <InfoRow label="Risk Rating" value={String(riskRating)} />}
            {canAfford != null && (
              <InfoRow
                label="Can Afford Loan"
                value={canAfford ? '✓ Yes' : '✗ No'}
                mono={!canAfford}
              />
            )}
            {totalDebt != null && <InfoRow label="Total Existing Debt" value={fmtNaira(totalDebt)} />}
            {dti != null && <InfoRow label="Debt-to-Income Ratio" value={fmtPct(dti)} />}
            {loan.monoNetCashFlow != null && <InfoRow label="Net Monthly Cash Flow" value={fmtNaira(loan.monoNetCashFlow)} />}
            {loan.monoAverageMonthEndBalance != null && <InfoRow label="Avg Month-End Balance" value={fmtNaira(loan.monoAverageMonthEndBalance)} />}
          </div>
        </div>
      )}

      {/* No data yet */}
      {!monthlyIncome && !creditScore && !totalDebt && (
        <div style={{ color: '#9ca3af', fontSize: '0.8125rem', marginBottom: '12px' }}>
          No Mono data yet. Fetch the bank statement first to get income profile,
          then run the credit data lookup below.
        </div>
      )}

      {/* Credit Check Button */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', opacity: isLinked ? 1 : 0.5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>Credit Data Lookup</div>
            <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' }}>
              {isLinked
                ? 'Fetches credit score, risk rating, and debt summary from Mono'
                : 'Bank account must be linked first'}
            </div>
          </div>
          <button
            onClick={handleFetchCreditworthiness}
            disabled={fetching || !isLinked}
            style={{
              padding: '7px 14px', borderRadius: '7px', border: '1.5px solid',
              borderColor: !isLinked ? '#e5e7eb' : cwCache ? '#d1d5db' : '#0ea5e9',
              background: cwCache ? '#f9fafb' : '#f0f9ff',
              color: cwCache ? '#6b7280' : '#0369a1',
              fontWeight: 600, fontSize: '0.8125rem',
              cursor: (fetching || !isLinked) ? 'not-allowed' : 'pointer',
            }}
          >
            {fetching ? 'Fetching…' : cwCache ? 'Re-run Credit Lookup' : 'Run Credit Lookup'}
          </button>
        </div>
        {error && (
          <div className="alert-box alert-error" style={{ marginTop: '8px', fontSize: '0.8125rem' }}>{error}</div>
        )}
        {cwCache?.error && (
          <div className="alert-box alert-warning" style={{ marginTop: '8px', fontSize: '0.8125rem' }}>
            Mono returned: {String(cwCache.error)}
          </div>
        )}
      </div>
    </div>
  )
}
