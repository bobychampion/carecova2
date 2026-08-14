const STAGES = [
  { key: 'received', label: 'Application\nReceived', icon: '📋' },
  { key: 'review', label: 'Document\nReview', icon: '📄' },
  { key: 'assessment', label: 'Credit\nAssessment', icon: '🔍' },
  { key: 'decision', label: 'Decision', icon: '✅' },
]

function resolveStage(status) {
  if (!status) return { active: 0, outcome: null }
  const s = String(status).toLowerCase()
  if (s === 'approved' || s === 'active' || s === 'pending_disbursement' || s === 'disbursed' || s === 'completed') {
    return { active: 3, outcome: 'approved' }
  }
  if (s === 'rejected' || s === 'declined') {
    return { active: 3, outcome: 'declined' }
  }
  if (s === 'under_review' || s === 'in_review') return { active: 2, outcome: null }
  if (s === 'documents_requested' || s === 'documents_pending') return { active: 1, outcome: 'docs' }
  return { active: 0, outcome: null }
}

export default function ApplicationStages({ status, submittedAt }) {
  const { active, outcome } = resolveStage(status)

  return (
    <div style={{ margin: '24px 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, position: 'relative' }}>
        {STAGES.map((stage, i) => {
          const done = i < active
          const current = i === active
          const declined = outcome === 'declined' && i === 3
          const needsDocs = outcome === 'docs' && i === 1

          let circleColor = '#e5e7eb'
          let textColor = '#9ca3af'
          if (done) { circleColor = '#10b981'; textColor = '#065f46' }
          if (current && !declined) { circleColor = '#2563eb'; textColor = '#1d4ed8' }
          if (declined) { circleColor = '#ef4444'; textColor = '#991b1b' }
          if (needsDocs) { circleColor = '#f59e0b'; textColor = '#92400e' }

          return (
            <div key={stage.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {i < STAGES.length - 1 && (
                <div style={{
                  position: 'absolute',
                  top: 18,
                  left: '50%',
                  width: '100%',
                  height: 3,
                  background: done ? '#10b981' : '#e5e7eb',
                  zIndex: 0,
                }} />
              )}
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: circleColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: done ? '1rem' : '0.85rem',
                zIndex: 1,
                position: 'relative',
                border: current ? '3px solid #bfdbfe' : '3px solid transparent',
                transition: 'all 0.2s',
              }}>
                {done ? '✓' : declined ? '✕' : needsDocs ? '!' : stage.icon}
              </div>
              <p style={{
                marginTop: 6,
                fontSize: '0.7rem',
                fontWeight: current || done ? 700 : 500,
                color: textColor,
                textAlign: 'center',
                lineHeight: 1.3,
                whiteSpace: 'pre-line',
              }}>{stage.label}</p>
              {needsDocs && (
                <p style={{ fontSize: '0.65rem', color: '#d97706', fontWeight: 600, textAlign: 'center', marginTop: 2 }}>Action needed</p>
              )}
            </div>
          )
        })}
      </div>

      {outcome === 'docs' && (
        <div style={{ marginTop: 14, padding: '10px 14px', background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: 8, fontSize: '0.8125rem', color: '#92400e' }}>
          We need additional documents from you. Check your email for a link to upload them.
        </div>
      )}

      {submittedAt && (
        <p style={{ marginTop: 10, fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>
          Submitted {new Date(submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      )}
    </div>
  )
}
