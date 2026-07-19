import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import * as profileAPI from '../services/profileService'
import * as fileService from '../services/fileService'
import { Avatar, Button, Input, Card } from '../components/ui'
import { 
  FiUser, 
  FiMail, 
  FiCalendar, 
  FiEdit2, 
  FiCamera,
  FiTrash2,
  FiSave,
  FiX,
  FiCheckCircle,
  FiWifi
} from 'react-icons/fi'

function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    about: '',
    profilePicture: '',
  })
  
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await profileAPI.getProfile()
      setProfile(data)
      setFormData({
        name: data.name || '',
        about: data.about || '',
        profilePicture: data.profilePicture || '',
      })
    } catch (err) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.name || formData.name.length < 2) {
      setError('Name must be at least 2 characters')
      return
    }

    setLoading(true)

    try {
      const updated = await profileAPI.updateProfile({
        name: formData.name,
        about: formData.about,
      })
      setProfile(updated)
      setSuccess('Profile updated successfully!')
      setEditMode(false)
      
      // Update user in AuthContext
      if (updateUser) {
        updateUser({ ...user, name: updated.name })
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleProfilePictureUpdate = async () => {
    if (!formData.profilePicture) {
      setError('Please enter a profile picture URL')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const updated = await profileAPI.updateProfilePicture(formData.profilePicture)
      setProfile(updated)
      setSuccess('Profile picture updated!')
    } catch (err) {
      setError('Failed to update profile picture')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveProfilePicture = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const updated = await profileAPI.removeProfilePicture()
      setProfile(updated)
      setFormData({ ...formData, profilePicture: '' })
      setSuccess('Profile picture removed!')
      
      // Update user in AuthContext
      if (updateUser) {
        updateUser({ ...user, profilePicture: null })
      }
    } catch (err) {
      setError('Failed to remove profile picture')
    } finally {
      setLoading(false)
    }
  }
  
  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Validate it's an image
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    
    // Check file size (5MB limit for profile pictures)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }
    
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const result = await fileService.uploadProfilePicture(file)
      const updated = { ...profile, profilePicture: result.profilePicture }
      setProfile(updated)
      setFormData({ ...formData, profilePicture: result.profilePicture })
      setSuccess('Profile picture uploaded successfully!')
      
      // Update user in AuthContext
      if (updateUser) {
        updateUser({ ...user, profilePicture: result.profilePicture })
      }
    } catch (err) {
      setError(err.message || 'Failed to upload profile picture')
    } finally {
      setLoading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white font-poppins mb-2">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your personal information and profile picture
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm animate-shake">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2">
            <FiCheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Profile Picture Card */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Profile Picture
            </h2>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar Display */}
              <div className="relative group">
                <Avatar
                  name={profile?.name}
                  src={profile?.profilePicture}
                  size="2xl"
                  className="ring-4 ring-gray-100 dark:ring-gray-700"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiCamera className="w-8 h-8 text-white" />
                </button>
              </div>

              {/* Upload Actions */}
              <div className="flex-1 space-y-4 w-full">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*"
                />
                
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    leftIcon={FiCamera}
                  >
                    Upload Image
                  </Button>
                  
                  {profile?.profilePicture && (
                    <Button
                      variant="danger"
                      size="md"
                      onClick={handleRemoveProfilePicture}
                      disabled={loading}
                      leftIcon={FiTrash2}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                {/* URL Input */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Or enter an image URL
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      name="profilePicture"
                      value={formData.profilePicture}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                      disabled={loading}
                      className="flex-1"
                    />
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={handleProfilePictureUpdate}
                      disabled={loading || !formData.profilePicture}
                    >
                      Update
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Information Card */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Profile Information
              </h2>
              {!editMode && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setEditMode(true)}
                  leftIcon={FiEdit2}
                >
                  Edit Profile
                </Button>
              )}
            </div>

            {!editMode ? (
              <div className="space-y-6">
                {/* View Mode */}
                <div className="flex items-start gap-4 py-4 border-t border-gray-100 dark:border-gray-700">
                  <FiUser className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Full Name
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {profile?.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 py-4 border-t border-gray-100 dark:border-gray-700">
                  <FiMail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Email Address
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {profile?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 py-4 border-t border-gray-100 dark:border-gray-700">
                  <FiUser className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      About
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {profile?.about || 'No about information'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 py-4 border-t border-gray-100 dark:border-gray-700">
                  <FiWifi className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Status
                    </p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${profile?.isOnline ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                      <span className="text-gray-900 dark:text-white">
                        {profile?.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 py-4 border-t border-gray-100 dark:border-gray-700">
                  <FiCalendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Member Since
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(profile?.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Edit Mode */}
                <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                  <Input
                    label="Full Name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    icon={FiUser}
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    About
                  </label>
                  <textarea
                    name="about"
                    value={formData.about}
                    onChange={handleChange}
                    placeholder="Tell us about yourself"
                    rows="4"
                    disabled={loading}
                    maxLength="500"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all resize-none"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {formData.about.length}/500 characters
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading}
                    loading={loading}
                    leftIcon={FiSave}
                    className="flex-1"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={() => {
                      setEditMode(false)
                      setFormData({
                        name: profile.name,
                        about: profile.about || '',
                        profilePicture: profile.profilePicture || '',
                      })
                      setError('')
                    }}
                    disabled={loading}
                    leftIcon={FiX}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ProfilePage
