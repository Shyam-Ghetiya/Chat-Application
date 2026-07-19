import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as conversationAPI from '../services/conversationService'
import CreateGroupModal from '../components/CreateGroupModal'
import { Avatar, Button, Badge } from '../components/ui'
import { 
  FiPlus, 
  FiUsers, 
  FiMessageCircle,
  FiSearch 
} from 'react-icons/fi'

function ChatsPage() {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
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

  const filteredConversations = conversations.filter((conv) => {
    const display = getConversationDisplay(conv)
    return display.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const formatLastMessageTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading chats...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white font-poppins">
              Messages
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateGroupModal(true)}
            leftIcon={FiPlus}
            className="hidden sm:flex"
          >
            Create Group
          </Button>
          <button
            onClick={() => setShowCreateGroupModal(true)}
            className="sm:hidden w-12 h-12 flex items-center justify-center bg-gradient-to-br from-emerald-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <FiPlus className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredConversations.map((conversation) => {
              const display = getConversationDisplay(conversation)
              
              return (
                <button
                  key={conversation.id}
                  onClick={() => handleOpenChat(conversation.id)}
                  className="w-full p-4 lg:p-5 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left group"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Avatar
                      name={display.name}
                      src={display.picture}
                      size="lg"
                      showOnline={display.isOnline}
                    />
                    {conversation.type === 'GROUP' && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                        <FiUsers className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {display.name}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                        {formatLastMessageTime(conversation.updatedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {conversation.type === 'DIRECT' 
                        ? display.isOnline ? 'Online' : 'Offline'
                        : `${conversation.members.length} members`
                      }
                    </p>
                  </div>

                  {/* Unread Badge (placeholder for future) */}
                  {/* {conversation.unreadCount > 0 && (
                    <Badge variant="danger" size="sm">
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </Badge>
                  )} */}
                </button>
              )
            })}
          </div>
        ) : searchQuery ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <FiSearch className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No results found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try searching with a different keyword
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mb-6">
              <FiMessageCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No conversations yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
              Start chatting with your friends or create a group to begin your journey!
            </p>
            <div className="flex gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/friends')}
                leftIcon={FiUsers}
              >
                Find Friends
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setShowCreateGroupModal(true)}
                leftIcon={FiPlus}
              >
                Create Group
              </Button>
            </div>
          </div>
        )}
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
