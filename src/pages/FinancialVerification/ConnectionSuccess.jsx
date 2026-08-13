const fmt = (ts) => {
  if (!ts) return null
  try {
    return new Date(ts).toLocaleString('en-NG', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return null
  }
}

export default function ConnectionSuccess({ bank, accountName, linkedAt }) {
  const connectedAt = fmt(linkedAt) || fmt(Date.now())

  return (
    <>
      <div className="vfp__status-screen">
        <div className="vfp__status-icon vfp__status-icon--success">✅</div>
        <h1 className="vfp__status-heading">Bank Connected Successfully</h1>
        <p className="vfp__status-body">
          Your financial account has been successfully connected. CareCova can now continue
          reviewing your application.
        </p>
      </div>

      <div style={{ width: '100%' }}>
        {bank && (
          <div className="vfp__meta-row">
            <span className="vfp__meta-label">Bank</span>
            <span className="vfp__meta-value">{bank.name}</span>
          </div>
        )}
        {accountName && (
          <div className="vfp__meta-row">
            <span className="vfp__meta-label">Account Name</span>
            <span className="vfp__meta-value">{accountName}</span>
          </div>
        )}
        <div className="vfp__meta-row">
          <span className="vfp__meta-label">Status</span>
          <span className="vfp__meta-value" style={{ color: 'var(--color-success)' }}>Connected</span>
        </div>
        {connectedAt && (
          <div className="vfp__meta-row">
            <span className="vfp__meta-label">Connected</span>
            <span className="vfp__meta-value">{connectedAt}</span>
          </div>
        )}
      </div>

      <div className="vfp__divider" />

      <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 'var(--leading-relaxed)' }}>
        Our team will continue reviewing your application. You will receive an update by email.
      </p>
    </>
  )
}
