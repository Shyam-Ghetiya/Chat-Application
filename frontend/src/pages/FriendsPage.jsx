import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as friendAPI from '../services/friendService'
import * as conversationAPI from '../services/conversationService'
import './FriendsPage.css'

function FriendsPage() {
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadFriends()
    
    // Listen for presence updates
    const handlePresenceUpdate = (event) => {
      const update = event.detail
      console.log('Presence update received:', update)
      setFriends((prevFriends) =>
        prevFriends.map((friend) =>
          friend.id === update.id
            ? { ...friend, isOnline: update.isOnline, lastSeen: update.lastSeen }
            : friend
        )
      )
    }
    
    window.addEventListener('presence-update', handlePresenceUpdate)
    
    return () => {
      window.removeEventListener('presence-update', handlePresenceUpdate)
    }
  }, [])

  const loadFriends = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await friendAPI.getFriends()
      setFriends(data)
      
      // Fetch online statuses after friends are loaded
      await fetchOnlineStatuses(data)
    } catch (err) {
      setError('Failed to load friends')
    } finally {
      setLoading(false)
    }
  }
  
  const fetchOnlineStatuses = async (friendsList) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8080/api/presence/online', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const onlineMap = await response.json()
        console.log('Online users:', onlineMap)
        
        // Update friends with online status
        const updatedFriends = (friendsList || friends).map((friend) => ({
          ...friend,
          isOnline: onlineMap[friend.id] === true
        }))
        
        setFriends(updatedFriends)
      }
    } catch (err) {
      console.error('Failed to fetch online statuses:', err)
    }
  }

  const handleStartChat = async (friendId) => {
    try {
      // Create or get existing conversation
      const conversation = await conversationAPI.createConversation('DIRECT', [friendId])
      navigate(`/chat/${conversation.id}`)
    } catch (err) {
      setError('Failed to start conversation')
    }
  }

  if (loading) {
    return (
      <div className="friends-page">
        <div className="loading">Loading friends...</div>
      </div>
    )
  }

  return (
    <div className="friends-page">
      <div className="friends-container">
        <h2>My Friends ({friends.length})</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="friends-list">
          {friends.length > 0 ? (
            friends.map(friend => (
              <div key={friend.id} className="friend-card">
                <div className="friend-avatar">
                  {friend.profilePicture ? (
                    <img src={friend.profilePicture} alt={friend.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {friend.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className={`status-indicator ${friend.isOnline ? 'online' : 'offline'}`}></span>
                </div>
                
                <div className="friend-info">
                  <h3>{friend.name}</h3>
                  <p className="friend-email">{friend.email}</p>
                  {friend.about && <p className="friend-about">{friend.about}</p>}
                  <div className="friend-status">
                    <span className={`status-text ${friend.isOnline ? 'online' : 'offline'}`}>
                      {friend.isOnline ? '● Online' : '○ Offline'}
                    </span>
                  </div>
                </div>
                
                <div className="friend-actions">
                  <button 
                    className="btn-chat" 
                    onClick={() => handleStartChat(friend.id)}
                  >
                    Chat
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-friends">
              <p>You don't have any friends yet.</p>
              <p>Search for users and send friend requests to connect!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FriendsPage
