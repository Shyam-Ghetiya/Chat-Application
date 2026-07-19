const Card = ({ 
  children, 
  className = '',
  hover = false,
  padding = 'normal',
  onClick,
  ...props 
}) => {
  const baseStyles = 'bg-white dark:bg-dark-800 rounded-2xl shadow-soft transition-all duration-200'
  const hoverStyles = hover ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : ''
  const clickStyles = onClick ? 'cursor-pointer active:scale-98' : ''
  
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    normal: 'p-6',
    lg: 'p-8',
  }
  
  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${hoverStyles} ${clickStyles} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
