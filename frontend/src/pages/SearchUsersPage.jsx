import { useState } from 'react'
import * as friendAPI from '../services/friendService'
import './SearchUsersPage.css'

function SearchUsersPage() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!query.trim()) {
      setError('Please enter a search term')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const results = await friendAPI.searchUsers(query)
      setUsers(results)
      if (results.length === 0) {
        setError('No users found')
      }
    } catch (err) {
      setError('Failed to search users')
    } finally {
      setLoading(false)
    }
  }

  const handleSendRequest = async (userId) => {
    try {
      await friendAPI.sendFriendRequest(userId)
      setSuccess('Friend request sent!')
      
      // Update UI
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, friendshipStatus: 'PENDING_SENT' }
          : user
      ))
    } catch (err) {
      setError(err.message || 'Failed to send friend request')
    }
  }

  const handleCancelRequest = async (userId) => {
    try {
      const sentRequests = await friendAPI.getSentRequests()
      const request = sentRequests.find(r => r.receiver.id === userId)
      
      if (request) {
        await friendAPI.cancelFriendRequest(request.id)
        setSuccess('Friend request cancelled')
        
        // Update UI
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, friendshipStatus: 'NONE' }
            : user
        ))
      }
    } catch (err) {
      setError('Failed to cancel friend request')
    }
  }

  const getActionButton = (user) => {
    switch (user.friendshipStatus) {
      case 'FRIENDS':
        return <span className="status-badge friends">Friends</span>
      
      case 'PENDING_SENT':
        return (
          <button 
            onClick={() => handleCancelRequest(user.id)}
            className="btn-secondary btn-small"
          >
            Cancel Request
          </button>
        )
      
      case 'PENDING_RECEIVED':
        return <span className="status-badge pending">Request Pending</span>
      
      case 'NONE':
      default:
        return (
          <button 
            onClick={() => handleSendRequest(user.id)}
            className="btn-primary btn-small"
          >
            Add Friend
          </button>
        )
    }
  }

  return (
    <div className="search-users-page">
      <div className="search-container">
        <h2>Search Users</h2>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="users-list">
          {users.length > 0 ? (
            users.map(user => (
              <div key={user.id} className="user-card">
                <div className="user-avatar">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="user-info">
                  <h3>{user.name}</h3>
                  <p className="user-email">{user.email}</p>
                  {user.about && <p className="user-about">{user.about}</p>}
                  <span className={`online-status ${user.isOnline ? 'online' : 'offline'}`}>
                    {user.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                
                <div className="user-actions">
                  {getActionButton(user)}
                </div>
              </div>
            ))
          ) : !loading && query && (
            <p className="no-results">No users found. Try a different search term.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchUsersPage
