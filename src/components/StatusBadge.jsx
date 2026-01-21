export default function StatusBadge({ status, className = '' }) {
  const statusConfig = {
    pending: { label: 'Pending', class: 'status--pending' },
    approved: { label: 'Approved', class: 'status--approved' },
    rejected: { label: 'Rejected', class: 'status--rejected' },
    active: { label: 'Active', class: 'status--active' },
    completed: { label: 'Completed', class: 'status--completed' },
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <span className={`status-badge ${config.class} ${className}`}>
      {config.label}
    </span>
  )
}
