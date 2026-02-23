import { useState } from 'react'
import MoneyInput from '../../MoneyInput'
import { parseMoney } from '../../../utils/currencyUtils'

export default function DecisionPanel({ loan, onApprove, onReject, onRequestInfo }) {
    const [amount, setAmount] = useState(loan.requestedAmount || loan.estimatedCost || 0)
    const [tenor, setTenor] = useState(loan.preferredDuration || loan.preferredTenor?.replace(/[^0-9]/g, '').split('-')[1] || 6)
    const [notes, setNotes] = useState('')
    const [actioning, setActioning] = useState(false)
    const [activeTab, setActiveTab] = useState('decision') // decision | info

    // Handle string inputs from MoneyInput
    const parsedAmount = typeof amount === 'string' ? parseMoney(amount) || 0 : amount;
    const parsedTenor = Number(tenor) || 1;

    // Use mock service fee (flat % for MVP) as discussed
    const serviceFeePct = 0.05;
    const serviceFeeAmount = parsedAmount * serviceFeePct;

    const interestRate = 0.025; // per month
    const totalRepayment = parsedAmount + serviceFeeAmount + (parsedAmount * interestRate * parsedTenor);
    const monthly = totalRepayment / parsedTenor;

    const handleApprove = async () => {
        if (!notes) return alert('Decision notes required')
        setActioning(true)
        await onApprove({ approvedAmount: parsedAmount, duration: parsedTenor, notes, serviceFee: serviceFeeAmount, totalRepayable: totalRepayment })
        setActioning(false)
    }

    const handleReject = async () => {
        if (!notes) return alert('Decision notes required')
        setActioning(true)
        await onReject(notes)
        setActioning(false)
    }

    const handleRequestInfo = async () => {
        if (!notes) return alert('Message to applicant required')
        setActioning(true)
        await onRequestInfo(notes)
        setActioning(false)
    }

    const riskLevel = loan.internalRiskMetrics?.riskLevel || 'LOW';
    const recommendation = riskLevel === 'HIGH' || loan.affordability?.affordabilityTag === 'Not Affordable'
        ? { text: 'Recommend Reject', class: 'danger' }
        : riskLevel === 'MEDIUM' || loan.affordability?.affordabilityTag === 'Tight'
            ? { text: 'Manual Review Required', class: 'warning' }
            : { text: 'Recommend Approve', class: 'success' }

    return (
        <div className="detail-column column-decision sticky-panel">

            {loan.status !== 'pending' && loan.status !== 'incomplete' ? (
                <div className="detail-card">
                    <h2>Decision Already Made</h2>
                    <div className="mt-2 text-sm">
                        Current status: <strong className="capitalize">{loan.status}</strong>
                    </div>
                    <div className="mt-2 text-sm" style={{ marginBottom: '10px' }}>
                        Actioned by: {loan.owner || 'System'}
                    </div>
                    <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '4px', fontSize: '0.85rem' }}>
                        <strong>Decision History:</strong>
                        <p style={{ margin: '5px 0 0 0', fontStyle: 'italic' }}>"{loan.decisionNotes || 'Approved automatically based on criteria.'}"</p>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '5px' }}>{new Date().toLocaleString()}</span>
                    </div>
                </div>
            ) : (
                <>
                    <div className={`recommendation-header bg-${recommendation.class}-subtle border-${recommendation.class}`}>
                        <div className={`text-${recommendation.class} font-bold text-lg`}>{recommendation.text}</div>
                        <div className="text-xs text-muted mt-1">Based on affordability and risk flags</div>
                    </div>

                    <div className="decision-tabs mt-4">
                        <button className={`tab-btn ${activeTab === 'decision' ? 'active' : ''}`} onClick={() => setActiveTab('decision')}>Final Decision</button>
                        <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>Request Info</button>
                    </div>

                    {activeTab === 'decision' ? (
                        <div className="detail-card mt-0 border-top-none border-top-radius-none">
                            <h3>Offer Builder</h3>

                            <div className="mt-3">
                                <MoneyInput
                                    label="Approved Amount"
                                    value={amount}
                                    onChange={v => setAmount(v)}
                                />
                            </div>

                            <div className="input-group mt-3">
                                <label className="input-label">Tenor (Months)</label>
                                <select className="select" value={tenor} onChange={e => setTenor(e.target.value)}>
                                    <option value="1">1 Month</option>
                                    <option value="3">3 Months</option>
                                    <option value="6">6 Months</option>
                                    <option value="9">9 Months</option>
                                    <option value="12">12 Months</option>
                                </select>
                            </div>

                            <div className="offer-preview mt-4 bg-sage-light p-3 border-radius-sm text-sm" style={{ borderLeft: '3px solid #10b981' }}>
                                <div className="flex-between mb-1">
                                    <span>Principal:</span>
                                    <strong>₦{parsedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                                </div>
                                <div className="flex-between mb-1">
                                    <span>Service Fee ({(serviceFeePct * 100).toFixed(1)}%):</span>
                                    <strong>₦{serviceFeeAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                                </div>
                                <div className="flex-between mb-1" style={{ borderBottom: '1px dotted #cbd5e1', paddingBottom: '4px' }}>
                                    <span>Interest Rate:</span>
                                    <strong>{(interestRate * 100).toFixed(1)}% / mo</strong>
                                </div>
                                <div className="flex-between mb-1 pt-1">
                                    <span>Total Repayable:</span>
                                    <strong>₦{totalRepayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                                </div>
                                <div className="flex-between text-primary font-bold mt-2 pt-2 border-top">
                                    <span>Monthly Installment:</span>
                                    <span>₦{monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                            </div>

                            <div className="input-group mt-4">
                                <label className="input-label">Decision Notes (Required)</label>
                                <textarea
                                    className="input min-h-24"
                                    placeholder="Justification for approval or rejection..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="action-buttons mt-4 flex gap-2">
                                <button
                                    className="button button--primary flex-1 bg-success border-success"
                                    onClick={handleApprove}
                                    disabled={actioning || !notes}
                                >
                                    ✓ Approve
                                </button>
                                <button
                                    className="button button--primary flex-1 bg-error border-error"
                                    onClick={handleReject}
                                    disabled={actioning || !notes}
                                >
                                    ✕ Reject
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="detail-card mt-0 border-top-none border-top-radius-none">
                            <h3>Request More Information</h3>
                            <p className="text-sm text-muted mb-3">
                                Send application back to user for corrections or additional documents.
                            </p>

                            <div className="input-group mt-2">
                                <label className="input-label">Message to Applicant (Required)</label>
                                <textarea
                                    className="input min-h-24"
                                    placeholder="E.g. Please upload a clearer copy of your ID card..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                ></textarea>
                            </div>

                            <button
                                className="button button--secondary w-full mt-4"
                                onClick={handleRequestInfo}
                                disabled={actioning || !notes}
                            >
                                Send Request to Applicant
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
