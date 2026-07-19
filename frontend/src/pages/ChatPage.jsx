import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as conversationAPI from '../services/conversationService'
import * as messageAPI from '../services/messageService'
import * as fileService from '../services/fileService'
import websocketService from '../services/websocketService'
import callService from '../services/callService'
import GroupInfoPanel from '../components/GroupInfoPanel'
import FilePreview from '../components/FilePreview'
import IncomingCallModal from '../components/IncomingCallModal'
import ActiveCallScreen from '../components/ActiveCallScreen'
import './ChatPage.css'

function ChatPage() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const [replyingTo, setReplyingTo] = useState(null)
  const [editingMessage, setEditingMessage] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showGroupInfo, setShowGroupInfo] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [incomingCall, setIncomingCall] = useState(null)
  const [activeCall, setActiveCall] = useState(null)
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadConversation()
    loadMessages()
    connectWebSocket()
    setupCallHandlers()
    
    // Listen for presence updates
    const handlePresenceUpdate = (event) => {
      const update = event.detail
      setConversation((prev) => {
        if (!prev) return prev
        
        // Update conversation if the other user's status changed
        if (prev.otherUser && prev.otherUser.id === update.id) {
          return {
            ...prev,
            otherUser: {
              ...prev.otherUser,
              isOnline: update.isOnline,
              lastSeen: update.lastSeen
            }
          }
        }
        
        return prev
      })
    }
    
    window.addEventListener('presence-update', handlePresenceUpdate)

    return () => {
      // Cleanup: unsubscribe from WebSocket topics
      websocketService.unsubscribe(`/topic/conversation/${conversationId}`)
      websocketService.unsubscribe(`/topic/conversation/${conversationId}/status`)
      websocketService.unsubscribe(`/topic/conversation/${conversationId}/typing`)
      websocketService.unsubscribe(`/topic/conversation/${conversationId}/edit`)
      websocketService.unsubscribe(`/topic/conversation/${conversationId}/delete`)
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // Remove presence listener
      window.removeEventListener('presence-update', handlePresenceUpdate)
    }
  }, [conversationId])

  const loadConversation = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await conversationAPI.getConversation(conversationId)
      setConversation(data)
      
      // Fetch online status for the other user
      if (data.otherUser) {
        fetchUserOnlineStatus(data.otherUser.id)
      }
    } catch (err) {
      setError('Failed to load conversation')
    } finally {
      setLoading(false)
    }
  }
  
  const fetchUserOnlineStatus = async (userId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:8080/api/presence/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setConversation((prev) => {
          if (!prev || !prev.otherUser) return prev
          return {
            ...prev,
            otherUser: {
              ...prev.otherUser,
              isOnline: data.isOnline
            }
          }
        })
      }
    } catch (err) {
      console.error('Failed to fetch user online status:', err)
    }
  }
  
  const setupCallHandlers = () => {
    // Set up call event handlers
    callService.onIncomingCall = (call) => {
      setIncomingCall(call)
    }
    
    callService.onCallEnded = () => {
      setActiveCall(null)
      setLocalStream(null)
      setRemoteStream(null)
    }
    
    callService.onRemoteStream = (stream) => {
      setRemoteStream(stream)
    }
    
    // Subscribe to call signals
    if (user) {
      callService.subscribeToCallSignals(user.id)
    }
  }
  
  const handleVoiceCall = async () => {
    if (!conversation?.otherUser) return
    
    try {
      const call = await callService.initiateCall(conversation.otherUser.id, 'VOICE')
      const stream = callService.localStream
      setActiveCall(call)
      setLocalStream(stream)
    } catch (err) {
      console.error('Failed to start voice call:', err)
      alert(err.message || 'Failed to start call. Please check your microphone permissions.')
    }
  }
  
  const handleVideoCall = async () => {
    if (!conversation?.otherUser) return
    
    try {
      const call = await callService.initiateCall(conversation.otherUser.id, 'VIDEO')
      const stream = callService.localStream
      setActiveCall(call)
      setLocalStream(stream)
    } catch (err) {
      console.error('Failed to start video call:', err)
      alert(err.message || 'Failed to start call. Please check your camera/microphone permissions.')
    }
  }
  
  const handleAcceptCall = async () => {
    if (!incomingCall) return
    
    try {
      await callService.answerCall(incomingCall.id)
      const stream = callService.localStream
      setActiveCall(incomingCall)
      setLocalStream(stream)
      setIncomingCall(null)
    } catch (err) {
      console.error('Failed to answer call:', err)
      alert(err.message || 'Failed to answer call')
      setIncomingCall(null)
    }
  }
  
  const handleRejectCall = async () => {
    if (!incomingCall) return
    
    try {
      await callService.rejectCall(incomingCall.id)
      setIncomingCall(null)
    } catch (err) {
      console.error('Failed to reject call:', err)
      setIncomingCall(null)
    }
  }
  
  const handleEndCall = async () => {
    if (!activeCall) return
    
    try {
      await callService.endCall(activeCall.id)
      setActiveCall(null)
      setLocalStream(null)
      setRemoteStream(null)
    } catch (err) {
      console.error('Failed to end call:', err)
    }
  }

  const loadMessages = async () => {
    try {
      const data = await messageAPI.getMessages(conversationId)
      setMessages(data)
      scrollToBottom()
      
      // Mark messages as seen when loaded
      await markMessagesAsSeen()
    } catch (err) {
      console.error('Failed to load messages:', err)
    }
  }
  
  const markMessagesAsSeen = async () => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`http://localhost:8080/api/conversations/${conversationId}/messages/seen`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
    } catch (err) {
      console.error('Failed to mark messages as seen:', err)
    }
  }

  const connectWebSocket = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Connect to WebSocket if not already connected
      if (!websocketService.isConnected()) {
        await websocketService.connect(token)
      }

      // Subscribe to this conversation's topic
      websocketService.subscribe(
        `/topic/conversation/${conversationId}`,
        (message) => {
          setMessages((prev) => [...prev, message])
          scrollToBottom()
          // Mark new messages as seen
          markMessagesAsSeen()
        }
      )
      
      // Subscribe to status updates
      websocketService.subscribe(
        `/topic/conversation/${conversationId}/status`,
        (statusUpdate) => {
          // Update message status in state
          setMessages((prev) => 
            prev.map(msg => 
              msg.id === statusUpdate.messageId 
                ? { ...msg, status: statusUpdate.status }
                : msg
            )
          )
        }
      )
      
      // Subscribe to typing indicators
      websocketService.subscribe(
        `/topic/conversation/${conversationId}/typing`,
        (typingIndicator) => {
          if (typingIndicator.userId !== user?.id) {
            if (typingIndicator.isTyping) {
              // Add user to typing list
              setTypingUsers((prev) => {
                if (!prev.find(u => u.userId === typingIndicator.userId)) {
                  return [...prev, typingIndicator]
                }
                return prev
              })
            } else {
              // Remove user from typing list
              setTypingUsers((prev) => prev.filter(u => u.userId !== typingIndicator.userId))
            }
          }
        }
      )
      
      // Subscribe to message edits
      websocketService.subscribe(
        `/topic/conversation/${conversationId}/edit`,
        (editedMessage) => {
          setMessages((prev) => 
            prev.map(msg => 
              msg.id === editedMessage.id ? editedMessage : msg
            )
          )
        }
      )
      
      // Subscribe to message deletes
      websocketService.subscribe(
        `/topic/conversation/${conversationId}/delete`,
        (deletedMessage) => {
          setMessages((prev) => 
            prev.map(msg => 
              msg.id === deletedMessage.id ? deletedMessage : msg
            )
          )
        }
      )
    } catch (err) {
      console.error('WebSocket connection failed:', err)
      setError('Real-time messaging unavailable. Messages will still be sent.')
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }
  
  const handleReply = (message) => {
    setReplyingTo(message)
    setEditingMessage(null)
  }
  
  const cancelReply = () => {
    setReplyingTo(null)
  }
  
  const handleEdit = (message) => {
    setEditingMessage(message)
    setNewMessage(message.content)
    setReplyingTo(null)
  }
  
  const cancelEdit = () => {
    setEditingMessage(null)
    setNewMessage('')
  }
  
  const handleDelete = async (messageId) => {
    if (!confirm('Delete this message?')) return
    
    try {
      const token = localStorage.getItem('token')
      await fetch(`http://localhost:8080/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    } catch (err) {
      console.error('Failed to delete message:', err)
      setError('Failed to delete message')
    }
  }
  
  const addEmoji = (emoji) => {
    setNewMessage((prev) => prev + emoji)
    setShowEmojiPicker(false)
  }
  
  const handleConversationUpdate = (updatedConversation) => {
    setConversation(updatedConversation)
  }
  
  const handleLeaveGroup = () => {
    navigate('/chats')
  }
  
  const handleDeleteGroup = () => {
    navigate('/chats')
  }
  
  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB')
      return
    }
    
    setUploadingFile(true)
    setError('')
    
    try {
      await fileService.uploadFile(file, conversationId)
      // Message will be added via WebSocket
    } catch (err) {
      console.error('Failed to upload file:', err)
      setError(err.message || 'Failed to upload file')
    } finally {
      setUploadingFile(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!newMessage.trim() || sending) return

    setSending(true)
    const messageContent = newMessage.trim()
    setNewMessage('')
    
    // Handle edit
    if (editingMessage) {
      try {
        const token = localStorage.getItem('token')
        await fetch(`http://localhost:8080/api/messages/${editingMessage.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: messageContent
          })
        })
        setEditingMessage(null)
      } catch (err) {
        console.error('Failed to edit message:', err)
        setError('Failed to edit message')
      } finally {
        setSending(false)
      }
      return
    }
    
    // Stop typing indicator
    if (websocketService.isConnected()) {
      websocketService.sendMessage('/app/typing', {
        conversationId: parseInt(conversationId),
        isTyping: false
      })
    }

    try {
      // Send via WebSocket
      if (websocketService.isConnected()) {
        websocketService.sendMessage('/app/chat.send', {
          conversationId: parseInt(conversationId),
          content: messageContent,
          messageType: 'TEXT',
          replyToId: replyingTo?.id || null
        })
        setReplyingTo(null)
      } else {
        // Fallback to REST API
        const sentMessage = await messageAPI.sendMessageREST(conversationId, messageContent)
        setMessages((prev) => [...prev, sentMessage])
        scrollToBottom()
        setReplyingTo(null)
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      setError('Failed to send message. Please try again.')
      setNewMessage(messageContent) // Restore message
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }
  
  const handleTyping = (value) => {
    setNewMessage(value)
    
    // Send typing indicator
    if (websocketService.isConnected()) {
      websocketService.sendMessage('/app/typing', {
        conversationId: parseInt(conversationId),
        isTyping: value.length > 0
      })
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // Stop typing after 2 seconds of no input
      if (value.length > 0) {
        typingTimeoutRef.current = setTimeout(() => {
          websocketService.sendMessage('/app/typing', {
            conversationId: parseInt(conversationId),
            isTyping: false
          })
        }, 2000)
      }
    }
  }

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })

    if (date.toDateString() === today.toDateString()) {
      return timeStr
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${timeStr}`
    } else {
      return `${date.toLocaleDateString()} ${timeStr}`
    }
  }

  const isOwnMessage = (message) => {
    return message.sender.id === user?.id
  }
  
  const getStatusIcon = (status) => {
    switch(status) {
      case 'SENT':
        return '✓'
      case 'DELIVERED':
        return '✓✓'
      case 'SEEN':
        return '✓✓'
      default:
        return ''
    }
  }

  const getConversationDisplay = () => {
    if (!conversation) return null

    if (conversation.type === 'DIRECT' && conversation.otherUser) {
      return {
        name: conversation.otherUser.name,
        picture: conversation.otherUser.profilePicture,
        initial: conversation.otherUser.name.charAt(0).toUpperCase(),
        subtitle: conversation.otherUser.isOnline ? 'Online' : 'Offline',
        isOnline: conversation.otherUser.isOnline
      }
    }

    return {
      name: conversation.name || 'Group Chat',
      picture: null,
      initial: conversation.name ? conversation.name.charAt(0).toUpperCase() : 'G',
      subtitle: `${conversation.members.length} members`,
      isOnline: false
    }
  }

  if (loading) {
    return (
      <div className="chat-page">
        <div className="loading">Loading conversation...</div>
      </div>
    )
  }

  if (error || !conversation) {
    return (
      <div className="chat-page">
        <div className="error-message">{error || 'Conversation not found'}</div>
        <button onClick={() => navigate('/chats')} className="btn-primary">
          Back to Chats
        </button>
      </div>
    )
  }

  const display = getConversationDisplay()
  
  // Show active call screen if in call
  if (activeCall) {
    return (
      <ActiveCallScreen
        call={activeCall}
        localStream={localStream}
        remoteStream={remoteStream}
        onEndCall={handleEndCall}
      />
    )
  }

  return (
    <div className="chat-page">
      {/* Incoming Call Modal */}
      {incomingCall && (
        <IncomingCallModal
          call={incomingCall}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}
      
      <div className="chat-container">
        {/* Chat Header */}
        <div className="chat-header">
          <button onClick={() => navigate('/chats')} className="back-button">
            ← Back
          </button>

          <div className="chat-header-info">
            <div className="chat-avatar">
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

            <div className="chat-details">
              <h2>{display.name}</h2>
              <p className={`chat-status ${display.isOnline ? 'online' : ''}`}>
                {display.subtitle}
              </p>
            </div>
          </div>
          
          {/* Call buttons for direct conversations */}
          {conversation.type === 'DIRECT' && conversation.otherUser && (
            <div className="call-buttons">
              <button 
                onClick={handleVoiceCall}
                className="btn-call-voice"
                title="Voice Call"
              >
                📞
              </button>
              <button 
                onClick={handleVideoCall}
                className="btn-call-video"
                title="Video Call"
              >
                📹
              </button>
            </div>
          )}
          
          {conversation.type === 'GROUP' && (
            <button 
              onClick={() => setShowGroupInfo(!showGroupInfo)} 
              className="btn-group-info"
              title="Group Info"
            >
              ℹ️
            </button>
          )}
        </div>
        
        {/* Group Info Panel */}
        {showGroupInfo && conversation.type === 'GROUP' && (
          <GroupInfoPanel 
            conversation={conversation}
            onUpdate={handleConversationUpdate}
            onLeave={handleLeaveGroup}
            onDelete={handleDeleteGroup}
          />
        )}

        {/* Messages Area */}
        <div className="messages-area" ref={messagesContainerRef}>
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="chat-welcome">
                <div className="welcome-avatar">
                  {display.picture ? (
                    <img src={display.picture} alt={display.name} />
                  ) : (
                    <div className="avatar-placeholder-large">
                      {display.initial}
                    </div>
                  )}
                </div>
                <h3>{display.name}</h3>
                <p>This is the beginning of your conversation</p>
                <p className="chat-started">
                  Started {new Date(conversation.createdAt).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="messages-list">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${isOwnMessage(message) ? 'own-message' : 'other-message'}`}
                  >
                    {!isOwnMessage(message) && (
                      <div className="message-avatar">
                        {message.sender.profilePicture ? (
                          <img src={message.sender.profilePicture} alt={message.sender.name} />
                        ) : (
                          <div className="avatar-placeholder-small">
                            {message.sender.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="message-content-wrapper">
                      {!isOwnMessage(message) && conversation.type === 'GROUP' && (
                        <div className="message-sender-name">{message.sender.name}</div>
                      )}
                      
                      {/* Reply Info */}
                      {message.replyTo && (
                        <div className="reply-info">
                          <small>Replying to {message.replyTo.sender.name}</small>
                          <p>{message.replyTo.content.substring(0, 50)}{message.replyTo.content.length > 50 ? '...' : ''}</p>
                        </div>
                      )}
                      
                      <div className="message-bubble">
                        {message.fileUrl ? (
                          <FilePreview message={message} />
                        ) : null}
                        <p className="message-text">
                          {message.deletedAt ? (
                            <em style={{opacity: 0.6}}>{message.content}</em>
                          ) : (
                            message.content
                          )}
                        </p>
                        <span className="message-time">
                          {formatMessageTime(message.createdAt)}
                          {message.editedAt && <span className="edited-label"> (edited)</span>}
                          {isOwnMessage(message) && !message.deletedAt && (
                            <span className={`message-status ${message.status === 'SEEN' ? 'seen' : ''}`}>
                              {' '}{getStatusIcon(message.status)}
                            </span>
                          )}
                        </span>
                      </div>
                      
                      {/* Action buttons */}
                      {!message.deletedAt && (
                        <div className="message-actions">
                          <button onClick={() => handleReply(message)} title="Reply">↩️</button>
                          {isOwnMessage(message) && (
                            <>
                              <button onClick={() => handleEdit(message)} title="Edit">✏️</button>
                              <button onClick={() => handleDelete(message.id)} title="Delete">🗑️</button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
            
            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="typing-indicator-container">
                <div className="typing-indicator">
                  <span className="typing-user">
                    {typingUsers.length === 1 
                      ? `${typingUsers[0].userName} is typing`
                      : `${typingUsers.length} people are typing`
                    }
                  </span>
                  <span className="typing-dots">
                    <span>.</span><span>.</span><span>.</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Message Input */}
        <div className="message-input-area">
          {error && (
            <div className="error-banner">
              {error}
              <button onClick={() => setError('')} className="error-close">×</button>
            </div>
          )}
          
          {/* Reply/Edit Bar */}
          {(replyingTo || editingMessage) && (
            <div className="reply-edit-bar">
              <div>
                {replyingTo && (
                  <>
                    <strong>Replying to {replyingTo.sender.name}</strong>
                    <p>{replyingTo.content.substring(0, 50)}{replyingTo.content.length > 50 ? '...' : ''}</p>
                  </>
                )}
                {editingMessage && (
                  <>
                    <strong>Editing message</strong>
                    <p>{editingMessage.content.substring(0, 50)}{editingMessage.content.length > 50 ? '...' : ''}</p>
                  </>
                )}
              </div>
              <button onClick={replyingTo ? cancelReply : cancelEdit}>✕</button>
            </div>
          )}
          
          <form onSubmit={handleSendMessage} className="message-input-container">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
            />
            
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="file-button"
              title="Attach file"
              disabled={uploadingFile}
            >
              📎
            </button>
            
            <button 
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="emoji-button"
              title="Add emoji"
            >
              😊
            </button>
            
            {showEmojiPicker && (
              <div className="emoji-picker">
                {['😊', '😂', '❤️', '👍', '🎉', '🔥', '✨', '👏', '🙌', '💯', '😍', '🤔', '😎', '🥳', '😢', '😅'].map(emoji => (
                  <button 
                    key={emoji}
                    type="button"
                    onClick={() => addEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            
            <input
              type="text"
              placeholder={editingMessage ? "Edit message..." : "Type a message..."}
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending}
              className="message-input"
            />
            <button 
              type="submit"
              className="send-button" 
              disabled={!newMessage.trim() || sending || uploadingFile}
            >
              {sending ? 'Sending...' : uploadingFile ? 'Uploading...' : editingMessage ? 'Save' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
