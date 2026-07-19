import { forwardRef, useState } from 'react'

const Input = forwardRef(({ 
  label,
  error,
  type = 'text',
  placeholder,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  disabled = false,
  className = '',
  containerClassName = '',
  showPasswordToggle = false,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  
  const inputType = showPasswordToggle && showPassword ? 'text' : type
  
  const baseStyles = 'w-full px-4 py-3 rounded-xl border transition-all duration-200 outline-none focus:ring-2'
  const normalStyles = 'border-gray-300 focus:border-primary-500 focus:ring-primary-200 dark:bg-dark-800 dark:border-dark-600 dark:text-white dark:focus:border-primary-500'
  const errorStyles = 'border-red-500 focus:border-red-500 focus:ring-red-200'
  const disabledStyles = 'bg-gray-100 cursor-not-allowed dark:bg-dark-900'
  
  const iconPaddingLeft = icon && iconPosition === 'left' ? 'pl-11' : ''
  const iconPaddingRight = icon && iconPosition === 'right' ? 'pr-11' : ''
  const passwordTogglePadding = showPasswordToggle ? 'pr-11' : ''
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            ${baseStyles}
            ${error ? errorStyles : normalStyles}
            ${disabled ? disabledStyles : ''}
            ${iconPaddingLeft}
            ${iconPaddingRight}
            ${passwordTogglePadding}
            ${className}
          `}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}
        
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-slide-down">
          {error}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
