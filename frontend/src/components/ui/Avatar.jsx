const Avatar = ({ 
  src, 
  alt, 
  name,
  size = 'md',
  online = false,
  showOnlineStatus = false,
  className = '',
  ...props 
}) => {
  const sizes = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl',
    '2xl': 'w-24 h-24 text-3xl',
  }
  
  const statusSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
    '2xl': 'w-6 h-6',
  }
  
  const getInitials = (name) => {
    if (!name) return '?'
    const names = name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }
  
  return (
    <div className={`relative inline-block ${className}`} {...props}>
      <div className={`${sizes[size]} rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 text-white font-semibold shadow-md`}>
        {src ? (
          <img 
            src={src} 
            alt={alt || name || 'Avatar'} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div className={src ? 'hidden' : 'flex items-center justify-center w-full h-full'}>
          {getInitials(name || alt || '?')}
        </div>
      </div>
      
      {showOnlineStatus && (
        <span 
          className={`absolute bottom-0 right-0 ${statusSizes[size]} rounded-full border-2 border-white dark:border-dark-800 ${online ? 'bg-green-500' : 'bg-gray-400'}`}
          title={online ? 'Online' : 'Offline'}
        />
      )}
    </div>
  )
}

export default Avatar
