import { useState, useEffect, useRef } from 'react'
import './ActiveCallScreen.css'

function ActiveCallScreen({ call, localStream, remoteStream, onEndCall }) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const callStartTime = useRef(Date.now())

  useEffect(() => {
    // Update call duration every second
    const interval = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Set local video stream
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    // Set remote video stream
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!videoTrack.enabled)
      }
    }
  }

  const isVideoCall = call.callType === 'VIDEO'
  const otherUser = call.caller || call.callee

  return (
    <div className="active-call-overlay">
      {/* Call Header */}
      <div className="call-header">
        <div className="call-user-info">
          <div className="call-user-avatar">
            {otherUser.profilePicture ? (
              <img src={otherUser.profilePicture} alt={otherUser.name} />
            ) : (
              <div className="avatar-placeholder">
                {otherUser.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="call-user-details">
            <h3>{otherUser.name}</h3>
            <div className="call-duration">{formatDuration(callDuration)}</div>
          </div>
        </div>
        <div className="call-status-text">
          {call.status === 'ANSWERED' ? '🟢 Connected' : '🔵 Connecting...'}
        </div>
      </div>

      {/* Video/Audio Container */}
      <div className="video-container">
        {isVideoCall ? (
          <>
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                className="remote-video"
                autoPlay
                playsInline
              />
            ) : (
              <div className="audio-only-indicator">
                <div className="audio-only-avatar">
                  {otherUser.profilePicture ? (
                    <img src={otherUser.profilePicture} alt={otherUser.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {otherUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="audio-only-info">
                  <h2>{otherUser.name}</h2>
                  <p>Connecting...</p>
                </div>
              </div>
            )}

            {localStream && (
              <video
                ref={localVideoRef}
                className="local-video"
                autoPlay
                playsInline
                muted
              />
            )}
          </>
        ) : (
          <div className="audio-only-indicator">
            <div className="audio-only-avatar">
              {otherUser.profilePicture ? (
                <img src={otherUser.profilePicture} alt={otherUser.name} />
              ) : (
                <div className="avatar-placeholder">
                  {otherUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="audio-only-info">
              <h2>{otherUser.name}</h2>
              <p>Voice Call</p>
            </div>
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="call-controls">
        <button
          className={`call-control-btn ${isMuted ? 'muted' : ''}`}
          onClick={toggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🎤'}
        </button>

        {isVideoCall && (
          <button
            className={`call-control-btn ${isVideoOff ? 'muted' : ''}`}
            onClick={toggleVideo}
            title={isVideoOff ? 'Turn on video' : 'Turn off video'}
          >
            {isVideoOff ? '📹' : '📷'}
          </button>
        )}

        <button
          className="call-control-btn end-call-btn"
          onClick={onEndCall}
          title="End call"
        >
          📞
        </button>
      </div>
    </div>
  )
}

export default ActiveCallScreen
