import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import callService from '../services/callService'
import { Avatar, Badge } from '../components/ui'
import { 
  FiPhone, 
  FiVideo, 
  FiPhoneIncoming, 
  FiPhoneOutgoing,
  FiPhoneMissed,
  FiClock
} from 'react-icons/fi'

function CallHistoryPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [callHistory, setCallHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadCallHistory()
  }, [])

  const loadCallHistory = async () => {
    setLoading(true)
    setError('')

    try {
      const history = await callService.getCallHistory()
      setCallHistory(history || [])
    } catch (err) {
      console.error('Failed to load call history:', err)
      setError('Failed to load call history')
      setCallHistory([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleCallUser = async (userId, callType) => {
    try {
      await callService.initiateCall(userId, callType)
      // Navigate to chat page or show active call screen
    } catch (err) {
      console.error('Failed to initiate call:', err)
      alert('Failed to start call. Please try again.')
    }
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return null
    
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    
    if (mins === 0) return `${secs}s`
    return `${mins}m ${secs}s`
  }

  const getCallIcon = (call) => {
    const isIncoming = call.callee.id === user?.id
    const isMissed = call.status === 'MISSED'
    const isRejected = call.status === 'REJECTED'

    if (isMissed || isRejected) {
      return <FiPhoneMissed className="w-5 h-5 text-red-600 dark:text-red-400" />
    }
    
    if (isIncoming) {
      return <FiPhoneIncoming className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
    }
    
    return <FiPhoneOutgoing className="w-5 h-5 text-blue-600 dark:text-blue-400" />
  }

  const getCallStatus = (call) => {
    const isIncoming = call.callee.id === user?.id
    
    switch (call.status) {
      case 'ANSWERED':
        return { text: 'Answered', variant: 'success' }
      case 'MISSED':
        return { text: 'Missed', variant: 'danger' }
      case 'REJECTED':
        return { text: 'Rejected', variant: 'danger' }
      default:
        return { text: isIncoming ? 'Incoming' : 'Outgoing', variant: 'secondary' }
    }
  }

  const getOtherUser = (call) => {
    return call.caller.id === user?.id ? call.callee : call.caller
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading call history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 lg:p-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white font-poppins">
          Call History
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {Array.isArray(callHistory) ? callHistory.length : 0} {callHistory.length === 1 ? 'call' : 'calls'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Call List */}
      <div className="flex-1 overflow-y-auto">
        {!Array.isArray(callHistory) || callHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mb-6">
              <FiPhone className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Call History
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your call history will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {callHistory.map((call) => {
              if (!call || !call.caller || !call.callee) return null
              
              const otherUser = getOtherUser(call)
              if (!otherUser) return null
              
              const status = getCallStatus(call)
              const duration = formatDuration(call.duration)

              return (
                <button
                  key={call.id}
                  onClick={() => navigate(`/chat/${call.conversationId || otherUser.id}`)}
                  className="w-full p-4 lg:p-5 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left group"
                >
                  {/* Call Type Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    {getCallIcon(call)}
                  </div>

                  {/* User Avatar */}
                  <Avatar
                    name={otherUser.name}
                    src={otherUser.profilePicture}
                    size="lg"
                  />

                  {/* Call Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1">
                      {otherUser.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={status.variant} size="sm">
                        {status.text}
                      </Badge>
                      {duration && (
                        <>
                          <span className="text-gray-400 dark:text-gray-600">•</span>
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <FiClock className="w-3 h-3" />
                            <span>{duration}</span>
                          </div>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(call.createdAt)}
                    </p>
                  </div>

                  {/* Call Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCallUser(otherUser.id, call.callType)
                    }}
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      call.callType === 'VIDEO'
                        ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    }`}
                    title={`Call ${otherUser.name}`}
                  >
                    {call.callType === 'VIDEO' ? (
                      <FiVideo className="w-5 h-5" />
                    ) : (
                      <FiPhone className="w-5 h-5" />
                    )}
                  </button>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default CallHistoryPage
