import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as notificationAPI from '../services/notificationService'
import websocketService from '../services/websocketService'
import './NotificationsPage.css'

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
      setTimeout(() => setError(''), 3000) // Clear error after 3 seconds
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setError('') // Clear any existing errors
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
      setError('') // Clear any existing errors
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
    switch (type) {
      case 'FRIEND_REQUEST':
        return '👥'
      case 'FRIEND_REQUEST_ACCEPTED':
        return '✅'
      case 'NEW_MESSAGE':
        return '💬'
      case 'MENTION':
        return '@'
      case 'GROUP_INVITE':
        return '👥'
      default:
        return '🔔'
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
      <div className="notifications-page">
        <div className="loading">Loading notifications...</div>
      </div>
    )
  }

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <h2>Notifications</h2>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="btn-mark-all">
              Mark all as read
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {notifications.length === 0 ? (
          <div className="no-notifications">
            <div className="no-notifications-icon">🔔</div>
            <p>No notifications yet</p>
            <p className="no-notifications-subtitle">
              We'll notify you when something happens
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">{formatTime(notification.createdAt)}</div>
                </div>
                {!notification.isRead && <div className="notification-badge"></div>}
                <button
                  className="notification-delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(notification.id)
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage
