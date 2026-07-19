import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

class WebSocketService {
  constructor() {
    this.client = null
    this.connected = false
    this.subscriptions = new Map()
  }

  connect(token) {
    return new Promise((resolve, reject) => {
      if (this.connected) {
        resolve()
        return
      }

      this.client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
        connectHeaders: {
          Authorization: `Bearer ${token}`
        },
        debug: (str) => {
          console.log('STOMP: ' + str)
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('WebSocket Connected')
          this.connected = true
          
          // Subscribe to presence updates
          this.subscribe('/topic/presence', (update) => {
            // Dispatch custom event for presence updates
            window.dispatchEvent(new CustomEvent('presence-update', { detail: update }))
          })
          
          resolve()
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame)
          this.connected = false
          reject(new Error('WebSocket connection failed'))
        },
        onWebSocketError: (error) => {
          console.error('WebSocket error:', error)
          this.connected = false
          reject(error)
        },
        onDisconnect: () => {
          console.log('WebSocket Disconnected')
          this.connected = false
        }
      })

      this.client.activate()
    })
  }

  disconnect() {
    if (this.client && this.connected) {
      this.subscriptions.clear()
      this.client.deactivate()
      this.connected = false
    }
  }

  subscribe(destination, callback) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected')
      return null
    }

    // Check if already subscribed
    if (this.subscriptions.has(destination)) {
      console.log('Already subscribed to:', destination)
      return this.subscriptions.get(destination)
    }

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const payload = JSON.parse(message.body)
        callback(payload)
      } catch (error) {
        console.error('Error parsing message:', error)
      }
    })

    this.subscriptions.set(destination, subscription)
    console.log('Subscribed to:', destination)
    return subscription
  }

  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination)
    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(destination)
      console.log('Unsubscribed from:', destination)
    }
  }

  sendMessage(destination, body) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected')
      return
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body)
    })
  }

  isConnected() {
    return this.connected
  }
}

// Create a singleton instance
const websocketService = new WebSocketService()

export default websocketService
