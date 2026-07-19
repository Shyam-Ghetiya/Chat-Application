import websocketService from './websocketService'

const API_URL = 'http://localhost:8080/api/calls'

// WebRTC configuration with STUN servers
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
}

class CallService {
  constructor() {
    this.peerConnection = null
    this.localStream = null
    this.remoteStream = null
    this.currentCall = null
    this.onIncomingCall = null
    this.onCallEnded = null
    this.onRemoteStream = null
  }

  async initiateCall(calleeId, callType) {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/initiate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ calleeId, callType })
      })

      if (!response.ok) {
        throw new Error('Failed to initiate call')
      }

      const call = await response.json()
      this.currentCall = call

      // Get user media
      await this.setupLocalMedia(callType === 'VIDEO')

      // Create peer connection
      this.createPeerConnection(call.id)

      // Create and send offer
      const offer = await this.peerConnection.createOffer()
      await this.peerConnection.setLocalDescription(offer)

      // Send offer via WebSocket
      websocketService.sendMessage('/app/call/signal', {
        callId: call.id,
        type: 'OFFER',
        sdp: offer.sdp,
        targetUserId: calleeId
      })

      return call
    } catch (error) {
      console.error('Failed to initiate call:', error)
      this.cleanup()
      throw error
    }
  }

  async answerCall(callId) {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/${callId}/answer`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      if (!response.ok) {
        throw new Error('Failed to answer call')
      }

      const call = await response.json()
      this.currentCall = call

      // Get user media
      await this.setupLocalMedia(call.callType === 'VIDEO')

      return call
    } catch (error) {
      console.error('Failed to answer call:', error)
      throw error
    }
  }

  async rejectCall(callId) {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/${callId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      if (!response.ok) {
        throw new Error('Failed to reject call')
      }

      this.cleanup()
      return await response.json()
    } catch (error) {
      console.error('Failed to reject call:', error)
      throw error
    }
  }

  async endCall(callId) {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/${callId}/end`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      if (!response.ok) {
        throw new Error('Failed to end call')
      }

      this.cleanup()
      return await response.json()
    } catch (error) {
      console.error('Failed to end call:', error)
      throw error
    }
  }

  async getCallHistory() {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      if (!response.ok) {
        throw new Error('Failed to get call history')
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get call history:', error)
      throw error
    }
  }

  async setupLocalMedia(includeVideo) {
    try {
      const constraints = {
        audio: true,
        video: includeVideo ? { width: 1280, height: 720 } : false
      }

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
      return this.localStream
    } catch (error) {
      console.error('Failed to get user media:', error)
      throw new Error('Could not access camera/microphone. Please check permissions.')
    }
  }

  createPeerConnection(callId) {
    this.peerConnection = new RTCPeerConnection(configuration)

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream)
      })
    }

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream()
      }
      event.streams[0].getTracks().forEach(track => {
        this.remoteStream.addTrack(track)
      })
      
      if (this.onRemoteStream) {
        this.onRemoteStream(this.remoteStream)
      }
    }

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        websocketService.sendMessage('/app/call/signal', {
          callId: callId,
          type: 'ICE_CANDIDATE',
          candidate: JSON.stringify(event.candidate)
        })
      }
    }

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection.connectionState)
      
      if (this.peerConnection.connectionState === 'disconnected' ||
          this.peerConnection.connectionState === 'failed' ||
          this.peerConnection.connectionState === 'closed') {
        this.cleanup()
        if (this.onCallEnded) {
          this.onCallEnded()
        }
      }
    }
  }

  async handleSignal(signal) {
    try {
      if (!this.peerConnection) {
        // If we receive an offer, create peer connection
        if (signal.type === 'OFFER') {
          this.createPeerConnection(signal.callId)
        } else {
          console.error('Peer connection not initialized')
          return
        }
      }

      switch (signal.type) {
        case 'OFFER':
          await this.peerConnection.setRemoteDescription(
            new RTCSessionDescription({ type: 'offer', sdp: signal.sdp })
          )
          
          const answer = await this.peerConnection.createAnswer()
          await this.peerConnection.setLocalDescription(answer)
          
          websocketService.sendMessage('/app/call/signal', {
            callId: signal.callId,
            type: 'ANSWER',
            sdp: answer.sdp,
            targetUserId: signal.callerId
          })
          break

        case 'ANSWER':
          await this.peerConnection.setRemoteDescription(
            new RTCSessionDescription({ type: 'answer', sdp: signal.sdp })
          )
          break

        case 'ICE_CANDIDATE':
          const candidate = JSON.parse(signal.candidate)
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
          break

        default:
          console.log('Unknown signal type:', signal.type)
      }
    } catch (error) {
      console.error('Error handling signal:', error)
    }
  }

  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        return audioTrack.enabled
      }
    }
    return false
  }

  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        return videoTrack.enabled
      }
    }
    return false
  }

  cleanup() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }

    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    this.remoteStream = null
    this.currentCall = null
  }

  subscribeToCallSignals(userId) {
    websocketService.subscribe(`/topic/call/${userId}`, (signal) => {
      if (signal.type === 'INCOMING_CALL') {
        if (this.onIncomingCall) {
          this.onIncomingCall(signal.call)
        }
      } else if (signal.type === 'CALL_ENDED') {
        this.cleanup()
        if (this.onCallEnded) {
          this.onCallEnded()
        }
      } else {
        // Handle WebRTC signals
        this.handleSignal(signal)
      }
    })
  }
}

const callService = new CallService()
export default callService
