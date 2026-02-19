export const DOC_TYPES = {
  treatment_estimate: { label: 'Treatment estimate', required: true, description: 'Upload your hospital treatment estimate or quote.' },
  id_document: { label: 'ID document', required: true, description: 'Valid ID (e.g. NIN slip, BVN verification, or national ID).' },
  payslip: { label: 'Pay slip (optional)', required: false, description: 'Recent pay slip for income verification.' },
}

export default function DocumentUpload({ documents = {}, onChange, errors = {} }) {
  const handleFileChange = (type, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const next = { ...documents, [type]: { fileName: file.name, fileSize: file.size } }
    onChange(next)
  }

  const handleRemove = (type) => {
    const next = { ...documents, [type]: null }
    onChange(next)
  }

  return (
    <div className="document-upload-section">
      {Object.entries(DOC_TYPES).map(([key, { label, required, description }]) => (
        <div key={key} className="document-upload-item">
          <label className="document-upload-label">
            {label}
            {required && <span className="required-asterisk"> *</span>}
          </label>
          {description && <p className="document-upload-description">{description}</p>}
          {documents[key] ? (
            <div className="document-upload-file">
              <span className="document-file-name">{documents[key].fileName}</span>
              <span className="document-file-size">({formatSize(documents[key].fileSize)})</span>
              <button type="button" className="document-remove" onClick={() => handleRemove(key)}>
                Remove
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(key, e)}
              className="document-upload-input"
            />
          )}
          {errors[key] && <span className="input-error">{errors[key]}</span>}
        </div>
      ))}
    </div>
  )
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
