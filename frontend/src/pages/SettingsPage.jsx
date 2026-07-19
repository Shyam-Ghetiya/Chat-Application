import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Button, Card } from '../components/ui'
import { 
  FiSun, 
  FiMoon, 
  FiBell, 
  FiLock, 
  FiUser,
  FiMail,
  FiCheck,
  FiVolume2,
  FiEye,
  FiWifi,
  FiCheckCircle
} from 'react-icons/fi'

function SettingsPage() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    messagePreview: true,
    onlineStatus: true,
    readReceipts: true
  })
  const [saved, setSaved] = useState(false)

  const handleSettingChange = (setting) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting]
    }))
    setSaved(false)
  }

  const handleSaveSettings = () => {
    // Save settings to localStorage or backend
    localStorage.setItem('userSettings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  // Toggle Switch Component
  const ToggleSwitch = ({ checked, onChange, disabled }) => (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
        checked
          ? 'bg-emerald-600'
          : 'bg-gray-200 dark:bg-gray-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white font-poppins mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account preferences and settings
          </p>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-400 flex items-center gap-2 animate-fade-in">
            <FiCheckCircle className="w-5 h-5" />
            Settings saved successfully!
          </div>
        )}

        {/* Appearance Section */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              {theme === 'light' ? (
                <FiSun className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <FiMoon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              )}
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Appearance
              </h2>
            </div>
            
            <div className="flex items-center justify-between py-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  Theme
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose your preferred color theme
                </p>
              </div>
              <Button
                variant="secondary"
                size="md"
                onClick={toggleTheme}
                leftIcon={theme === 'light' ? FiMoon : FiSun}
              >
                {theme === 'light' ? 'Dark' : 'Light'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Notifications Section */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiBell className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Notifications
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 flex-1">
                  <FiMail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white mb-1">
                      Email Notifications
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive notifications via email
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={settings.emailNotifications}
                  onChange={() => handleSettingChange('emailNotifications')}
                />
              </div>

              <div className="flex items-center justify-between py-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 flex-1">
                  <FiBell className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white mb-1">
                      Push Notifications
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive push notifications in browser
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={settings.pushNotifications}
                  onChange={() => handleSettingChange('pushNotifications')}
                />
              </div>

              <div className="flex items-center justify-between py-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 flex-1">
                  <FiVolume2 className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white mb-1">
                      Sound
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Play sound for new messages
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={settings.soundEnabled}
                  onChange={() => handleSettingChange('soundEnabled')}
                />
              </div>

              <div className="flex items-center justify-between py-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 flex-1">
                  <FiEye className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white mb-1">
                      Message Preview
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Show message preview in notifications
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={settings.messagePreview}
                  onChange={() => handleSettingChange('messagePreview')}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Privacy Section */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiLock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Privacy
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 flex-1">
                  <FiWifi className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white mb-1">
                      Online Status
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Show when you're online
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={settings.onlineStatus}
                  onChange={() => handleSettingChange('onlineStatus')}
                />
              </div>

              <div className="flex items-center justify-between py-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 flex-1">
                  <FiCheckCircle className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white mb-1">
                      Read Receipts
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Let others know when you've read their messages
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={settings.readReceipts}
                  onChange={() => handleSettingChange('readReceipts')}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Account Section */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiUser className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Account Information
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="py-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Email Address
                </p>
                <p className="text-gray-900 dark:text-white">
                  {user?.email}
                </p>
              </div>

              <div className="py-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Account ID
                </p>
                <p className="text-gray-900 dark:text-white font-mono text-sm">
                  {user?.id}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSaveSettings}
            leftIcon={FiCheck}
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
