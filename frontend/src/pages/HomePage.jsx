import { useAuth } from '../context/AuthContext'
import './HomePage.css'

function HomePage() {
  const { user } = useAuth()

  return (
    <div className="home-page">
      <h2>Welcome to Chat Application, {user?.name}!</h2>
      <p>You are successfully logged in.</p>
      <div className="info-card">
        <h3>Project Status</h3>
        <p>✅ Milestone 0: Project Setup - Complete</p>
        <p>✅ Milestone 1: Authentication - Complete</p>
        <p>🚀 Ready for Milestone 2!</p>
        
        <div className="user-info">
          <h3>Your Profile</h3>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>User ID:</strong> {user?.id}</p>
        </div>
      </div>
    </div>
  )
}

export default HomePage
