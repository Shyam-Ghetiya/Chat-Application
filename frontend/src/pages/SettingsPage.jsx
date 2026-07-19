import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import './SettingsPage.css'

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

  const handleSettingChange = (setting) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting]
    }))
  }

  const handleSaveSettings = () => {
    // Save settings to localStorage or backend
    localStorage.setItem('userSettings', JSON.stringify(settings))
    alert('Settings saved successfully!')
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h2>Settings</h2>

        {/* Appearance */}
        <section className="settings-section">
          <h3>Appearance</h3>
          <div className="setting-item">
            <div className="setting-info">
              <label>Theme</label>
              <p>Choose your preferred theme</p>
            </div>
            <button onClick={toggleTheme} className="theme-switch">
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </section>

        {/* Notifications */}
        <section className="settings-section">
          <h3>Notifications</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <label>Email Notifications</label>
              <p>Receive notifications via email</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => handleSettingChange('emailNotifications')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Push Notifications</label>
              <p>Receive push notifications in browser</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={() => handleSettingChange('pushNotifications')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Sound</label>
              <p>Play sound for new messages</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={() => handleSettingChange('soundEnabled')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Message Preview</label>
              <p>Show message preview in notifications</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.messagePreview}
                onChange={() => handleSettingChange('messagePreview')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </section>

        {/* Privacy */}
        <section className="settings-section">
          <h3>Privacy</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <label>Online Status</label>
              <p>Show when you're online</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.onlineStatus}
                onChange={() => handleSettingChange('onlineStatus')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Read Receipts</label>
              <p>Let others know when you've read their messages</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.readReceipts}
                onChange={() => handleSettingChange('readReceipts')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </section>

        {/* Account */}
        <section className="settings-section">
          <h3>Account</h3>
          <div className="setting-item">
            <div className="setting-info">
              <label>Email</label>
              <p>{user?.email}</p>
            </div>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <label>Account ID</label>
              <p>{user?.id}</p>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="settings-actions">
          <button onClick={handleSaveSettings} className="btn-primary">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
