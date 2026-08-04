import { useState } from 'react'
import { adminService } from '../../../services/adminService'

const fmtNaira = (n) =>
  n != null && !Number.isNaN(Number(n)) ? `₦${Number(n).toLocaleString()}` : '—'

const fmtPct = (n) => (n != null ? `${n}%` : '—')

const RECOMMENDATION_META = {
  proceed: { label: 'Proceed', color: '#059669', bg: '#dcfce7' },
  caution: { label: 'Proceed with Caution', color: '#d97706', bg: '#fef3c7' },
  decline: { label: 'Do Not Proceed', color: '#dc2626', bg: '#fee2e2' },
}

const FLAG_COLOR = { high: '#dc2626', medium: '#d97706', low: '#6b7280' }
const FLAG_BG = { high: '#fee2e2', medium: '#fef3c7', low: '#f1f5f9' }

function ScoreGauge({ score }) {
  const color = score >= 65 ? '#059669' : score >= 40 ? '#d97706' : '#dc2626'
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: '2rem', fontWeight: 800, color,
        lineHeight: 1, marginBottom: '4px',
      }}>{score}</div>
      <div style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>/ 100</div>
      <div style={{
        marginTop: '8px', height: '8px', borderRadius: '4px',
        background: '#e5e7eb', overflow: 'hidden',
      }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.3s' }} />
      </div>
      <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '4px' }}>
        {score >= 65 ? 'Good' : score >= 40 ? 'Moderate' : 'Poor'}
      </div>
    </div>
  )
}

function StatBox({ label, value, sub, accent }) {
  return (
    <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: accent ?? '#111827' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '2px' }}>{sub}</div>}
    </div>
  )
}

export default function TransactionAnalysisCard({ loan, onUpdated }) {
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')

  const analysis = loan.transactionAnalysis
  const hasTransactions = Array.isArray(loan.monoRawTransactions)
    ? loan.monoRawTransactions.length > 0
    : loan.monoConnectionStatus === 'linked'

  const handleRun = async () => {
    setRunning(true)
    setError('')
    try {
      const updated = await adminService.runTransactionAnalysis(loan.id)
      if (onUpdated) onUpdated(updated)
    } catch (err) {
      setError(err.message || 'Analysis failed')
    } finally {
      setRunning(false)
    }
  }

  const profile = analysis?.creditProfile
  const flags = analysis?.redFlags ?? []
  const rec = analysis?.lendingRecommendation
  const narrative = analysis?.geminiNarrative
  const recMeta = rec ? (RECOMMENDATION_META[rec] ?? null) : null
  const runAt = analysis?.runAt ? new Date(analysis.runAt).toLocaleString() : null

  return (
    <div className="detail-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h2 style={{ marginBottom: '4px' }}>Transaction Analysis</h2>
          <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
            {analysis
              ? `Analysed ${analysis.transactionCount} transactions · Last run ${runAt}`
              : 'Run the analysis engine on the stored bank transactions'}
          </div>
        </div>
        {recMeta && (
          <span style={{
            background: recMeta.bg, color: recMeta.color,
            fontWeight: 700, padding: '3px 10px', borderRadius: '12px',
            fontSize: '0.8rem', whiteSpace: 'nowrap',
          }}>
            {recMeta.label}
          </span>
        )}
      </div>

      {/* Run button */}
      <div style={{ marginBottom: analysis ? '16px' : '0' }}>
        <button
          onClick={handleRun}
          disabled={running}
          style={{
            padding: '8px 18px', borderRadius: '8px', border: '1.5px solid',
            borderColor: '#8b5cf6', background: '#f5f3ff', color: '#7c3aed',
            fontWeight: 600, fontSize: '0.8125rem',
            cursor: running ? 'not-allowed' : 'pointer',
            opacity: running ? 0.7 : 1,
          }}
        >
          {running ? 'Analysing…' : analysis ? 'Re-run Analysis' : 'Run Credit Analysis'}
        </button>
        {!hasTransactions && !analysis && (
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>
            Fetch the bank statement first, then run analysis
          </div>
        )}
        {error && (
          <div className="alert-box alert-error" style={{ marginTop: '8px', fontSize: '0.8125rem' }}>{error}</div>
        )}
      </div>

      {/* Analysis results */}
      {analysis && profile && (
        <>
          {/* Credit score + key metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', marginTop: '4px' }}>
            <ScoreGauge score={profile.internalCreditScore ?? 0} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <StatBox
                label="Monthly Income"
                value={fmtNaira(profile.detectedSalaryNaira || profile.avgMonthlyCreditNaira)}
                sub={profile.detectedSalaryNaira > 0 ? 'From salary credits' : 'From avg credits'}
                accent={profile.detectedSalaryNaira > 0 ? '#059669' : '#111827'}
              />
              <StatBox
                label="Loan Repayments / mo"
                value={fmtNaira(profile.detectedLoanRepaymentNaira)}
                sub={`DTI: ${fmtPct(profile.dtiPercent)}`}
                accent={profile.dtiPercent > 35 ? '#dc2626' : profile.dtiPercent > 20 ? '#d97706' : '#059669'}
              />
              <StatBox
                label="Avg Balance"
                value={fmtNaira(profile.averageBalanceNaira)}
                accent={profile.averageBalanceNaira < 0 ? '#dc2626' : '#111827'}
              />
              <StatBox
                label="Gambling / mo"
                value={fmtNaira(profile.detectedGamblingNaira)}
                sub={profile.gamblingRiskPercent > 0 ? `${profile.gamblingRiskPercent}% of income` : 'None detected'}
                accent={profile.gamblingRiskPercent > 5 ? '#dc2626' : '#059669'}
              />
            </div>
          </div>

          {/* Lenders detected */}
          {profile.identifiedLenders?.length > 0 && (
            <div style={{ marginTop: '14px', padding: '10px 12px', background: '#fff7ed', borderRadius: '8px', border: '1px solid #fed7aa' }}>
              <div style={{ fontSize: '0.72rem', color: '#9a3412', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                Active Lenders Detected
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {profile.identifiedLenders.map((l, i) => (
                  <span key={i} style={{
                    background: '#fef3c7', color: '#92400e', fontWeight: 600,
                    padding: '2px 8px', borderRadius: '10px', fontSize: '0.78rem',
                    textTransform: 'capitalize',
                  }}>
                    {l}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Red flags */}
          {flags.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '0.72rem', color: '#374151', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                Risk Flags
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {flags.map((flag, i) => (
                  <div key={i} style={{
                    padding: '7px 10px', borderRadius: '7px',
                    background: FLAG_BG[flag.severity] ?? '#f1f5f9',
                    border: `1px solid ${FLAG_COLOR[flag.severity]}33`,
                    fontSize: '0.8125rem', color: '#111827',
                    display: 'flex', gap: '8px', alignItems: 'flex-start',
                  }}>
                    <span style={{ color: FLAG_COLOR[flag.severity], fontWeight: 700, fontSize: '0.75rem', flexShrink: 0, marginTop: '1px' }}>
                      {flag.severity === 'high' ? '⚠' : flag.severity === 'medium' ? '!' : 'i'}
                    </span>
                    <span>{flag.issue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {flags.length === 0 && (
            <div style={{ marginTop: '12px', color: '#059669', fontWeight: 600, fontSize: '0.875rem' }}>
              ✓ No risk flags detected
            </div>
          )}

          {/* Gemini narrative */}
          {narrative && (
            <div style={{ marginTop: '14px', padding: '12px', background: '#f5f3ff', borderRadius: '8px', border: '1px solid #ddd6fe' }}>
              <div style={{ fontSize: '0.72rem', color: '#6d28d9', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
                AI Narrative
              </div>
              <div style={{ fontWeight: 700, color: '#111827', marginBottom: '8px', fontSize: '0.9rem' }}>
                {narrative.headline}
              </div>
              <div style={{ color: '#374151', fontSize: '0.8125rem', lineHeight: 1.6, marginBottom: '10px' }}>
                {narrative.body}
              </div>
              {narrative.keyStrengths?.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, marginBottom: '4px' }}>Strengths</div>
                  {narrative.keyStrengths.map((s, i) => (
                    <div key={i} style={{ fontSize: '0.8rem', color: '#374151', marginBottom: '2px' }}>✓ {s}</div>
                  ))}
                </div>
              )}
              {narrative.keyRisks?.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 700, marginBottom: '4px' }}>Risks</div>
                  {narrative.keyRisks.map((r, i) => (
                    <div key={i} style={{ fontSize: '0.8rem', color: '#374151', marginBottom: '2px' }}>⚠ {r}</div>
                  ))}
                </div>
              )}
              {narrative.suggestedAction && (
                <div style={{ fontSize: '0.8rem', color: '#4c1d95', fontWeight: 600, marginTop: '6px' }}>
                  Suggested: {narrative.suggestedAction}
                </div>
              )}
            </div>
          )}

          {/* Data summary */}
          <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#9ca3af', borderTop: '1px solid #f3f4f6', paddingTop: '8px' }}>
            {profile.totalTransactions} transactions · {profile.monthsOfData} months of data ·
            {profile.hasRegularSalary ? ' Regular salary detected' : ' No regular salary pattern'}
          </div>
        </>
      )}
    </div>
  )
}
