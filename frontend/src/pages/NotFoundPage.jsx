import { useNavigate } from 'react-router-dom'
import './ErrorPages.css'

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="error-page">
      <div className="error-content">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Page Not Found</h2>
        <p className="error-message">
          Oops! The page you're looking for doesn't exist.
        </p>
        <div className="error-actions">
          <button onClick={() => navigate('/')} className="btn-primary">
            Go Home
          </button>
          <button onClick={() => navigate(-1)} className="btn-secondary">
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
