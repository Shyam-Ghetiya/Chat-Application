import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import * as profileAPI from '../services/profileService'
import * as fileService from '../services/fileService'
import './ProfilePage.css'

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
      <div className="profile-page">
        <div className="loading">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h2>My Profile</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Profile Picture Section */}
        <div className="profile-picture-section">
          <div className="profile-picture-display">
            {profile?.profilePicture ? (
              <img src={profile.profilePicture} alt="Profile" className="profile-picture" />
            ) : (
              <div className="profile-picture-placeholder">
                {profile?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="profile-picture-actions">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              accept="image/*"
            />
            
            <div className="picture-buttons">
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="btn-primary"
              >
                📷 Upload Image
              </button>
              {profile?.profilePicture && (
                <button 
                  onClick={handleRemoveProfilePicture} 
                  disabled={loading}
                  className="btn-danger"
                >
                  Remove Picture
                </button>
              )}
            </div>
            
            <div className="form-group">
              <label>Or enter image URL</label>
              <input
                type="text"
                name="profilePicture"
                value={formData.profilePicture}
                onChange={handleChange}
                placeholder="Enter image URL"
                disabled={loading}
              />
              <button 
                onClick={handleProfilePictureUpdate} 
                disabled={loading}
                className="btn-secondary btn-small"
              >
                Update from URL
              </button>
            </div>
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="profile-info-section">
          {!editMode ? (
            <div className="profile-view">
              <div className="profile-field">
                <label>Name</label>
                <p>{profile?.name}</p>
              </div>

              <div className="profile-field">
                <label>Email</label>
                <p>{profile?.email}</p>
              </div>

              <div className="profile-field">
                <label>About</label>
                <p>{profile?.about || 'No about information'}</p>
              </div>

              <div className="profile-field">
                <label>Status</label>
                <p>
                  <span className={`status-badge ${profile?.isOnline ? 'online' : 'offline'}`}>
                    {profile?.isOnline ? 'Online' : 'Offline'}
                  </span>
                </p>
              </div>

              <div className="profile-field">
                <label>Member Since</label>
                <p>{new Date(profile?.createdAt).toLocaleDateString()}</p>
              </div>

              <button 
                onClick={() => setEditMode(true)} 
                className="btn-primary"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="profile-edit">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="about">About</label>
                <textarea
                  id="about"
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  placeholder="Tell us about yourself"
                  rows="4"
                  disabled={loading}
                  maxLength="500"
                />
                <small>{formData.about.length}/500 characters</small>
              </div>

              <div className="form-buttons">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
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
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
