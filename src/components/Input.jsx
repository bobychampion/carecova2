import { useState } from 'react'
import { validateEmail, validatePhone, validateRequired, validateAmount } from '../utils/validation'

export default function Input({
  label,
  error,
  className = '',
  validate,
  validateOnBlur = true,
  validateOnChange = false,
  ...props
}) {
  const [localError, setLocalError] = useState('')
  const [hasBlurred, setHasBlurred] = useState(false)

  const handleBlur = (e) => {
    setHasBlurred(true)
    if (validateOnBlur && validate) {
      let validationError = ''
      const value = e.target.value

      if (props.type === 'email') {
        validationError = validateEmail(value)
      } else if (props.type === 'tel') {
        validationError = validatePhone(value)
      } else if (props.type === 'number' && props.min) {
        validationError = validateAmount(value)
      } else if (props.required) {
        validationError = validateRequired(value, label || 'This field')
      }

      setLocalError(validationError)
    }
    if (props.onBlur) {
      props.onBlur(e)
    }
  }

  const handleChange = (e) => {
    if (validateOnChange && hasBlurred && validate) {
      let validationError = ''
      const value = e.target.value

      if (props.type === 'email') {
        validationError = validateEmail(value)
      } else if (props.type === 'tel') {
        validationError = validatePhone(value)
      } else if (props.type === 'number' && props.min) {
        validationError = validateAmount(value)
      } else if (props.required) {
        validationError = validateRequired(value, label || 'This field')
      }

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
      <input
        className={`input ${displayError ? 'input--error' : ''}`}
        {...props}
        onBlur={handleBlur}
        onChange={handleChange}
      />
      {displayError && (
        <span className="input-error">
          <span className="input-error-icon">⚠</span>
          {displayError}
        </span>
      )}
    </label>
  )
}
