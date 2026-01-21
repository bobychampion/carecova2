export default function Select({
  label,
  error,
  options = [],
  className = '',
  ...props
}) {
  return (
    <label className={`input-group ${className}`}>
      {label && <span className="input-label">{label}</span>}
      <select className={`select ${error ? 'select--error' : ''}`} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="input-error">{error}</span>}
    </label>
  )
}
