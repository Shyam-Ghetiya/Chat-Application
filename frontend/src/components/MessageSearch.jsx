import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './MessageSearch.css'

function MessageSearch({ conversationId = null, onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!query.trim()) return

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const url = conversationId 
        ? `http://localhost:8080/api/messages/search?query=${encodeURIComponent(query)}&conversationId=${conversationId}`
        : `http://localhost:8080/api/messages/search?query=${encodeURIComponent(query)}`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      console.error('Search error:', err)
      setError('Failed to search messages')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const highlightQuery = (text) => {
    if (!query) return text
    
    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? <mark key={index}>{part}</mark> : part
    )
  }

  const handleResultClick = (result) => {
    navigate(`/chat/${result.conversationId}`)
    if (onClose) onClose()
  }

  return (
    <div className="message-search">
      <div className="search-header">
        <h3>Search Messages</h3>
        {onClose && (
          <button onClick={onClose} className="close-btn">×</button>
        )}
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search messages..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-btn" disabled={loading}>
          {loading ? 'Searching...' : '🔍'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      <div className="search-results">
        {results.length === 0 && query && !loading && (
          <div className="empty-state">
            <p>No messages found for "{query}"</p>
          </div>
        )}

        {results.map((result) => (
          <div
            key={result.id}
            className="search-result-item"
            onClick={() => handleResultClick(result)}
          >
            <div className="result-sender">
              <div className="sender-avatar">
                {result.sender.profilePicture ? (
                  <img src={result.sender.profilePicture} alt={result.sender.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {result.sender.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="sender-info">
                <strong>{result.sender.name}</strong>
                <span className="result-date">{formatDate(result.createdAt)}</span>
              </div>
            </div>
            <div className="result-content">
              {highlightQuery(result.content)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MessageSearch
