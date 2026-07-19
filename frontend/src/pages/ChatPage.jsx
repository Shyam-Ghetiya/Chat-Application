import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as conversationAPI from '../services/conversationService'
import * as messageAPI from '../services/messageService'
import * as fileService from '../services/fileService'
import * as aiService from '../services/aiService'
import websocketService from '../services/websocketService'
import callService from '../services/callService'
import GroupInfoPanel from '../components/GroupInfoPanel'
import FilePreview from '../components/FilePreview'
import IncomingCallModal from '../components/IncomingCallModal'
import ActiveCallScreen from '../components/ActiveCallScreen'
import ChatSummarizeModal from '../components/ChatSummarizeModal'
import { Avatar, Button } from '../components/ui'
import {
  FiArrowLeft,
  FiPhone,
  FiVideo,
  FiInfo,
  FiPaperclip,
  FiSmile,
  FiSend,
  FiCornerUpLeft,
  FiEdit2,
  FiTrash2,
  FiX,
  FiFileText,
  FiGlobe
} from 'react-icons/fi'

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
  
  // AI Feature states
  const [showSummarizeModal, setShowSummarizeModal] = useState(false)
  const [typingLanguage, setTypingLanguage] = useState('English')
  const [messageLanguage, setMessageLanguage] = useState('English')
  const [translating, setTranslating] = useState(false)

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
    let messageContent = newMessage.trim()
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
    
    // AI Translation - BEFORE sending
    if (typingLanguage !== messageLanguage) {
      try {
        setTranslating(true)
        const translateResponse = await aiService.translateText(
          messageContent,
          typingLanguage,
          messageLanguage
        )
        messageContent = translateResponse.translatedText
      } catch (err) {
        console.error('Translation failed:', err)
        // Continue with original text if translation fails
        setError('Translation failed, sending original message')
      } finally {
        setTranslating(false)
      }
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
      <div className="flex items-center justify-center h-full bg-white dark:bg-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading conversation...</p>
        </div>
      </div>
    )
  }

  if (error || !conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-800 p-8">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <FiX className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {error || 'Conversation not found'}
        </h3>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/chats')}
          leftIcon={FiArrowLeft}
        >
          Back to Chats
        </Button>
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
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Incoming Call Modal */}
      {incomingCall && (
        <IncomingCallModal
          call={incomingCall}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}
      
      {/* Chat Header */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between p-4 lg:p-5">
          {/* Left: Back + User Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => navigate('/chats')}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>

            <Avatar
              name={display.name}
              src={display.picture}
              size="lg"
              showOnline={display.isOnline}
            />

            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 dark:text-white truncate">
                {display.name}
              </h2>
              <p className={`text-sm ${display.isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {display.subtitle}
              </p>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            {/* AI Summarize Button */}
            <button
              onClick={() => setShowSummarizeModal(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              title="Summarize Chat"
            >
              <FiFileText className="w-5 h-5" />
            </button>
            
            {conversation.type === 'DIRECT' && conversation.otherUser && (
              <>
                <button
                  onClick={handleVoiceCall}
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  title="Voice Call"
                >
                  <FiPhone className="w-5 h-5" />
                </button>
                <button
                  onClick={handleVideoCall}
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Video Call"
                >
                  <FiVideo className="w-5 h-5" />
                </button>
              </>
            )}
            
            {conversation.type === 'GROUP' && (
              <button
                onClick={() => setShowGroupInfo(!showGroupInfo)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
                  showGroupInfo
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Group Info"
              >
                <FiInfo className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Group Info Panel */}
        {showGroupInfo && conversation.type === 'GROUP' && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            <GroupInfoPanel 
              conversation={conversation}
              onUpdate={handleConversationUpdate}
              onLeave={handleLeaveGroup}
              onDelete={handleDeleteGroup}
            />
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900" ref={messagesContainerRef}>
        <div className="p-4 lg:p-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-24 h-24 mb-6">
                <Avatar
                  name={display.name}
                  src={display.picture}
                  size="xl"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {display.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                This is the beginning of your conversation
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Started {new Date(conversation.createdAt).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isOwn = isOwnMessage(message)
                const showAvatar = !isOwn && (
                  index === 0 || 
                  messages[index - 1]?.sender.id !== message.sender.id
                )
                
                return (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} group`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {!isOwn && showAvatar ? (
                        <Avatar
                          name={message.sender.name}
                          src={message.sender.profilePicture}
                          size="sm"
                        />
                      ) : (
                        <div className="w-8 h-8" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                      {/* Sender Name (for group chats) */}
                      {!isOwn && conversation.type === 'GROUP' && showAvatar && (
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 px-3">
                          {message.sender.name}
                        </span>
                      )}
                      
                      {/* Reply Info */}
                      {message.replyTo && (
                        <div className={`px-3 py-2 rounded-lg mb-1 text-xs ${
                          isOwn 
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          <p className="font-medium">
                            Replying to {message.replyTo.sender.name}
                          </p>
                          <p className="opacity-75 truncate">
                            {message.replyTo.content.substring(0, 50)}
                            {message.replyTo.content.length > 50 ? '...' : ''}
                          </p>
                        </div>
                      )}
                      
                      {/* Message Bubble */}
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-gradient-to-br from-emerald-600 to-blue-600 text-white rounded-br-md'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-md'
                        }`}
                      >
                        {/* File Preview */}
                        {message.fileUrl && (
                          <div className="mb-2">
                            <FilePreview message={message} />
                          </div>
                        )}
                        
                        {/* Text Content */}
                        <p className={`text-sm whitespace-pre-wrap break-words ${message.deletedAt ? 'italic opacity-60' : ''}`}>
                          {message.deletedAt ? message.content : message.content}
                        </p>
                        
                        {/* Time + Status */}
                        <div className={`flex items-center gap-1 mt-1 text-xs ${
                          isOwn ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          <span>{formatMessageTime(message.createdAt)}</span>
                          {message.editedAt && <span>• edited</span>}
                          {isOwn && !message.deletedAt && (
                            <span className={message.status === 'SEEN' ? 'text-blue-200' : ''}>
                              {' '}{getStatusIcon(message.status)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {!message.deletedAt && (
                        <div className={`flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                          isOwn ? 'flex-row-reverse' : 'flex-row'
                        }`}>
                          <button
                            onClick={() => handleReply(message)}
                            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Reply"
                          >
                            <FiCornerUpLeft className="w-4 h-4" />
                          </button>
                          {isOwn && (
                            <>
                              <button
                                onClick={() => handleEdit(message)}
                                className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="Edit"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(message.id)}
                                className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Delete"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <div className="w-8 h-8" />
              <div className="px-4 py-3 bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-md">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {typingUsers.length === 1 
                      ? `${typingUsers[0].userName} is typing`
                      : `${typingUsers.length} people are typing`
                    }
                  </span>
                  <div className="flex gap-1 ml-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message Input Area */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        {/* Error Banner */}
        {error && (
          <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* Reply/Edit Bar */}
        {(replyingTo || editingMessage) && (
          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {replyingTo && (
                <>
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                    Replying to {replyingTo.sender.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {replyingTo.content}
                  </p>
                </>
              )}
              {editingMessage && (
                <>
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                    Editing message
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {editingMessage.content}
                  </p>
                </>
              )}
            </div>
            <button
              onClick={replyingTo ? cancelReply : cancelEdit}
              className="ml-3 p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="space-y-3">
          {/* AI Translation Language Selectors */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <FiGlobe className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <div className="flex items-center gap-2 flex-1">
              <div className="flex-1">
                <select
                  value={typingLanguage}
                  onChange={(e) => setTypingLanguage(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                  title="Typing Language"
                >
                  {aiService.SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} Typing: {lang.name.split(' ')[0]}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-gray-400 dark:text-gray-500">→</span>
              <div className="flex-1">
                <select
                  value={messageLanguage}
                  onChange={(e) => setMessageLanguage(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                  title="Message Language"
                >
                  {aiService.SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} Send: {lang.name.split(' ')[0]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {translating && (
              <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                <div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-purple-600 dark:text-purple-400">Translating...</span>
              </div>
            )}
          </div>
          
          <div className="flex items-end gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
            />
          
          {/* Attach Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Attach file"
          >
            <FiPaperclip className="w-5 h-5" />
          </button>
          
          {/* Emoji Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Add emoji"
            >
              <FiSmile className="w-5 h-5" />
            </button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden" style={{ width: '320px', maxHeight: '400px' }}>
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Emojis</p>
                </div>
                <div className="overflow-y-auto p-2" style={{ maxHeight: '340px' }}>
                  {/* Smileys & People */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 px-2 mb-2">Smileys</p>
                    <div className="grid grid-cols-8 gap-1">
                      {['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => addEmoji(emoji)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-xl"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gestures & Hands */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 px-2 mb-2">Gestures</p>
                    <div className="grid grid-cols-8 gap-1">
                      {['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '💪', '🦾'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => addEmoji(emoji)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-xl"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hearts & Symbols */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 px-2 mb-2">Hearts</p>
                    <div className="grid grid-cols-8 gap-1">
                      {['❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => addEmoji(emoji)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-xl"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Objects */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 px-2 mb-2">Objects</p>
                    <div className="grid grid-cols-8 gap-1">
                      {['🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🔥', '⭐', '🌟', '✨', '⚡', '💥', '💫', '💯', '✅', '☑️', '❌', '❎', '➕', '➖', '✖️', '➗', '♾️', '💲'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => addEmoji(emoji)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-xl"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Text Input */}
          <input
            type="text"
            placeholder={editingMessage ? "Edit message..." : "Type a message..."}
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending || uploadingFile}
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all disabled:opacity-50"
          />
          
          {/* Send Button */}
          <button
            type="submit"
            disabled={!newMessage.trim() || sending || uploadingFile || translating}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
            title="Send message"
          >
            {sending || uploadingFile || translating ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FiSend className="w-5 h-5" />
            )}
          </button>
          </div>
        </form>
      </div>
      
      {/* AI Summarize Modal */}
      <ChatSummarizeModal
        isOpen={showSummarizeModal}
        onClose={() => setShowSummarizeModal(false)}
        conversationId={conversationId}
      />
    </div>
  )
}

export default ChatPage
