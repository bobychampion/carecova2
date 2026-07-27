import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { uploadFileToCloudinary } from '../services/cloudinaryService'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const API_ROOT = API_BASE_URL ? `${API_BASE_URL}/api` : ''

async function fetchUploadPage(token) {
  const res = await fetch(`${API_ROOT}/loan-applications/upload-documents/${encodeURIComponent(token)}`)
  if (res.status === 404) throw new Error('This upload link is not valid or has already been used.')
  if (res.status === 400) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || 'This upload link has expired.')
  }
  if (!res.ok) throw new Error('Unable to load your upload page.')
  return res.json()
}

async function submitDocument(token, key, fileUrl, fileName) {
  const res = await fetch(`${API_ROOT}/loan-applications/upload-documents/${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, fileUrl, fileName }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || 'Upload failed.')
  }
  return res.json()
}

export default function UploadDocuments() {
  const { token } = useParams()
  const [pageData, setPageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploads, setUploads] = useState({}) // key -> { uploading, done, error }
  const [allDone, setAllDone] = useState(false)

  useEffect(() => {
    fetchUploadPage(token)
      .then((data) => { setPageData(data); setLoading(false) })
      .catch((err) => { setError(err.message); setLoading(false) })
  }, [token])

  const handleFileChange = async (docKey, file) => {
    if (!file) return
    setUploads((prev) => ({ ...prev, [docKey]: { uploading: true, done: false, error: '' } }))
    try {
      const { url } = await uploadFileToCloudinary(file, { folder: 'carecova/documents' })
      await submitDocument(token, docKey, url, file.name)
      setUploads((prev) => ({ ...prev, [docKey]: { uploading: false, done: true, error: '', url } }))
      // Check if all pending docs are now done
      const remaining = (pageData?.documents || []).filter((d) => d.status === 'pending' && !uploads[d.key]?.done && d.key !== docKey)
      if (remaining.length === 0) setAllDone(true)
    } catch (err) {
      setUploads((prev) => ({ ...prev, [docKey]: { uploading: false, done: false, error: err.message || 'Upload failed' } }))
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#6b7280' }}>Loading…</p>
        </main>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ maxWidth: '480px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
            <h2 style={{ color: '#111827', marginBottom: '8px' }}>Link not available</h2>
            <p style={{ color: '#6b7280' }}>{error}</p>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '16px' }}>
              If you need help, contact <a href="mailto:support@carecova.com" style={{ color: '#2563eb' }}>support@carecova.com</a>.
            </p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (allDone) {
    return (
      <>
        <Header />
        <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ maxWidth: '480px', textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>✅</div>
            <h2 style={{ color: '#111827', marginBottom: '8px' }}>All documents uploaded!</h2>
            <p style={{ color: '#6b7280' }}>Thank you. Our team will review your documents and be in touch shortly.</p>
            {pageData?.applicationCode && (
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '8px' }}>Reference: <strong style={{ color: '#1d4ed8' }}>{pageData.applicationCode}</strong></p>
            )}
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const { applicantName, applicationCode, documents, message, expiresAt } = pageData || {}
  const firstName = (applicantName || 'there').split(' ')[0]
  const pending = (documents || []).filter((d) => d.status === 'pending' && !uploads[d.key]?.done)
  const uploaded = (documents || []).filter((d) => d.status === 'uploaded' || uploads[d.key]?.done)

  return (
    <>
      <Header />
      <main style={{ minHeight: '60vh', background: '#f9fafb', padding: '40px 16px' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ background: '#1e3a5f', padding: '20px 24px' }}>
              <h1 style={{ color: '#fff', margin: '0 0 4px', fontSize: '1.25rem' }}>Upload Required Documents</h1>
              {applicationCode && <p style={{ color: '#93c5fd', margin: 0, fontSize: '0.875rem' }}>Application: {applicationCode}</p>}
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ margin: '0 0 16px', color: '#374151' }}>Hi {firstName}, please upload the following documents to continue processing your application.</p>
              {message && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.875rem', color: '#1e40af' }}>
                  {message}
                </div>
              )}
              {expiresAt && (
                <p style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '20px' }}>
                  ⏳ Link expires: <strong>{new Date(expiresAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</strong>
                </p>
              )}

              {pending.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '0.9375rem', fontWeight: 700, color: '#111827' }}>Documents needed ({pending.length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {pending.map((doc) => {
                      const state = uploads[doc.key] || {}
                      return (
                        <div key={doc.key} style={{ border: '1.5px solid #e5e7eb', borderRadius: '8px', padding: '14px 16px' }}>
                          <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '0.9rem' }}>{doc.label}</p>
                          {doc.note && <p style={{ margin: '0 0 10px', color: '#6b7280', fontSize: '0.8125rem' }}>{doc.note}</p>}
                          {state.error && <p style={{ color: '#dc2626', fontSize: '0.8125rem', marginBottom: '8px' }}>{state.error}</p>}
                          {state.uploading ? (
                            <p style={{ color: '#6b7280', fontSize: '0.8125rem' }}>Uploading…</p>
                          ) : (
                            <label style={{ display: 'inline-block', cursor: 'pointer' }}>
                              <span style={{ background: '#2563eb', color: '#fff', padding: '7px 16px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                                Choose file
                              </span>
                              <input
                                type="file"
                                accept="image/*,.pdf,.doc,.docx"
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileChange(doc.key, e.target.files?.[0])}
                              />
                            </label>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {uploaded.length > 0 && (
                <div>
                  <h3 style={{ margin: '0 0 10px', fontSize: '0.9375rem', fontWeight: 700, color: '#059669' }}>Uploaded ✅ ({uploaded.length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {uploaded.map((doc) => (
                      <div key={doc.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0', fontSize: '0.875rem' }}>
                        <span>✅</span>
                        <span style={{ fontWeight: 600 }}>{doc.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p style={{ margin: '20px 0 0', fontSize: '0.8125rem', color: '#9ca3af', textAlign: 'center' }}>
                Questions? Email <a href="mailto:support@carecova.com" style={{ color: '#2563eb' }}>support@carecova.com</a>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
