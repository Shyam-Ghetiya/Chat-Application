import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import callService from '../services/callService'
import './CallHistoryPage.css'

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
      setCallHistory(history)
    } catch (err) {
      console.error('Failed to load call history:', err)
      setError('Failed to load call history')
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

    if (isMissed || isRejected) return '❌'
    if (call.callType === 'VIDEO') return isIncoming ? '📹' : '📱'
    return isIncoming ? '📞' : '📱'
  }

  const getCallStatus = (call) => {
    const isIncoming = call.callee.id === user?.id
    
    switch (call.status) {
      case 'ANSWERED':
        return { text: 'Answered', className: 'answered' }
      case 'MISSED':
        return { text: 'Missed', className: 'missed' }
      case 'REJECTED':
        return { text: 'Rejected', className: 'rejected' }
      default:
        return { text: isIncoming ? 'Incoming' : 'Outgoing', className: '' }
    }
  }

  const getOtherUser = (call) => {
    return call.caller.id === user?.id ? call.callee : call.caller
  }

  if (loading) {
    return (
      <div className="call-history-page">
        <div className="loading">Loading call history...</div>
      </div>
    )
  }

  return (
    <div className="call-history-page">
      <h2>Call History</h2>

      {error && <div className="error-message">{error}</div>}

      {callHistory.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📞</div>
          <h3>No Call History</h3>
          <p>Your call history will appear here</p>
        </div>
      ) : (
        <div className="call-history-list">
          {callHistory.map((call) => {
            const otherUser = getOtherUser(call)
            const status = getCallStatus(call)
            const duration = formatDuration(call.duration)

            return (
              <div
                key={call.id}
                className="call-history-item"
                onClick={() => navigate(`/chat/${call.conversationId || otherUser.id}`)}
              >
                <div className="call-type-icon">
                  {getCallIcon(call)}
                </div>

                <div className="call-user-avatar">
                  {otherUser.profilePicture ? (
                    <img src={otherUser.profilePicture} alt={otherUser.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {otherUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="call-details">
                  <h3>{otherUser.name}</h3>
                  <div className="call-meta">
                    <span className={`call-status ${status.className}`}>
                      {status.text}
                    </span>
                    {duration && (
                      <>
                        <span>•</span>
                        <span className="call-duration-info">
                          ⏱️ {duration}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="call-time">
                    {formatDate(call.createdAt)}
                  </div>
                </div>

                <button
                  className="call-action-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCallUser(otherUser.id, call.callType)
                  }}
                  title={`Call ${otherUser.name}`}
                >
                  {call.callType === 'VIDEO' ? '📹' : '📞'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CallHistoryPage
