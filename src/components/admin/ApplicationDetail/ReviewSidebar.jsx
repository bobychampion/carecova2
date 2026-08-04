const STATE_CONFIG = {
  complete:       { color: '#16a34a', bg: '#dcfce7', dot: '#16a34a' },
  partial:        { color: '#d97706', bg: '#fef3c7', dot: '#f59e0b' },
  not_started:    { color: '#6b7280', bg: '#f3f4f6', dot: '#d1d5db' },
  not_applicable: { color: '#9ca3af', bg: '#f9fafb', dot: '#e5e7eb' },
}

function Dot({ state }) {
  const cfg = STATE_CONFIG[state] || STATE_CONFIG.not_started
  return (
    <span style={{
      display: 'inline-block', width: '8px', height: '8px',
      borderRadius: '50%', background: cfg.dot, flexShrink: 0,
    }} />
  )
}

export function getSectionStates(loan) {
  if (!loan) return {}

  const bvnDone = !!loan.bvnVerification
  const monoLinked = !!loan.monoAccountId
  const txFetched = (loan.monoRawTransactions?.length ?? 0) > 0
  const cwDone = !!(loan.monoCreditworthinessCache && !loan.monoCreditworthinessCache.error)

  let verification = 'not_started'
  if (bvnDone && monoLinked && txFetched) verification = 'complete'
  else if (bvnDone || monoLinked) verification = 'partial'

  let credit = 'not_applicable'
  if (loan.transactionAnalysis?.creditProfile || cwDone) credit = 'complete'
  else if (txFetched || monoLinked) credit = 'partial'

  let ai = 'not_started'
  if (loan.geminiInsights) ai = 'complete'

  let provider = 'not_started'
  if (loan.p2vestDecision?.decisionStatus || loan.providerDecision?.status) provider = 'complete'
  else if (loan.p2vestRequestId || loan.lendingProviderId) provider = 'partial'

  const docs = loan.documentRequests ?? []
  let documents = 'not_started'
  if (docs.length > 0) {
    documents = docs.every((d) => d.status === 'uploaded') ? 'complete' : 'partial'
  }

  return {
    applicant: 'complete',
    verification,
    credit,
    ai,
    provider,
    documents,
  }
}

const SECTIONS = [
  { id: 'applicant',    label: 'Applicant Info' },
  { id: 'verification', label: 'Verification & Bank' },
  { id: 'credit',       label: 'Credit Analysis' },
  { id: 'ai',           label: 'AI Pre-Screen' },
  { id: 'provider',     label: 'Provider Submission' },
  { id: 'documents',    label: 'Documents' },
]

function scrollTo(id) {
  const el = document.getElementById(`section-${id}`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function ReviewSidebar({ states = {}, activeSection = '' }) {
  return (
    <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px', paddingLeft: '12px' }}>
        Review Sections
      </div>
      {SECTIONS.map((s) => {
        const state = states[s.id] ?? 'not_started'
        const isActive = activeSection === s.id
        const isNA = state === 'not_applicable'
        return (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            disabled={isNA}
            style={{
              display: 'flex', alignItems: 'center', gap: '9px',
              padding: '8px 12px', borderRadius: '7px', border: 'none',
              background: isActive ? '#eff6ff' : 'transparent',
              color: isNA ? '#d1d5db' : isActive ? '#2563eb' : '#374151',
              fontWeight: isActive ? 700 : 500, fontSize: '0.8125rem',
              textAlign: 'left', cursor: isNA ? 'default' : 'pointer',
              transition: 'background 0.1s',
            }}
          >
            <Dot state={state} />
            {s.label}
          </button>
        )
      })}

      {/* Legend */}
      <div style={{ marginTop: '20px', paddingLeft: '12px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {[
          { state: 'complete', label: 'Done' },
          { state: 'partial', label: 'In progress' },
          { state: 'not_started', label: 'Not started' },
          { state: 'not_applicable', label: 'N/A' },
        ].map(({ state, label }) => (
          <div key={state} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#9ca3af' }}>
            <Dot state={state} />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
