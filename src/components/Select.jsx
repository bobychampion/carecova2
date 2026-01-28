import { useState } from 'react'
import { validateRequired } from '../utils/validation'

export default function Select({
  label,
  error,
  options = [],
  className = '',
  validate,
  validateOnBlur = true,
  ...props
}) {
  const [localError, setLocalError] = useState('')
  const [hasBlurred, setHasBlurred] = useState(false)

  const handleBlur = (e) => {
    setHasBlurred(true)
    if (validateOnBlur && validate && props.required) {
      const validationError = validateRequired(e.target.value, label || 'This field')
      setLocalError(validationError)
    }
    if (props.onBlur) {
      props.onBlur(e)
    }
  }

  const handleChange = (e) => {
    if (hasBlurred && validate && props.required) {
      const validationError = validateRequired(e.target.value, label || 'This field')
      setLocalError(validationError)
    }
    if (props.onChange) {
      props.onChange(e)
    }
  }

  const displayError = error || localError

  return (
    <label className={`input-group ${className}`}>
      {label && <span className="input-label">{label}</span>}
      <select
        className={`select ${displayError ? 'select--error' : ''}`}
        {...props}
        onBlur={handleBlur}
        onChange={handleChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {displayError && (
        <span className="input-error">
          <span className="input-error-icon">⚠</span>
          {displayError}
        </span>
      )}
    </label>
  )
}
