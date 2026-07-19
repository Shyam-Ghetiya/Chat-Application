import { get, put, del } from './api'

export async function getProfile() {
  return get('/profile')
}

export async function updateProfile(data) {
  return put('/profile', data)
}

export async function updateProfilePicture(profilePicture) {
  return put('/profile/picture', { profilePicture })
}

export async function removeProfilePicture() {
  return del('/profile/picture')
}

export async function updateAbout(about) {
  return put('/profile/about', { about })
}
