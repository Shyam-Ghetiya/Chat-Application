import { useState } from 'react'
import * as friendAPI from '../services/friendService'
import { Avatar, Button, Badge, Input } from '../components/ui'
import { 
  FiSearch, 
  FiUserPlus, 
  FiUserCheck, 
  FiUserX,
  FiMail,
  FiInfo,
  FiCheck
} from 'react-icons/fi'

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
      setTimeout(() => setSuccess(''), 3000)
      
      // Update UI
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, friendshipStatus: 'PENDING_SENT' }
          : user
      ))
    } catch (err) {
      setError(err.message || 'Failed to send friend request')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleCancelRequest = async (userId) => {
    try {
      const sentRequests = await friendAPI.getSentRequests()
      const request = sentRequests.find(r => r.receiver.id === userId)
      
      if (request) {
        await friendAPI.cancelFriendRequest(request.id)
        setSuccess('Friend request cancelled')
        setTimeout(() => setSuccess(''), 3000)
        
        // Update UI
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, friendshipStatus: 'NONE' }
            : user
        ))
      }
    } catch (err) {
      setError('Failed to cancel friend request')
      setTimeout(() => setError(''), 3000)
    }
  }

  const getActionButton = (user) => {
    switch (user.friendshipStatus) {
      case 'FRIENDS':
        return (
          <Badge variant="success" size="md" leftIcon={FiUserCheck}>
            Friends
          </Badge>
        )
      
      case 'PENDING_SENT':
        return (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleCancelRequest(user.id)}
            leftIcon={FiUserX}
          >
            Cancel Request
          </Button>
        )
      
      case 'PENDING_RECEIVED':
        return (
          <Badge variant="warning" size="md">
            Pending Response
          </Badge>
        )
      
      case 'NONE':
      default:
        return (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSendRequest(user.id)}
            leftIcon={FiUserPlus}
          >
            Add Friend
          </Button>
        )
    }
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 lg:p-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white font-poppins mb-4">
          Search Users
        </h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email..."
              icon={FiSearch}
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading}
            loading={loading}
            className="hidden sm:flex"
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
          <button
            type="submit"
            disabled={loading}
            className="sm:hidden w-12 h-12 flex items-center justify-center bg-gradient-to-br from-emerald-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
          >
            <FiSearch className="w-6 h-6" />
          </button>
        </form>
      </div>

      {/* Messages */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm animate-shake">
          {error}
        </div>
      )}

      {success && (
        <div className="mx-4 mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2">
          <FiCheck className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-600 transition-all"
              >
                {/* Avatar & Info */}
                <div className="flex items-start gap-4 mb-4">
                  <Avatar
                    name={user.name}
                    src={user.profilePicture}
                    size="xl"
                    showOnline={user.isOnline}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate mb-1">
                      {user.name}
                    </h3>
                    <Badge
                      variant={user.isOnline ? 'success' : 'secondary'}
                      size="sm"
                      dot
                    >
                      {user.isOnline ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                </div>

                {/* User Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiMail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  
                  {user.about && (
                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FiInfo className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p className="line-clamp-2">{user.about}</p>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="flex justify-center">
                  {getActionButton(user)}
                </div>
              </div>
            ))}
          </div>
        ) : !loading && query ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <FiSearch className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No users found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try searching with a different name or email
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mb-6">
              <FiSearch className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Search for users
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm">
              Enter a name or email address in the search box above to find users and send friend requests
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchUsersPage
