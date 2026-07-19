import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as conversationAPI from '../services/conversationService'
import CreateGroupModal from '../components/CreateGroupModal'
import './ChatsPage.css'

function ChatsPage() {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadConversations()
    
    // Fetch initial online statuses
    fetchOnlineStatuses()
    
    // Listen for presence updates
    const handlePresenceUpdate = (event) => {
      const update = event.detail
      setConversations((prevConvs) =>
        prevConvs.map((conv) => {
          if (conv.otherUser && conv.otherUser.id === update.id) {
            return {
              ...conv,
              otherUser: {
                ...conv.otherUser,
                isOnline: update.isOnline,
                lastSeen: update.lastSeen
              }
            }
          }
          return conv
        })
      )
    }
    
    window.addEventListener('presence-update', handlePresenceUpdate)
    
    return () => {
      window.removeEventListener('presence-update', handlePresenceUpdate)
    }
  }, [])
  
  const fetchOnlineStatuses = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8080/api/presence/online', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const onlineMap = await response.json()
        
        // Update conversations with online status
        setConversations((prevConvs) =>
          prevConvs.map((conv) => {
            if (conv.otherUser && onlineMap[conv.otherUser.id]) {
              return {
                ...conv,
                otherUser: {
                  ...conv.otherUser,
                  isOnline: true
                }
              }
            }
            return conv
          })
        )
      }
    } catch (err) {
      console.error('Failed to fetch online statuses:', err)
    }
  }

  const loadConversations = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await conversationAPI.getConversations()
      setConversations(data)
    } catch (err) {
      setError('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChat = (conversationId) => {
    navigate(`/chat/${conversationId}`)
  }
  
  const handleCreateGroup = async (groupName, memberIds) => {
    try {
      const newConversation = await conversationAPI.createConversation('group', memberIds, groupName)
      setConversations((prev) => [newConversation, ...prev])
      navigate(`/chat/${newConversation.id}`)
    } catch (err) {
      throw new Error(err.message || 'Failed to create group')
    }
  }

  const getConversationDisplay = (conversation) => {
    if (conversation.type === 'DIRECT' && conversation.otherUser) {
      return {
        name: conversation.otherUser.name,
        picture: conversation.otherUser.profilePicture,
        initial: conversation.otherUser.name.charAt(0).toUpperCase(),
        isOnline: conversation.otherUser.isOnline
      }
    }
    
    return {
      name: conversation.name || 'Group Chat',
      picture: null,
      initial: conversation.name ? conversation.name.charAt(0).toUpperCase() : 'G',
      isOnline: false
    }
  }

  if (loading) {
    return (
      <div className="chats-page">
        <div className="loading">Loading chats...</div>
      </div>
    )
  }

  return (
    <div className="chats-page">
      <div className="chats-container">
        <div className="chats-header">
          <h2>Messages</h2>
          <button onClick={() => setShowCreateGroupModal(true)} className="btn-create-group">
            + Create Group
          </button>
        </div>
        
        <p className="chats-count">{conversations.length} conversations</p>

        {error && <div className="error-message">{error}</div>}

        <div className="conversations-list">
          {conversations.length > 0 ? (
            conversations.map(conversation => {
              const display = getConversationDisplay(conversation)
              
              return (
                <div
                  key={conversation.id}
                  className="conversation-item"
                  onClick={() => handleOpenChat(conversation.id)}
                >
                  <div className="conversation-avatar">
                    {display.picture ? (
                      <img src={display.picture} alt={display.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {display.initial}
                      </div>
                    )}
                    {display.isOnline && (
                      <span className="online-indicator"></span>
                    )}
                  </div>

                  <div className="conversation-info">
                    <div className="conversation-header">
                      <h3>{display.name}</h3>
                      <span className="conversation-time">
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="conversation-preview">
                      {conversation.type === 'DIRECT' ? 'Direct message' : `${conversation.members.length} members`}
                    </p>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="no-conversations">
              <p>No conversations yet</p>
              <p>Start chatting with your friends!</p>
              <button onClick={() => navigate('/friends')} className="btn-primary">
                Go to Friends
              </button>
            </div>
          )}
        </div>
      </div>
      
      <CreateGroupModal 
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onCreate={handleCreateGroup}
      />
    </div>
  )
}

export default ChatsPage
