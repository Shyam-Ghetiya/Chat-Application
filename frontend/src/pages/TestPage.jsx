import { useState } from 'react'
import { testBackendConnection } from '../services/api'
import './TestPage.css'

function TestPage() {
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleTest = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const data = await testBackendConnection()
      setResponse(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="test-page">
      <h2>Backend Connection Test</h2>
      <p>Click the button below to test the connection between React and Spring Boot</p>
      
      <button 
        onClick={handleTest} 
        disabled={loading}
        className="test-button"
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>

      {response && (
        <div className="response-card success">
          <h3>✅ Connection Successful!</h3>
          <div className="response-details">
            <p><strong>Status:</strong> {response.status}</p>
            <p><strong>Message:</strong> {response.message}</p>
            <p><strong>Timestamp:</strong> {response.timestamp}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="response-card error">
          <h3>❌ Connection Failed</h3>
          <p>{error}</p>
          <p className="help-text">Make sure the Spring Boot backend is running on http://localhost:8080</p>
        </div>
      )}
    </div>
  )
}

export default TestPage
