import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as friendAPI from '../services/friendService'
import * as conversationAPI from '../services/conversationService'
import { Avatar, Button, Badge } from '../components/ui'
import { 
  FiMessageCircle, 
  FiUserPlus, 
  FiUsers,
  FiMail,
  FiInfo
} from 'react-icons/fi'

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
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading friends...</p>
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
              Friends
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/search')}
            leftIcon={FiUserPlus}
            className="hidden sm:flex"
          >
            Add Friends
          </Button>
          <button
            onClick={() => navigate('/search')}
            className="sm:hidden w-12 h-12 flex items-center justify-center bg-gradient-to-br from-emerald-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <FiUserPlus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Friends Grid */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {friends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-600 transition-all group"
              >
                {/* Avatar & Online Status */}
                <div className="flex items-start gap-4 mb-4">
                  <Avatar
                    name={friend.name}
                    src={friend.profilePicture}
                    size="xl"
                    showOnline={friend.isOnline}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate mb-1">
                      {friend.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={friend.isOnline ? 'success' : 'secondary'}
                        size="sm"
                        dot
                      >
                        {friend.isOnline ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Friend Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiMail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{friend.email}</span>
                  </div>
                  
                  {friend.about && (
                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FiInfo className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p className="line-clamp-2">{friend.about}</p>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => handleStartChat(friend.id)}
                  leftIcon={FiMessageCircle}
                  className="group-hover:shadow-md transition-shadow"
                >
                  Send Message
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mb-6">
              <FiUsers className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No friends yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
              Search for users and send friend requests to connect and start chatting!
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/search')}
              leftIcon={FiUserPlus}
            >
              Find Friends
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default FriendsPage
