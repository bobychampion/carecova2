import { Lock } from 'lucide-react'

export default function SecurityBadge({ variant = 'default' }) {
  if (variant === 'inline') {
    return (
      <div className="security-badge-inline">
        <span className="security-icon"><Lock size={16} /></span>
        <span>Payments secured via wallet & direct integrations</span>
      </div>
    )
  }

  return (
    <div className="security-badge">
      <div className="security-badge-icon"><Lock size={24} /></div>
      <div className="security-badge-content">
        <h4>Secure Payments</h4>
        <p>Payments secured via wallet & direct integrations</p>
      </div>
    </div>
  )
}
