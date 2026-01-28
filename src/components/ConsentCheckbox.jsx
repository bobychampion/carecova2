export default function ConsentCheckbox({
  id,
  label,
  required = false,
  checked,
  onChange,
  error,
  description,
}) {
  return (
    <div className="consent-checkbox-group">
      <label className="consent-checkbox-label">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          required={required}
          className={`consent-checkbox ${error ? 'consent-checkbox--error' : ''}`}
        />
        <span className="consent-checkbox-text">
          {required && <span className="required-asterisk">*</span>}
          {label}
        </span>
      </label>
      {description && <p className="consent-description">{description}</p>}
      {error && <span className="input-error">{error}</span>}
    </div>
  )
}
