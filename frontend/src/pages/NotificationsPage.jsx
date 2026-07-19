import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as notificationAPI from '../services/notificationService'
import websocketService from '../services/websocketService'
import { Button, Badge } from '../components/ui'
import { 
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiTrash2,
  FiUserPlus,
  FiMessageCircle,
  FiUsers,
  FiAtSign
} from 'react-icons/fi'

function NotificationsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadNotifications()
    
    // Subscribe to real-time notifications
    if (user && websocketService.isConnected()) {
      websocketService.subscribe(`/topic/notifications/${user.id}`, (notification) => {
        setNotifications((prev) => [notification, ...prev])
      })
    }
    
    return () => {
      if (user) {
        websocketService.unsubscribe(`/topic/notifications/${user.id}`)
      }
    }
  }, [user])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const data = await notificationAPI.getNotifications()
      setNotifications(data)
    } catch (err) {
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      )
      // Trigger event for MainLayout to update count
      window.dispatchEvent(new CustomEvent('notification-count-update'))
    } catch (err) {
      console.error('Failed to mark as read:', err)
      setError('Failed to mark notification as read')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setError('')
      // Trigger event for MainLayout to update count
      window.dispatchEvent(new CustomEvent('notification-count-update'))
    } catch (err) {
      console.error('Failed to mark all as read:', err)
      setError('Failed to mark all as read')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleDelete = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId)
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      setError('')
      // Trigger event for MainLayout to update count
      window.dispatchEvent(new CustomEvent('notification-count-update'))
    } catch (err) {
      console.error('Failed to delete notification:', err)
      setError('Failed to delete notification')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      handleMarkAsRead(notification.id)
    }

    // Navigate based on type
    if (notification.referenceType === 'FRIEND_REQUEST') {
      navigate('/friend-requests')
    } else if (notification.referenceType === 'CONVERSATION') {
      navigate(`/chat/${notification.referenceId}`)
    } else if (notification.referenceType === 'USER') {
      navigate('/friends')
    }
  }

  const getNotificationIcon = (type) => {
    const iconProps = "w-5 h-5"
    switch (type) {
      case 'FRIEND_REQUEST':
        return <FiUserPlus className={`${iconProps} text-blue-600 dark:text-blue-400`} />
      case 'FRIEND_REQUEST_ACCEPTED':
        return <FiCheckCircle className={`${iconProps} text-emerald-600 dark:text-emerald-400`} />
      case 'NEW_MESSAGE':
        return <FiMessageCircle className={`${iconProps} text-purple-600 dark:text-purple-400`} />
      case 'MENTION':
        return <FiAtSign className={`${iconProps} text-orange-600 dark:text-orange-400`} />
      case 'GROUP_INVITE':
        return <FiUsers className={`${iconProps} text-blue-600 dark:text-blue-400`} />
      default:
        return <FiBell className={`${iconProps} text-gray-600 dark:text-gray-400`} />
    }
  }

  const getNotificationBgColor = (type) => {
    switch (type) {
      case 'FRIEND_REQUEST':
        return 'bg-blue-100 dark:bg-blue-900/20'
      case 'FRIEND_REQUEST_ACCEPTED':
        return 'bg-emerald-100 dark:bg-emerald-900/20'
      case 'NEW_MESSAGE':
        return 'bg-purple-100 dark:bg-purple-900/20'
      case 'MENTION':
        return 'bg-orange-100 dark:bg-orange-900/20'
      case 'GROUP_INVITE':
        return 'bg-blue-100 dark:bg-blue-900/20'
      default:
        return 'bg-gray-100 dark:bg-gray-700'
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white font-poppins">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="md"
              onClick={handleMarkAllAsRead}
              leftIcon={FiCheckCircle}
              className="hidden sm:flex"
            >
              Mark all as read
            </Button>
          )}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="sm:hidden w-10 h-10 flex items-center justify-center rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              title="Mark all as read"
            >
              <FiCheckCircle className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm animate-shake">
          {error}
        </div>
      )}

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mb-6">
              <FiBell className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm">
              We'll notify you when something interesting happens
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`relative p-4 lg:p-5 flex items-start gap-4 cursor-pointer transition-all group ${
                  !notification.isRead
                    ? 'bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${getNotificationBgColor(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`font-semibold text-gray-900 dark:text-white ${!notification.isRead ? 'font-bold' : ''}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {notification.message}
                  </p>
                  {!notification.isRead && (
                    <Badge variant="primary" size="sm" dot>
                      New
                    </Badge>
                  )}
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(notification.id)
                  }}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete notification"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>

                {/* Unread Indicator */}
                {!notification.isRead && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-emerald-600 dark:bg-emerald-400 rounded-r"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage
