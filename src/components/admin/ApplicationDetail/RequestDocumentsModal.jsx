import { useState } from 'react'
import { adminService } from '../../../services/adminService'

const DOCUMENT_OPTIONS = [
  { key: 'payslip', label: 'Payslip (last 3 months)' },
  { key: 'bank_statement', label: 'Bank statement (3–6 months)' },
  { key: 'employment_letter', label: 'Employment / offer letter' },
  { key: 'id_document', label: 'Government-issued ID' },
  { key: 'treatment_estimate', label: 'Hospital treatment estimate' },
  { key: 'utility_bill', label: 'Utility bill (proof of address)' },
  { key: 'cac_certificate', label: 'CAC certificate (self-employed)' },
  { key: 'nin_slip', label: 'NIN slip' },
  { key: 'bvn_slip', label: 'BVN verification slip' },
]

export default function RequestDocumentsModal({ loanId, applicantEmail, onClose, onSuccess }) {
  const [selected, setSelected] = useState({})
  const [notes, setNotes] = useState({})
  const [custom, setCustom] = useState([])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const toggleDoc = (key) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const addCustom = () => {
    setCustom((prev) => [...prev, { key: `custom_${Date.now()}`, label: '' }])
  }

  const updateCustomLabel = (idx, label) => {
    setCustom((prev) => prev.map((c, i) => (i === idx ? { ...c, label } : c)))
  }

  const removeCustom = (idx) => {
    setCustom((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async () => {
    const docs = [
      ...DOCUMENT_OPTIONS
        .filter((o) => selected[o.key])
        .map((o) => ({ key: o.key, label: o.label, note: notes[o.key] || undefined })),
      ...custom.filter((c) => c.label.trim()).map((c) => ({ key: c.key, label: c.label.trim() })),
    ]
    if (!docs.length) { setError('Select at least one document.'); return }
    setSubmitting(true)
    setError('')
    try {
      const result = await adminService.requestDocuments(loanId, { documents: docs, message: message.trim() || undefined })
      onSuccess(result)
    } catch (err) {
      setError(err.message || 'Failed to send document request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Request Documents</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#6b7280' }}>✕</button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {applicantEmail && (
            <p style={{ margin: '0 0 16px', color: '#374151', fontSize: '0.875rem' }}>
              An upload link will be emailed to <strong>{applicantEmail}</strong>.
            </p>
          )}
          {!applicantEmail && (
            <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '6px', padding: '10px 12px', marginBottom: '16px', fontSize: '0.8125rem', color: '#92400e' }}>
              No email on file — upload link will be generated but cannot be auto-sent.
            </div>
          )}

          <p style={{ margin: '0 0 10px', fontWeight: 600, fontSize: '0.875rem' }}>Select required documents:</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {DOCUMENT_OPTIONS.map((opt) => (
              <div key={opt.key}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '8px 10px', borderRadius: '6px', border: selected[opt.key] ? '1.5px solid #2563eb' : '1px solid #e5e7eb', background: selected[opt.key] ? '#eff6ff' : '#fff' }}>
                  <input type="checkbox" checked={!!selected[opt.key]} onChange={() => toggleDoc(opt.key)} style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: selected[opt.key] ? 600 : 400 }}>{opt.label}</span>
                </label>
                {selected[opt.key] && (
                  <input
                    type="text"
                    placeholder="Add a note (optional)"
                    value={notes[opt.key] || ''}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [opt.key]: e.target.value }))}
                    style={{ marginTop: '4px', width: '100%', boxSizing: 'border-box', padding: '6px 10px', fontSize: '0.8125rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  />
                )}
              </div>
            ))}
          </div>

          {custom.map((c, idx) => (
            <div key={c.key} style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              <input
                type="text"
                placeholder="Custom document name"
                value={c.label}
                onChange={(e) => updateCustomLabel(idx, e.target.value)}
                style={{ flex: 1, padding: '7px 10px', fontSize: '0.875rem', border: '1.5px solid #2563eb', borderRadius: '6px' }}
              />
              <button type="button" onClick={() => removeCustom(idx)} style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', padding: '0 10px', color: '#dc2626', cursor: 'pointer', fontSize: '0.875rem' }}>✕</button>
            </div>
          ))}

          <button type="button" onClick={addCustom} style={{ background: 'none', border: '1px dashed #d1d5db', borderRadius: '6px', padding: '7px 14px', cursor: 'pointer', color: '#6b7280', fontSize: '0.8125rem', marginBottom: '16px', width: '100%' }}>
            + Add custom document
          </button>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '6px' }}>Message to applicant (optional)</label>
            <textarea
              rows={3}
              placeholder="E.g. Please ensure documents are clear and complete. Thank you."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', fontSize: '0.875rem', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' }}
            />
          </div>

          {error && <p style={{ color: '#dc2626', fontSize: '0.8125rem', marginBottom: '12px' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: '7px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '0.875rem' }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting} style={{ padding: '9px 20px', borderRadius: '7px', border: 'none', background: submitting ? '#93c5fd' : '#2563eb', color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>
              {submitting ? 'Sending…' : 'Send Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
