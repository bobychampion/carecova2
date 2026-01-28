export default function ProgressBar({ value, max = 100, label, showPercentage = true }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className="progress-bar-component">
      {label && (
        <div className="progress-bar-header">
          <span>{label}</span>
          {showPercentage && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
