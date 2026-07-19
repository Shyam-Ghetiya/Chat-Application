import { useState, useEffect } from 'react'
import * as friendAPI from '../services/friendService'
import './FriendRequestsPage.css'

function FriendRequestsPage() {
  const [pendingRequests, setPendingRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('received') // 'received' or 'sent'

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    setLoading(true)
    setError('')

    try {
      const [pending, sent] = await Promise.all([
        friendAPI.getPendingRequests(),
        friendAPI.getSentRequests()
      ])
      
      setPendingRequests(pending)
      setSentRequests(sent)
    } catch (err) {
      setError('Failed to load friend requests')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (requestId) => {
    try {
      await friendAPI.acceptFriendRequest(requestId)
      setSuccess('Friend request accepted!')
      loadRequests()
    } catch (err) {
      setError('Failed to accept friend request')
    }
  }

  const handleReject = async (requestId) => {
    try {
      await friendAPI.rejectFriendRequest(requestId)
      setSuccess('Friend request rejected')
      loadRequests()
    } catch (err) {
      setError('Failed to reject friend request')
    }
  }

  const handleCancel = async (requestId) => {
    try {
      await friendAPI.cancelFriendRequest(requestId)
      setSuccess('Friend request cancelled')
      loadRequests()
    } catch (err) {
      setError('Failed to cancel friend request')
    }
  }

  const renderUserCard = (user) => (
    <div className="user-mini">
      <div className="user-avatar-small">
        {user.profilePicture ? (
          <img src={user.profilePicture} alt={user.name} />
        ) : (
          <div className="avatar-placeholder-small">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="user-details">
        <h4>{user.name}</h4>
        <p>{user.email}</p>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="friend-requests-page">
        <div className="loading">Loading requests...</div>
      </div>
    )
  }

  return (
    <div className="friend-requests-page">
      <div className="requests-container">
        <h2>Friend Requests</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'received' ? 'active' : ''}`}
            onClick={() => setActiveTab('received')}
          >
            Received ({pendingRequests.length})
          </button>
          <button
            className={`tab ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            Sent ({sentRequests.length})
          </button>
        </div>

        <div className="requests-list">
          {activeTab === 'received' ? (
            pendingRequests.length > 0 ? (
              pendingRequests.map(request => (
                <div key={request.id} className="request-card">
                  {renderUserCard(request.sender)}
                  <div className="request-actions">
                    <button
                      onClick={() => handleAccept(request.id)}
                      className="btn-accept"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="btn-reject"
                    >
                      Reject
                    </button>
                  </div>
                  <div className="request-time">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-requests">No pending friend requests</p>
            )
          ) : (
            sentRequests.length > 0 ? (
              sentRequests.map(request => (
                <div key={request.id} className="request-card">
                  {renderUserCard(request.receiver)}
                  <div className="request-actions">
                    <button
                      onClick={() => handleCancel(request.id)}
                      className="btn-cancel"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="request-time">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-requests">No sent friend requests</p>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default FriendRequestsPage
