import { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as authAPI from '../services/authService'
import websocketService from '../services/websocketService'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const navigate = useNavigate()

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const userData = await authAPI.getCurrentUser()
          setUser(userData)
          
          // Connect to WebSocket when user is loaded
          if (!websocketService.isConnected()) {
            try {
              await websocketService.connect(token)
              console.log('WebSocket connected automatically')
            } catch (err) {
              console.error('Failed to connect WebSocket:', err)
            }
          }
        } catch (error) {
          console.error('Failed to load user:', error)
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setLoading(false)
    }

    loadUser()
  }, [token])

  const login = async (email, password) => {
    const response = await authAPI.login(email, password)
    localStorage.setItem('token', response.token)
    setToken(response.token)
    setUser({ id: response.id, name: response.name, email: response.email })
    navigate('/')
    return response
  }

  const register = async (name, email, password) => {
    const response = await authAPI.register(name, email, password)
    localStorage.setItem('token', response.token)
    setToken(response.token)
    setUser({ id: response.id, name: response.name, email: response.email })
    navigate('/')
    return response
  }

  const logout = () => {
    // Disconnect WebSocket before logout
    websocketService.disconnect()
    
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    navigate('/login')
  }

  const updateUser = (updatedUserData) => {
    setUser((prevUser) => ({ ...prevUser, ...updatedUserData }))
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
