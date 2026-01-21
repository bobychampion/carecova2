export default function Input({
  label,
  error,
  className = '',
  ...props
}) {
  return (
    <label className={`input-group ${className}`}>
      {label && <span className="input-label">{label}</span>}
      <input className={`input ${error ? 'input--error' : ''}`} {...props} />
      {error && <span className="input-error">{error}</span>}
    </label>
  )
}
