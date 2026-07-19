const API_BASE_URL = 'http://localhost:8080/api'

export async function uploadFile(file, conversationId, caption = null) {
  const token = localStorage.getItem('token')
  
  const formData = new FormData()
  formData.append('file', file)
  formData.append('conversationId', conversationId)
  if (caption) {
    formData.append('caption', caption)
  }
  
  const response = await fetch(`${API_BASE_URL}/files/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to upload file')
  }
  
  return response.json()
}

export async function uploadProfilePicture(file) {
  const token = localStorage.getItem('token')
  
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch(`${API_BASE_URL}/files/profile/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to upload profile picture')
  }
  
  return response.json()
}

export function getFileUrl(fileUrl) {
  if (!fileUrl) return null
  if (fileUrl.startsWith('http')) return fileUrl
  return `${API_BASE_URL}/files/view/${fileUrl}`
}

export function getDownloadUrl(fileUrl) {
  if (!fileUrl) return null
  return `${API_BASE_URL}/files/download/${fileUrl}`
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
