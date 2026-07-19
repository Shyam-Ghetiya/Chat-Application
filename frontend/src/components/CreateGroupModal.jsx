import { useState, useEffect } from 'react'
import * as friendAPI from '../services/friendService'
import './CreateGroupModal.css'

function CreateGroupModal({ isOpen, onClose, onCreate }) {
  const [groupName, setGroupName] = useState('')
  const [friends, setFriends] = useState([])
  const [selectedFriends, setSelectedFriends] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadFriends()
    }
  }, [isOpen])

  const loadFriends = async () => {
    setLoading(true)
    try {
      const data = await friendAPI.getFriends()
      setFriends(data)
    } catch (err) {
      setError('Failed to load friends')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFriend = (friendId) => {
    setSelectedFriends((prev) => {
      if (prev.includes(friendId)) {
        return prev.filter(id => id !== friendId)
      } else {
        return [...prev, friendId]
      }
    })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    
    if (!groupName.trim()) {
      setError('Please enter a group name')
      return
    }
    
    if (selectedFriends.length === 0) {
      setError('Please select at least one friend')
      return
    }

    setLoading(true)
    setError('')

    try {
      await onCreate(groupName, selectedFriends)
      // Reset form
      setGroupName('')
      setSelectedFriends([])
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create group')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setGroupName('')
    setSelectedFriends([])
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Group Chat</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              maxLength={50}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Select Friends ({selectedFriends.length} selected)</label>
            {error && <div className="error-message">{error}</div>}
            
            <div className="friends-list">
              {loading ? (
                <div className="loading">Loading friends...</div>
              ) : friends.length === 0 ? (
                <div className="no-friends">No friends available</div>
              ) : (
                friends.map(friend => (
                  <div 
                    key={friend.id} 
                    className={`friend-item ${selectedFriends.includes(friend.id) ? 'selected' : ''}`}
                    onClick={() => handleToggleFriend(friend.id)}
                  >
                    <div className="friend-avatar">
                      {friend.profilePicture ? (
                        <img src={friend.profilePicture} alt={friend.name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {friend.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="friend-info">
                      <h4>{friend.name}</h4>
                      <p>{friend.email}</p>
                    </div>
                    <div className="checkbox">
                      {selectedFriends.includes(friend.id) && '✓'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={handleClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading || !groupName.trim() || selectedFriends.length === 0}>
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateGroupModal
