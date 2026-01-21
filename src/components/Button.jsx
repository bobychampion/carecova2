export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  className = '',
  disabled = false,
  ...props
}) {
  const baseStyles = 'button'
  const variantStyles = {
    primary: 'button--primary',
    secondary: 'button--secondary',
    ghost: 'button--ghost',
    light: 'button--light',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
