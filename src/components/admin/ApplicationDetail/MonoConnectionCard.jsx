import { useState } from 'react'
import { adminService } from '../../../services/adminService'
import { ChevronDown } from 'lucide-react'

const STATUS_META = {
  not_started: {
    label: 'Not linked',
    color: '#64748b',
    description: 'No bank account linked yet. Send the connect link to the applicant.',
  },
  pending: {
    label: 'Awaiting applicant',
    color: '#f59e0b',
    description: 'Connect link sent. Waiting for the applicant to complete bank linking.',
  },
  linked: {
    label: 'Linked',
    color: '#10b981',
    description: 'Bank account is linked. You can now fetch the statement.',
  },
}

const fmt = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString()
}

export default function MonoConnectionCard({
  loan,
  initiating = false,
  refreshing = false,
  onInitiate,
  onRefresh,
  feedbackMessage = '',
  feedbackError = '',
  onStatementFetched,
}) {
  const [fetching, setFetching] = useState(false)
  const [fetchResult, setFetchResult] = useState(null)
  const [fetchError, setFetchError] = useState('')
  const [showManualOverride, setShowManualOverride] = useState(false)
  const [manualAccountId, setManualAccountId] = useState('')
  const [manualSaving, setManualSaving] = useState(false)
  const [manualError, setManualError] = useState('')
  const [manualSuccess, setManualSuccess] = useState('')

  const statusKey = loan.monoConnectionStatus || 'not_started'
  const meta = STATUS_META[statusKey] || STATUS_META.not_started
  const hasEmail = Boolean(loan.email)

  const transactionCache = loan.monoInformedDecisionCache?.sections?.transactions
  const alreadyFetched = Boolean(transactionCache)
  const txCount = transactionCache?.count ?? null

  const handleManualSetAccount = async () => {
    if (!manualAccountId.trim()) return
    setManualSaving(true)
    setManualError('')
    setManualSuccess('')
    try {
      await adminService.setMonoAccountIdManually(loan.id, manualAccountId.trim())
      setManualSuccess('Account ID saved. The application is now showing as linked.')
      setManualAccountId('')
      if (onStatementFetched) onStatementFetched()
    } catch (err) {
      setManualError(err.message || 'Failed to save account ID')
    } finally {
      setManualSaving(false)
    }
  }

  const handleFetchStatement = async () => {
    setFetching(true)
    setFetchError('')
    setFetchResult(null)
    try {
      const res = await adminService.fetchMonoStatementForLoan(loan.id)
      setFetchResult(res)
      if (onStatementFetched) onStatementFetched()
    } catch (err) {
      setFetchError(err.message || 'Failed to fetch bank statement')
    } finally {
      setFetching(false)
    }
  }

  return (
    <div className="detail-card" style={{ borderLeft: `4px solid ${meta.color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div>
          <h2 style={{ marginBottom: '4px' }}>Bank Account Link</h2>
          <div style={{ color: '#475569', fontSize: '0.86rem' }}>{meta.description}</div>
        </div>
        <span style={{
          background: `${meta.color}22`, color: meta.color,
          fontWeight: 700, padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', whiteSpace: 'nowrap',
        }}>
          {meta.label}
        </span>
      </div>

      {!hasEmail && (
        <div className="alert-box alert-warning mt-3">
          User email is missing — add an email before sending the connect link.
        </div>
      )}
      {feedbackMessage && <div className="alert-box alert-success mt-3">{feedbackMessage}</div>}
      {feedbackError && <div className="alert-box alert-error mt-3">{feedbackError}</div>}

      <div className="info-grid mt-3">
        <div className="info-group">
          <div className="info-label">Account ID</div>
          <div className="info-value font-mono">{loan.monoAccountId || '—'}</div>
        </div>
        <div className="info-group">
          <div className="info-label">Reference</div>
          <div className="info-value font-mono">{loan.monoConnectReference || '—'}</div>
        </div>
        <div className="info-group">
          <div className="info-label">Link Sent</div>
          <div className="info-value">{fmt(loan.monoConnectEmailSentAt)}</div>
        </div>
        <div className="info-group">
          <div className="info-label">Linked At</div>
          <div className="info-value">{fmt(loan.monoLinkedAt)}</div>
        </div>
      </div>

      {/* Linked account details */}
      {statusKey === 'linked' && loan.monoIncomeProfile && (
        <div style={{ marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
          <div className="info-grid">
            <div className="info-group">
              <div className="info-label">Account Name</div>
              <div className="info-value">{loan.monoIncomeProfile.accountName || '—'}</div>
            </div>
            <div className="info-group">
              <div className="info-label">Account Number</div>
              <div className="info-value">{loan.monoIncomeProfile.accountNumber || '—'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
        <button
          className="button button--primary"
          onClick={onInitiate}
          disabled={!hasEmail || initiating}
        >
          {initiating
            ? 'Sending…'
            : statusKey === 'pending'
              ? 'Resend Connect Link'
              : statusKey === 'linked'
                ? 'Send Reconnect Link'
                : 'Send Connect Link'}
        </button>
        <button
          className="button button--secondary"
          onClick={onRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing…' : 'Refresh Status'}
        </button>
      </div>

      {/* Fetch Bank Statement — always visible, disabled until linked */}
      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', opacity: statusKey !== 'linked' ? 0.5 : 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>Bank Statement</div>
            {statusKey !== 'linked' ? (
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '2px' }}>
                Send Connect Link first, wait for applicant to link their bank
              </div>
            ) : alreadyFetched && txCount !== null ? (
              <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '2px' }}>
                Fetched — {txCount} transactions
              </div>
            ) : alreadyFetched ? (
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>
                Previously fetched
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>
                Ready to fetch — account is linked
              </div>
            )}
          </div>
          {(() => {
            const isLinked = statusKey === 'linked'
            return (
            <button
              onClick={handleFetchStatement}
              disabled={fetching || !isLinked}
              style={{
                padding: '7px 14px', borderRadius: '7px', border: '1.5px solid',
                borderColor: !isLinked ? '#e5e7eb' : alreadyFetched ? '#d1d5db' : '#2563eb',
                background: alreadyFetched ? '#f9fafb' : '#eff6ff',
                color: alreadyFetched ? '#6b7280' : '#1d4ed8',
                fontWeight: 600, fontSize: '0.8125rem',
                cursor: fetching ? 'not-allowed' : 'pointer',
              }}
            >
              {fetching ? 'Fetching…' : alreadyFetched ? 'Re-fetch Statement' : 'Fetch Bank Statement'}
            </button>
            )
          })()}
        </div>
        {fetchResult && (
          <div className="alert-box alert-success" style={{ marginTop: '8px', fontSize: '0.8125rem' }}>
            Statement fetched — {fetchResult.count ?? '?'} transactions retrieved
          </div>
        )}
        {fetchError && (
          <div className="alert-box alert-error" style={{ marginTop: '8px', fontSize: '0.8125rem' }}>
            {fetchError}
          </div>
        )}
      </div>

      {/* Manual override — for when webhook didn't fire */}
      {statusKey !== 'linked' && (
        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f3f4f6' }}>
          <button
            onClick={() => setShowManualOverride((v) => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#9ca3af', padding: 0 }}
          >
            <ChevronDown size={13} style={{ transform: showManualOverride ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            Patient linked but status not updating? Set account ID manually
          </button>

          {showManualOverride && (
            <div style={{ marginTop: '10px', padding: '12px', borderRadius: '8px', background: '#fffbeb', border: '1px solid #fde68a' }}>
              <p style={{ margin: '0 0 8px', fontSize: '0.8125rem', color: '#92400e', fontWeight: 600 }}>
                Webhook may not have fired
              </p>
              <p style={{ margin: '0 0 10px', fontSize: '0.75rem', color: '#78350f' }}>
                Get the Mono account ID from the Mono dashboard → Accounts section. Paste it below to manually mark this application as linked.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Mono account ID (e.g. 6a635590a034…)"
                  value={manualAccountId}
                  onChange={(e) => setManualAccountId(e.target.value.trim())}
                  style={{ flex: 1, padding: '7px 10px', borderRadius: '7px', border: '1.5px solid #fde68a', fontSize: '0.8125rem', background: '#fff', color: '#111827' }}
                />
                <button
                  onClick={handleManualSetAccount}
                  disabled={!manualAccountId.trim() || manualSaving}
                  style={{ padding: '7px 14px', borderRadius: '7px', border: 'none', background: manualAccountId.trim() ? '#d97706' : '#e5e7eb', color: manualAccountId.trim() ? '#fff' : '#9ca3af', fontWeight: 600, fontSize: '0.8125rem', cursor: manualAccountId.trim() ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' }}
                >
                  {manualSaving ? 'Saving…' : 'Set'}
                </button>
              </div>
              {manualError && <p style={{ margin: '6px 0 0', fontSize: '0.8125rem', color: '#dc2626' }}>{manualError}</p>}
              {manualSuccess && <p style={{ margin: '6px 0 0', fontSize: '0.8125rem', color: '#16a34a' }}>{manualSuccess}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
