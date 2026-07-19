import { useState, useEffect } from 'react'
import './IncomingCallModal.css'

function IncomingCallModal({ call, onAccept, onReject }) {
  const [ringingAudio] = useState(new Audio('/ringtone.mp3'))

  useEffect(() => {
    // Play ringtone (loop)
    ringingAudio.loop = true
    ringingAudio.play().catch(err => console.log('Could not play ringtone:', err))

    return () => {
      ringingAudio.pause()
      ringingAudio.currentTime = 0
    }
  }, [ringingAudio])

  const handleAccept = () => {
    ringingAudio.pause()
    onAccept()
  }

  const handleReject = () => {
    ringingAudio.pause()
    onReject()
  }

  return (
    <div className="incoming-call-overlay">
      <div className="incoming-call-modal">
        <div className="caller-info">
          <div className="caller-avatar">
            {call.caller.profilePicture ? (
              <img src={call.caller.profilePicture} alt={call.caller.name} />
            ) : (
              <div className="avatar-placeholder">
                {call.caller.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h2>{call.caller.name}</h2>
          <p className="call-type">
            {call.callType === 'VIDEO' ? '📹 Video Call' : '📞 Voice Call'}
          </p>
          <p className="call-status">Incoming call...</p>
        </div>

        <div className="call-actions">
          <button onClick={handleReject} className="reject-button" title="Reject">
            <span className="icon">📵</span>
            <span>Reject</span>
          </button>
          <button onClick={handleAccept} className="accept-button" title="Accept">
            <span className="icon">📞</span>
            <span>Accept</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default IncomingCallModal
