import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import SearchUsersPage from './pages/SearchUsersPage'
import FriendsPage from './pages/FriendsPage'
import FriendRequestsPage from './pages/FriendRequestsPage'
import ChatsPage from './pages/ChatsPage'
import ChatPage from './pages/ChatPage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'
import CallHistoryPage from './pages/CallHistoryPage'
import SearchMessagesPage from './pages/SearchMessagesPage'
import NotFoundPage from './pages/NotFoundPage'
import TestPage from './pages/TestPage'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'
import './theme.css'
import './responsive.css'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<MainLayout />}>
            <Route index element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="search" element={
              <ProtectedRoute>
                <SearchUsersPage />
              </ProtectedRoute>
            } />
            <Route path="friends" element={
              <ProtectedRoute>
                <FriendsPage />
              </ProtectedRoute>
            } />
            <Route path="friend-requests" element={
              <ProtectedRoute>
                <FriendRequestsPage />
              </ProtectedRoute>
            } />
            <Route path="chats" element={
              <ProtectedRoute>
                <ChatsPage />
              </ProtectedRoute>
            } />
            <Route path="chat/:conversationId" element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } />
            <Route path="notifications" element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } />
            <Route path="settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="calls" element={
              <ProtectedRoute>
                <CallHistoryPage />
              </ProtectedRoute>
            } />
            <Route path="search-messages" element={
              <ProtectedRoute>
                <SearchMessagesPage />
              </ProtectedRoute>
            } />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="test" element={<TestPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  </Router>
</ErrorBoundary>
  )
}

export default App
