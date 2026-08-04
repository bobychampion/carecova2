import { getStatusBadgeConfig } from '../utils/statusModel'

export default function StatusBadge({ status, financingStatus, className = '', context = 'admin' }) {
  const config = getStatusBadgeConfig(status, financingStatus, context)

  return (
    <span className={`status-badge ${config.className} ${className}`}>
      <span aria-hidden="true">{config.icon}</span>
      {config.label}
    </span>
  )
}
