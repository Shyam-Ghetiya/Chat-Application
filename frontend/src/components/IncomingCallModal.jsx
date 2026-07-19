import { useState, useEffect } from 'react'
import { Avatar, Button } from './ui'
import { FiPhone, FiPhoneOff, FiVideo } from 'react-icons/fi'

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-blue-600 p-8 text-center">
          <div className="inline-block mb-4">
            <Avatar
              name={call.caller.name}
              src={call.caller.profilePicture}
              size="2xl"
              className="ring-4 ring-white/30 animate-pulse-slow"
            />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {call.caller.name}
          </h2>
          
          <div className="flex items-center justify-center gap-2 text-white/90 mb-1">
            {call.callType === 'VIDEO' ? (
              <>
                <FiVideo className="w-5 h-5" />
                <span>Video Call</span>
              </>
            ) : (
              <>
                <FiPhone className="w-5 h-5" />
                <span>Voice Call</span>
              </>
            )}
          </div>
          
          <p className="text-white/70 text-sm animate-pulse">
            Incoming call...
          </p>
        </div>

        {/* Actions */}
        <div className="p-8 flex justify-center gap-6">
          {/* Reject Button */}
          <button
            onClick={handleReject}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all hover:scale-110 shadow-lg">
              <FiPhoneOff className="w-7 h-7 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400">
              Decline
            </span>
          </button>

          {/* Accept Button */}
          <button
            onClick={handleAccept}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center transition-all hover:scale-110 shadow-lg animate-pulse-slow">
              <FiPhone className="w-7 h-7 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              Accept
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default IncomingCallModal
