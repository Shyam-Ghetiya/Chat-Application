import { useState, useEffect, useRef } from 'react'
import { Avatar } from './ui'
import { 
  FiMic, 
  FiMicOff, 
  FiVideo, 
  FiVideoOff, 
  FiPhoneOff
} from 'react-icons/fi'

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
    <div className="fixed inset-0 z-[9999] bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              name={otherUser.name}
              src={otherUser.profilePicture}
              size="md"
              className="ring-2 ring-white/30"
            />
            <div>
              <h3 className="text-white font-semibold text-lg">
                {otherUser.name}
              </h3>
              <p className="text-white/80 text-sm">
                {formatDuration(callDuration)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${call.status === 'ANSWERED' ? 'bg-emerald-500' : 'bg-blue-500'} animate-pulse`}></div>
            <span className="text-white/80 text-sm">
              {call.status === 'ANSWERED' ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Video/Audio Container */}
      <div className="flex-1 relative">
        {isVideoCall ? (
          <>
            {/* Remote Video */}
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <Avatar
                  name={otherUser.name}
                  src={otherUser.profilePicture}
                  size="2xl"
                  className="mb-4"
                />
                <h2 className="text-white text-2xl font-semibold mb-2">
                  {otherUser.name}
                </h2>
                <p className="text-white/70">Connecting...</p>
              </div>
            )}

            {/* Local Video (Picture-in-Picture) */}
            {localStream && (
              <div className="absolute top-24 right-6 w-32 h-40 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30">
                <video
                  ref={localVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
              </div>
            )}
          </>
        ) : (
          /* Audio Only */
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-32 h-32 mb-6 animate-pulse-slow">
              <Avatar
                name={otherUser.name}
                src={otherUser.profilePicture}
                size="2xl"
              />
            </div>
            <h2 className="text-white text-3xl font-semibold mb-2">
              {otherUser.name}
            </h2>
            <p className="text-white/70 text-lg">Voice Call</p>
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/60 to-transparent p-8">
        <div className="flex justify-center items-center gap-6">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
              isMuted
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-gray-700/80 hover:bg-gray-600'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <FiMicOff className="w-6 h-6 text-white" />
            ) : (
              <FiMic className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Video Toggle (for video calls) */}
          {isVideoCall && (
            <button
              onClick={toggleVideo}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                isVideoOff
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gray-700/80 hover:bg-gray-600'
              }`}
              title={isVideoOff ? 'Turn on video' : 'Turn off video'}
            >
              {isVideoOff ? (
                <FiVideoOff className="w-6 h-6 text-white" />
              ) : (
                <FiVideo className="w-6 h-6 text-white" />
              )}
            </button>
          )}

          {/* End Call Button */}
          <button
            onClick={onEndCall}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all hover:scale-110 shadow-lg"
            title="End call"
          >
            <FiPhoneOff className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ActiveCallScreen
