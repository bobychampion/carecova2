import { useEffect, useMemo, useState } from 'react'
import { adminService } from '../../../services/adminService'

const SECTION_LABELS = {
  account: 'Account',
  incomeRecords: 'Income Records',
  transactions: 'Transactions',
  assets: 'Assets',
  inflows: 'Inflows',
  statements: 'Statements',
  creditworthiness: 'Creditworthiness',
}

const STATUS_COLORS = {
  success: '#16a34a',
  error: '#dc2626',
  skipped: '#64748b',
}

const toNumberOrEmpty = (value) => {
  if (value === undefined || value === null || value === '') return ''
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : ''
}

const formatCurrency = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return `₦${value.toLocaleString()}`
}

const compactJson = (value) => {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return 'Unable to display response payload'
  }
}

export default function MonoInformedDecisionModal({ open, onClose, loan }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [report, setReport] = useState(null)
  const [form, setForm] = useState({
    bvn: '',
    principal: '',
    interestRate: 5,
    term: '',
    runCreditCheck: true,
  })

  const canRun = Boolean(loan?.id && loan?.monoAccountId)
  const sectionEntries = useMemo(
    () => Object.entries(report?.sections || {}),
    [report],
  )

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const buildPayload = () => {
    const payload = {}
    const bvn = String(form.bvn || '').trim()
    if (bvn) payload.bvn = bvn

    const principal = toNumberOrEmpty(form.principal)
    if (principal !== '') payload.principal = principal

    const interestRate = toNumberOrEmpty(form.interestRate)
    if (interestRate !== '') payload.interestRate = interestRate

    const term = toNumberOrEmpty(form.term)
    if (term !== '') payload.term = term

    payload.runCreditCheck = Boolean(form.runCreditCheck)
    return payload
  }

  const fetchReport = async () => {
    if (!canRun) return

    try {
      setLoading(true)
      setError('')
      const data = await adminService.getMonoInformedDecisionForLoan(
        loan.id,
        buildPayload(),
      )
      setReport(data)
    } catch (err) {
      setError(err.message || 'Unable to fetch Mono informed decision data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open || !loan) return

    setForm({
      bvn: '',
      principal: loan.requestedAmount || '',
      interestRate: 5,
      term: loan.preferredDuration || '',
      runCreditCheck: true,
    })
    setReport(null)
    setError('')
  }, [open, loan])

  useEffect(() => {
    if (!open || !canRun) return
    fetchReport()
  }, [open, canRun])

  if (!open) return null

  const analysis = report?.analysis || {}
  const successCount = sectionEntries.filter(
    ([, section]) => section?.status === 'success',
  ).length
  const errorCount = sectionEntries.filter(
    ([, section]) => section?.status === 'error',
  ).length

  return (
    <div className="mono-modal-backdrop" onClick={onClose}>
      <div className="mono-modal" onClick={(event) => event.stopPropagation()}>
        <div className="mono-modal-header">
          <div>
            <h2 className="mono-modal-title">Mono Informed Decision</h2>
            <p className="mono-modal-subtitle">
              Partial failures are allowed. Successful sections are still returned.
            </p>
          </div>
          <button className="button button--secondary" onClick={onClose}>
            Close
          </button>
        </div>

        {!canRun ? (
          <div className="alert-box alert-warning">
            This applicant does not have a linked Mono account yet.
          </div>
        ) : null}

        <div className="mono-modal-form">
          <label>
            BVN
            <input
              type="text"
              value={form.bvn}
              onChange={(event) => updateForm('bvn', event.target.value)}
              placeholder="12345678901"
              maxLength={11}
            />
          </label>
          <label>
            Principal (NGN)
            <input
              type="number"
              value={form.principal}
              onChange={(event) => updateForm('principal', event.target.value)}
              min="1"
            />
          </label>
          <label>
            Interest Rate (%)
            <input
              type="number"
              value={form.interestRate}
              onChange={(event) => updateForm('interestRate', event.target.value)}
              min="0"
              step="0.1"
            />
          </label>
          <label>
            Term (months)
            <input
              type="number"
              value={form.term}
              onChange={(event) => updateForm('term', event.target.value)}
              min="1"
            />
          </label>
          <label className="mono-checkbox">
            <input
              type="checkbox"
              checked={form.runCreditCheck}
              onChange={(event) =>
                updateForm('runCreditCheck', event.target.checked)
              }
            />
            Run credit check
          </label>
          <button
            className="button button--primary"
            onClick={fetchReport}
            disabled={loading || !canRun}
          >
            {loading ? 'Fetching...' : 'Refresh Analysis'}
          </button>
        </div>

        {error ? <div className="alert-box alert-error mt-3">{error}</div> : null}

        {report ? (
          <div className="mono-modal-content">
            <div className="mono-summary-grid">
              <div className="mono-summary-card">
                <div className="mono-summary-label">Response Status</div>
                <div className="mono-summary-value">{report.status}</div>
              </div>
              <div className="mono-summary-card">
                <div className="mono-summary-label">Sections Success</div>
                <div className="mono-summary-value">{successCount}</div>
              </div>
              <div className="mono-summary-card">
                <div className="mono-summary-label">Sections Failed</div>
                <div className="mono-summary-value">{errorCount}</div>
              </div>
              <div className="mono-summary-card">
                <div className="mono-summary-label">Monthly Income</div>
                <div className="mono-summary-value">
                  {formatCurrency(analysis.monthlyIncome)}
                </div>
              </div>
              <div className="mono-summary-card">
                <div className="mono-summary-label">Net Cash Flow</div>
                <div className="mono-summary-value">
                  {formatCurrency(analysis.netCashFlow)}
                </div>
              </div>
              <div className="mono-summary-card">
                <div className="mono-summary-label">Repayment Ratio</div>
                <div className="mono-summary-value">
                  {typeof analysis.repaymentToIncomeRatio === 'number'
                    ? `${Math.round(analysis.repaymentToIncomeRatio * 100)}%`
                    : '—'}
                </div>
              </div>
            </div>

            {Array.isArray(analysis.insights) && analysis.insights.length > 0 ? (
              <div className="mono-insights">
                <h3>Insights</h3>
                <ul>
                  {analysis.insights.map((insight, index) => (
                    <li key={`${insight}-${index}`}>{insight}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {Array.isArray(report.warnings) && report.warnings.length > 0 ? (
              <div className="mono-warnings alert-box alert-warning">
                {report.warnings.join(' | ')}
              </div>
            ) : null}

            <div className="mono-sections">
              {sectionEntries.map(([key, section]) => {
                const statusColor = STATUS_COLORS[section.status] || '#334155'
                return (
                  <div key={key} className="mono-section-card">
                    <div className="mono-section-header">
                      <div>
                        <div className="mono-section-title">
                          {SECTION_LABELS[key] || key}
                        </div>
                        <div className="mono-section-endpoint">{section.endpoint}</div>
                      </div>
                      <span
                        className="mono-section-badge"
                        style={{
                          background: `${statusColor}1a`,
                          color: statusColor,
                          borderColor: `${statusColor}66`,
                        }}
                      >
                        {section.status}
                      </span>
                    </div>
                    {section.error ? (
                      <div className="mono-section-error">{section.error}</div>
                    ) : null}
                    {section.message ? (
                      <div className="mono-section-message">{section.message}</div>
                    ) : null}
                    <details>
                      <summary>View payload</summary>
                      <pre>{compactJson(section.data || {})}</pre>
                    </details>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
