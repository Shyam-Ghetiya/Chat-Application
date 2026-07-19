import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { FiHome, FiArrowLeft, FiAlertCircle } from 'react-icons/fi'

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
      <div className="text-center max-w-md animate-fade-in-up">
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 rounded-full flex items-center justify-center">
          <FiAlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
        </div>

        {/* Error Code */}
        <h1 className="text-8xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4 font-poppins">
          404
        </h1>

        {/* Title */}
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h2>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/')}
            leftIcon={FiHome}
          >
            Go Home
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate(-1)}
            leftIcon={FiArrowLeft}
          >
            Go Back
          </Button>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  )
}

export default NotFoundPage
