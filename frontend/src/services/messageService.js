const API_URL = 'http://localhost:8080/api'

export const getMessages = async (conversationId) => {
  const token = localStorage.getItem('token')
  
  const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch messages')
  }

  return response.json()
}

export const sendMessageREST = async (conversationId, content) => {
  const token = localStorage.getItem('token')
  
  const response = await fetch(`${API_URL}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversationId,
      content,
      messageType: 'TEXT'
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to send message')
  }

  return response.json()
}
