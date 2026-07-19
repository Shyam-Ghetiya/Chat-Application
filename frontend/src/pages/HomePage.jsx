import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Avatar } from '../components/ui'
import { 
  FiMessageCircle, 
  FiUsers, 
  FiPhone, 
  FiSettings,
  FiCheckCircle,
  FiUser,
  FiMail
} from 'react-icons/fi'

function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const quickActions = [
    {
      icon: FiMessageCircle,
      label: 'Start Chatting',
      description: 'View your conversations',
      path: '/chats',
      color: 'emerald'
    },
    {
      icon: FiUsers,
      label: 'Find Friends',
      description: 'Connect with people',
      path: '/friends',
      color: 'blue'
    },
    {
      icon: FiPhone,
      label: 'Call History',
      description: 'View recent calls',
      path: '/calls',
      color: 'purple'
    },
    {
      icon: FiSettings,
      label: 'Settings',
      description: 'Customize your experience',
      path: '/settings',
      color: 'gray'
    }
  ]

  const features = [
    'Real-time messaging with WebSocket',
    'Voice and video calls',
    'Group conversations',
    'File sharing and media',
    'Read receipts and typing indicators',
    'Online presence tracking',
    'Dark mode support',
    'Responsive design'
  ]

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
        {/* Welcome Section */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-block mb-4">
            <Avatar
              name={user?.name}
              src={user?.profilePicture}
              size="2xl"
              className="ring-4 ring-white dark:ring-gray-700 shadow-xl"
            />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 font-poppins">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            You're all set to connect with friends and start conversations
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up animation-delay-200">
          {quickActions.map((action, index) => {
            // Define colors statically for each action
            const colorClasses = {
              emerald: 'bg-emerald-100 dark:bg-emerald-900/20',
              blue: 'bg-blue-100 dark:bg-blue-900/20',
              purple: 'bg-purple-100 dark:bg-purple-900/20',
              gray: 'bg-gray-100 dark:bg-gray-700'
            }
            
            const iconColorClasses = {
              emerald: 'text-emerald-600 dark:text-emerald-400',
              blue: 'text-blue-600 dark:text-blue-400',
              purple: 'text-purple-600 dark:text-purple-400',
              gray: 'text-gray-600 dark:text-gray-400'
            }
            
            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="group"
              >
                <Card className="h-full hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="p-6 text-center">
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl ${colorClasses[action.color]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <action.icon className={`w-7 h-7 ${iconColorClasses[action.color]}`} />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {action.label}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                </Card>
              </button>
            )
          })}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up animation-delay-400">
          {/* Profile Card */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <FiUser className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Your Profile
                </h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <FiUser className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Full Name
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user?.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <FiMail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Email Address
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => navigate('/profile')}
                  leftIcon={FiUser}
                  className="mt-4"
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          </Card>

          {/* Features Card */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <FiCheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Available Features
                </h2>
              </div>
              
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
                  >
                    <FiCheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-br from-emerald-600 to-blue-600 border-0 animate-fade-in-up animation-delay-600">
          <div className="p-8 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3 font-poppins">
              Ready to Connect?
            </h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Start conversations with your friends, make voice and video calls, and share moments together.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/chats')}
                leftIcon={FiMessageCircle}
                className="bg-black hover:bg-gray-100 text-emerald-600"
              >
                Open Chats
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/search')}
                leftIcon={FiUsers}
                className="bg-white/10 hover:bg-white/20 text-white border-white/30"
              >
                Find Friends
              </Button>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 pb-8">
          <p>© 2026 ChatVerse. Built with ❤️ for seamless communication.</p>
        </div>
      </div>
    </div>
  )
}

export default HomePage
