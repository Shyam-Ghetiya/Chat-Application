import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import * as notificationAPI from '../services/notificationService'
import websocketService from '../services/websocketService'
import './MainLayout.css'

function MainLayout() {
  const { isAuthenticated, user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [unreadCount, setUnreadCount] = useState(0)
  const location = useLocation()
  
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUnreadCount()
      
      // Subscribe to notifications
      if (websocketService.isConnected()) {
        websocketService.subscribe(`/topic/notifications/${user.id}`, () => {
          fetchUnreadCount()
        })
      }
      
      // Listen for notification count updates
      const handleCountUpdate = () => {
        fetchUnreadCount()
      }
      window.addEventListener('notification-count-update', handleCountUpdate)
      
      return () => {
        if (user) {
          websocketService.unsubscribe(`/topic/notifications/${user.id}`)
        }
        window.removeEventListener('notification-count-update', handleCountUpdate)
      }
    }
  }, [isAuthenticated, user])
  
  // Refresh count when navigating away from notifications page
  useEffect(() => {
    if (isAuthenticated && user && location.pathname !== '/notifications') {
      // Add a small delay to allow for marking as read
      const timer = setTimeout(() => {
        fetchUnreadCount()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [location.pathname, isAuthenticated, user])
  
  const fetchUnreadCount = async () => {
    try {
      const data = await notificationAPI.getUnreadCount()
      setUnreadCount(data.count || 0)
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
    }
  }

  return (
    <div className="main-layout">
      <header className="header">
        <div className="container">
          <h1>Chat Application</h1>
          <nav>
            <Link to="/">Home</Link>
            {!isAuthenticated ? (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            ) : (
              <>
                <Link to="/chats">Chats</Link>
                <Link to="/friends">Friends</Link>
                <Link to="/calls">Calls</Link>
                <Link to="/search">Search</Link>
                <Link to="/search-messages">Search Messages</Link>
                <Link to="/notifications" className="notification-link">
                  <span className="notification-bell">🔔</span>
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                </Link>
                <button onClick={toggleTheme} className="theme-toggle" title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
                <Link to="/settings">Settings</Link>
                <Link to="/profile">Profile</Link>
                <span className="user-name">Hello, {user?.name}</span>
                <button onClick={logout} className="logout-btn">Logout</button>
              </>
            )}
          </nav>
        </div>
      </header>
      
      <main className="main-content">
        <div className="container">
          <Outlet />
        </div>
      </main>
      
      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 Chat Application. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout
