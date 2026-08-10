import { useState } from 'react'
import StatusBadge from '../../StatusBadge'
import { useRiskBadge } from '../../../hooks/useAffordabilityCheck'
import { adminService } from '../../../services/adminService'

export default function ApplicantSnapshot({ loan, onUpdated }) {
    const getDocumentStatus = (docKey) => {
        if (!loan.documents) return 'missing'
        const doc = loan.documents[docKey]
        if (!doc) return 'missing'
        return doc.status || 'uploaded'
    }

    const formatDocName = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

    const [editingIdentity, setEditingIdentity] = useState(false)
    const [bvnInput, setBvnInput] = useState(loan.bvn || '')
    const [ninInput, setNinInput] = useState(loan.nin || '')
    const [savingIdentity, setSavingIdentity] = useState(false)
    const [identityError, setIdentityError] = useState('')

    const handleSaveIdentity = async () => {
      setSavingIdentity(true)
      setIdentityError('')
      try {
        await adminService.updateLoanIdentity(loan.id, { bvn: bvnInput, nin: ninInput })
        setEditingIdentity(false)
        onUpdated?.()
      } catch (err) {
        setIdentityError(err.message || 'Failed to save')
      } finally {
        setSavingIdentity(false)
      }
    }

    // Safe extraction of nested structures from new Apply hook output
    const location = loan.location || { state: loan.state, city: loan.city }
    const hospital = loan.hospital || { name: loan.hospitalName || loan.hospital, isPartnerSuggested: false }
    const riskMetrics = loan.internalRiskMetrics || loan.affordability || {}

    // Fallbacks if not set
    const badgeInfo = useRiskBadge(riskMetrics.riskLevel || 'LOW')
    const income = loan.monthlyIncome || loan.monthlyIncomeRange || 0;
    const expenses = loan.monthlyExpenses || 0;
    const dispIncome = riskMetrics.disposableIncome || (income - expenses);

    return (
        <div className="detail-column column-snapshot">
            <div className="detail-card">
                <h2>Applicant Identity</h2>
                <div className="identity-header">
                    {loan.applicantPhoto?.dataUrl && (
                        <div className="identity-photo">
                            <img
                                src={loan.applicantPhoto.dataUrl}
                                alt={loan.fullName || loan.patientName}
                                className="identity-photo-img"
                            />
                        </div>
                    )}
                    <div className="identity-primary">
                        <div className="info-group">
                            <div className="info-label">Full Name</div>
                            <div className="info-value text-lg font-bold">{loan.fullName || loan.patientName}</div>
                        </div>
                        <div className="info-grid mt-3">
                            <div className="info-group">
                                <div className="info-label">Phone</div>
                                <div className="info-value">{loan.phone}</div>
                            </div>
                            <div className="info-group">
                                <div className="info-label">Email</div>
                                <div className="info-value">{loan.email || '—'}</div>
                            </div>
                            {editingIdentity ? (
                              <div className="info-group col-span-2" style={{ gridColumn: '1 / -1' }}>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                  <div>
                                    <div className="info-label">BVN</div>
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      maxLength={11}
                                      value={bvnInput}
                                      onChange={(e) => setBvnInput(e.target.value.replace(/\D/g, ''))}
                                      placeholder="11-digit BVN"
                                      style={{ padding: '6px 10px', borderRadius: '6px', border: '1.5px solid #d1d5db', fontSize: '0.875rem', width: '150px' }}
                                    />
                                  </div>
                                  <div>
                                    <div className="info-label">NIN</div>
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      maxLength={11}
                                      value={ninInput}
                                      onChange={(e) => setNinInput(e.target.value.replace(/\D/g, ''))}
                                      placeholder="11-digit NIN"
                                      style={{ padding: '6px 10px', borderRadius: '6px', border: '1.5px solid #d1d5db', fontSize: '0.875rem', width: '150px' }}
                                    />
                                  </div>
                                  <button
                                    onClick={handleSaveIdentity}
                                    disabled={savingIdentity}
                                    style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
                                  >
                                    {savingIdentity ? 'Saving…' : 'Save'}
                                  </button>
                                  <button
                                    onClick={() => { setEditingIdentity(false); setBvnInput(loan.bvn || ''); setNinInput(loan.nin || '') }}
                                    style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', fontSize: '0.8125rem', cursor: 'pointer' }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                                {identityError && <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#dc2626' }}>{identityError}</p>}
                              </div>
                            ) : (
                              <>
                                <div className="info-group">
                                  <div className="info-label">BVN</div>
                                  <div className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {loan.bvn || <span style={{ color: '#ef4444', fontWeight: 600 }}>Missing</span>}
                                    <button
                                      onClick={() => { setEditingIdentity(true); setBvnInput(loan.bvn || ''); setNinInput(loan.nin || '') }}
                                      style={{ fontSize: '0.7rem', padding: '2px 7px', borderRadius: '4px', border: '1px solid #d1d5db', background: '#f9fafb', cursor: 'pointer', color: '#6b7280' }}
                                    >
                                      Edit
                                    </button>
                                  </div>
                                </div>
                                <div className="info-group">
                                  <div className="info-label">NIN</div>
                                  <div className="info-value">{loan.nin || '—'}</div>
                                </div>
                              </>
                            )}
                            <div className="info-group">
                                <div className="info-label">Location (Triangulated)</div>
                                <div className="info-value">{location.city}, {location.state}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="detail-card">
                <h2>Employment & Income</h2>
                <div className="info-grid">
                    <div className="info-group">
                        <div className="info-label">Sector</div>
                        <div className="info-value capitalize font-bold">{loan.employmentSector || loan.employmentType || '—'}</div>
                    </div>
                    <div className="info-group col-span-2">
                        <div className="info-label">Employer / Business</div>
                        <div className="info-value">{loan.employerName || '—'}</div>
                    </div>
                    <div className="info-group">
                        <div className="info-label">Stated Income</div>
                        <div className="info-value font-medium text-primary">
                            ₦{income ? income.toLocaleString() : '—'}
                        </div>
                    </div>
                    <div className="info-group">
                        <div className="info-label">Stated Expenses</div>
                        <div className="info-value font-medium">
                            ₦{expenses ? expenses.toLocaleString() : '—'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="detail-card bg-sage-light" style={{ borderLeft: `4px solid ${riskMetrics.riskLevel === 'HIGH' ? '#ef4444' : riskMetrics.riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0 }}>Internal Risk & Affordability</h2>
                    <span className={`badge ${badgeInfo.className}`}>{badgeInfo.label}</span>
                </div>
                <div className="info-grid mt-3">
                    <div className="info-group">
                        <div className="info-label">Disposable Income</div>
                        <div className={`info-value font-bold ${dispIncome <= 0 ? 'text-danger' : 'text-success'}`}>
                            ₦{dispIncome.toLocaleString()}
                        </div>
                    </div>
                    <div className="info-group">
                        <div className="info-label">DTI Ratio (Affordability)</div>
                        <div className="info-value font-bold">
                            {riskMetrics.affordabilityRatio ? (riskMetrics.affordabilityRatio * 100).toFixed(1) + '%' : '—'}
                        </div>
                    </div>
                    {riskMetrics.riskReasons && riskMetrics.riskReasons.length > 0 && (
                        <div className="info-group col-span-2" style={{ marginTop: '10px' }}>
                            <div className="info-label text-danger">Risk Flags:</div>
                            <ul style={{ color: '#ef4444', fontSize: '0.85rem', margin: 0, paddingLeft: '20px' }}>
                                {riskMetrics.riskReasons.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <div className="detail-card">
                <h2>Medical Context</h2>
                <div className="info-grid">
                    <div className="info-group col-span-2">
                        <div className="info-label">Treatment Category</div>
                        <div className="info-value font-medium">{loan.treatmentCategory}</div>
                    </div>
                    <div className="info-group col-span-2">
                        <div className="info-label">Hospital</div>
                        <div className="info-value">
                            {hospital.name || 'Any partner near me'}
                            {hospital.isPartnerSuggested && <span className="badge badge-success ml-2" style={{ fontSize: '0.7em' }}>Partner Range</span>}
                        </div>
                    </div>
                    <div className="info-group col-span-2">
                        <div className="info-label">Description</div>
                        <div className="info-value text-sm">{loan.healthDescription || loan.procedureOrService || '—'}</div>
                    </div>
                </div>
            </div>

            <div className="detail-card">
                <h2>Completeness & Case File</h2>
                <div className="doc-list">
                    {['id_document', 'treatment_estimate', 'payslip'].map(docKey => {
                        const status = getDocumentStatus(docKey)
                        const doc = loan.documents?.[docKey]
                        return (
                            <div key={docKey} className="doc-item">
                                <div className="doc-info">
                                    <span className="doc-icon">📄</span>
                                    <div>
                                        <div className="doc-name">{formatDocName(docKey)}</div>
                                        {doc && doc.fileName && <div className="doc-meta">{doc.fileName}</div>}
                                    </div>
                                </div>
                                <div className={`doc-status status-${status}`}>
                                    {status === 'uploaded' ? '✓ Uploaded' : '❌ Missing'}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {loan.coBorrower && (
                <div className="detail-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <h2>Guarantor</h2>
                    <div className="info-grid">
                        <div className="info-group">
                            <div className="info-label">Name</div>
                            <div className="info-value">{loan.coBorrower.name}</div>
                        </div>
                        <div className="info-group">
                            <div className="info-label">Phone</div>
                            <div className="info-value">{loan.coBorrower.phone}</div>
                        </div>
                        <div className="info-group">
                            <div className="info-label">Email</div>
                            <div className="info-value">{loan.coBorrower.email || '—'}</div>
                        </div>
                        <div className="info-group">
                            <div className="info-label">BVN</div>
                            <div className="info-value">{loan.coBorrower.bvn || '—'}</div>
                        </div>
                        <div className="info-group">
                            <div className="info-label">Relationship</div>
                            <div className="info-value">{loan.coBorrower.relationship}</div>
                        </div>
                        <div className="info-group">
                            <div className="info-label">Sector</div>
                            <div className="info-value capitalize">{loan.coBorrower.employmentSector || '—'}</div>
                        </div>
                        <div className="info-group col-span-2">
                            <div className="info-label">Income</div>
                            <div className="info-value">₦{loan.coBorrower.monthlyIncome ? loan.coBorrower.monthlyIncome.toLocaleString() : '—'}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
