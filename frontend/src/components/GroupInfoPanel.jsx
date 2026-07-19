import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import * as conversationAPI from '../services/conversationService'
import * as friendAPI from '../services/friendService'
import './GroupInfoPanel.css'

function GroupInfoPanel({ conversation, onUpdate, onLeave, onDelete }) {
  const { user } = useAuth()
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(conversation?.name || '')
  const [showAddMember, setShowAddMember] = useState(false)
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (showAddMember) {
      loadAvailableFriends()
    }
  }, [showAddMember])

  const loadAvailableFriends = async () => {
    setLoading(true)
    try {
      const allFriends = await friendAPI.getFriends()
      // Filter out friends who are already members
      const memberIds = conversation.members.map(m => m.id)
      const available = allFriends.filter(f => !memberIds.includes(f.id))
      setFriends(available)
    } catch (err) {
      setError('Failed to load friends')
    } finally {
      setLoading(false)
    }
  }

  const handleRename = async () => {
    if (!newName.trim() || newName === conversation.name) {
      setIsRenaming(false)
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const updated = await conversationAPI.renameGroup(conversation.id, newName)
      onUpdate(updated)
      setIsRenaming(false)
    } catch (err) {
      setError('Failed to rename group')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (friendId) => {
    setLoading(true)
    setError('')
    
    try {
      const updated = await conversationAPI.addMember(conversation.id, friendId)
      onUpdate(updated)
      setShowAddMember(false)
    } catch (err) {
      setError('Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove this member from the group?')) return
    
    setLoading(true)
    setError('')
    
    try {
      const updated = await conversationAPI.removeMember(conversation.id, memberId)
      onUpdate(updated)
    } catch (err) {
      setError('Failed to remove member')
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveGroup = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return
    
    setLoading(true)
    setError('')
    
    try {
      await conversationAPI.leaveGroup(conversation.id)
      onLeave()
    } catch (err) {
      setError('Failed to leave group')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGroup = async () => {
    if (!confirm('Are you sure you want to delete this group? This cannot be undone.')) return
    
    setLoading(true)
    setError('')
    
    try {
      await conversationAPI.deleteGroup(conversation.id)
      onDelete()
    } catch (err) {
      setError('Failed to delete group')
    } finally {
      setLoading(false)
    }
  }

  if (!conversation || conversation.type !== 'GROUP') return null

  return (
    <div className="group-info-panel">
      <div className="group-header">
        <h3>Group Info</h3>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="error-close">×</button>
        </div>
      )}

      {/* Group Name */}
      <div className="group-section">
        <label>Group Name</label>
        {isRenaming ? (
          <div className="rename-input-group">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={50}
              disabled={loading}
              autoFocus
            />
            <div className="rename-actions">
              <button onClick={handleRename} className="btn-save" disabled={loading}>
                Save
              </button>
              <button onClick={() => setIsRenaming(false)} className="btn-cancel" disabled={loading}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="group-name-display">
            <span>{conversation.name}</span>
            <button onClick={() => setIsRenaming(true)} className="btn-icon">
              ✏️
            </button>
          </div>
        )}
      </div>

      {/* Members List */}
      <div className="group-section">
        <div className="section-header">
          <label>Members ({conversation.members.length})</label>
          <button onClick={() => setShowAddMember(!showAddMember)} className="btn-add">
            + Add
          </button>
        </div>

        {showAddMember && (
          <div className="add-member-list">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : friends.length === 0 ? (
              <div className="no-friends">No friends available to add</div>
            ) : (
              friends.map(friend => (
                <div key={friend.id} className="friend-item">
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
                  </div>
                  <button 
                    onClick={() => handleAddMember(friend.id)} 
                    className="btn-add-small"
                    disabled={loading}
                  >
                    Add
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        <div className="members-list">
          {conversation.members.map(member => (
            <div key={member.id} className="member-item">
              <div className="member-avatar">
                {member.profilePicture ? (
                  <img src={member.profilePicture} alt={member.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="member-info">
                <h4>
                  {member.name}
                  {member.id === user?.id && <span className="you-badge"> (You)</span>}
                </h4>
                <p>{member.email}</p>
              </div>
              {member.id !== user?.id && (
                <button 
                  onClick={() => handleRemoveMember(member.id)} 
                  className="btn-remove"
                  disabled={loading}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Group Actions */}
      <div className="group-actions">
        <button onClick={handleLeaveGroup} className="btn-leave" disabled={loading}>
          Leave Group
        </button>
        <button onClick={handleDeleteGroup} className="btn-delete" disabled={loading}>
          Delete Group
        </button>
      </div>
    </div>
  )
}

export default GroupInfoPanel
