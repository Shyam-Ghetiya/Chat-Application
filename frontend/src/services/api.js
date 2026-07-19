const API_BASE_URL = 'http://localhost:8080/api'

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const token = localStorage.getItem('token')
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, { ...defaultOptions, ...options })
    
    // Check if response has content
    const contentType = response.headers.get('content-type')
    const hasJsonContent = contentType && contentType.includes('application/json')
    
    if (!response.ok) {
      if (hasJsonContent) {
        const data = await response.json()
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    }
    
    // Return parsed JSON if available, otherwise return empty object
    if (hasJsonContent) {
      return await response.json()
    } else {
      // For responses with no body (like 200 OK with no content)
      return {}
    }
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

/**
 * Test backend connection
 */
export async function testBackendConnection() {
  return fetchAPI('/test')
}

/**
 * GET request
 */
export async function get(endpoint) {
  return fetchAPI(endpoint, { method: 'GET' })
}

/**
 * POST request
 */
export async function post(endpoint, data) {
  return fetchAPI(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * PUT request
 */
export async function put(endpoint, data) {
  return fetchAPI(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * DELETE request
 */
export async function del(endpoint) {
  return fetchAPI(endpoint, { method: 'DELETE' })
}

export default {
  get,
  post,
  put,
  del,
  testBackendConnection,
}
