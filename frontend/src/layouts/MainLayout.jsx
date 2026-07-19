import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import * as notificationAPI from '../services/notificationService'
import websocketService from '../services/websocketService'
import { Avatar, Badge } from '../components/ui'
import {
  FiMessageCircle,
  FiUsers,
  FiPhone,
  FiSearch,
  FiBell,
  FiSettings,
  FiUser,
  FiLogOut,
  FiMoon,
  FiSun,
  FiMenu,
  FiX,
  FiHome
} from 'react-icons/fi'

function MainLayout() {
  const { isAuthenticated, user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  
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

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Navigation items
  const navItems = [
    { path: '/', label: 'Home', icon: FiHome },
    { path: '/chats', label: 'Chats', icon: FiMessageCircle },
    { path: '/friends', label: 'Friends', icon: FiUsers },
    { path: '/calls', label: 'Calls', icon: FiPhone },
    { path: '/search', label: 'Search', icon: FiSearch },
    { path: '/notifications', label: 'Notifications', icon: FiBell, badge: unreadCount },
  ]

  const bottomNavItems = [
    { path: '/settings', label: 'Settings', icon: FiSettings },
    { path: '/profile', label: 'Profile', icon: FiUser },
  ]

  const isActive = (path) => {
    return location.pathname === path
  }

  // If not authenticated, show simple layout
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <FiMessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  ChatVerse
                </span>
              </Link>
              
              <nav className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Register
                </Link>
              </nav>
            </div>
          </div>
        </header>
        
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    )
  }

  // Authenticated layout with sidebar
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
          <Link to="/" className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center hover:scale-105 transition-transform">
            <FiMessageCircle className="w-7 h-7 text-white" />
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 py-6 flex flex-col items-center gap-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              className={`relative w-14 h-14 flex items-center justify-center rounded-xl transition-all group ${
                isActive(item.path)
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title={item.label}
            >
              <item.icon className="w-6 h-6" />
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
              {/* Tooltip */}
              <span className="absolute left-full ml-4 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div className="py-4 flex flex-col items-center gap-2 border-t border-gray-200 dark:border-gray-700">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-14 h-14 flex items-center justify-center rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 transition-all group"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? <FiMoon className="w-6 h-6" /> : <FiSun className="w-6 h-6" />}
            <span className="absolute left-full ml-4 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </button>

          {bottomNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              className={`relative w-14 h-14 flex items-center justify-center rounded-xl transition-all group ${
                isActive(item.path)
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title={item.label}
            >
              <item.icon className="w-6 h-6" />
              <span className="absolute left-full ml-4 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {item.label}
              </span>
            </Link>
          ))}

          {/* User Avatar with Logout */}
          <div className="relative group">
            <button className="w-14 h-14 flex items-center justify-center">
              <Avatar
                name={user?.name}
                size="md"
                className="cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all"
              />
            </button>
            
            {/* Logout Tooltip */}
            <button
              onClick={handleLogout}
              className="absolute left-full ml-4 px-3 py-2 bg-red-500 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap flex items-center gap-2 hover:bg-red-600"
            >
              <FiLogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-40">
        <div className="h-full px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center">
              <FiMessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              ChatVerse
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Notifications Bell */}
            <Link
              to="/notifications"
              className="relative w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`lg:hidden fixed top-16 bottom-0 right-0 w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 z-50 transform transition-transform ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name} size="lg" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2">
          {[...navItems, ...bottomNavItems].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
                isActive(item.path)
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {item.badge > 0 && (
                <Badge variant="danger" size="sm">
                  {item.badge > 9 ? '9+' : item.badge}
                </Badge>
              )}
            </Link>
          ))}

          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            {theme === 'light' ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <FiLogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden lg:pt-0 pt-16">
        <div className="h-full overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default MainLayout
