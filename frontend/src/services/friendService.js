import { get, post, put, del } from './api'

export async function searchUsers(query) {
  return get(`/users?query=${encodeURIComponent(query)}`)
}

export async function sendFriendRequest(receiverId) {
  return post('/friend-request', { receiverId })
}

export async function acceptFriendRequest(requestId) {
  return put(`/friend-request/${requestId}/accept`)
}

export async function rejectFriendRequest(requestId) {
  return put(`/friend-request/${requestId}/reject`)
}

export async function cancelFriendRequest(requestId) {
  return del(`/friend-request/${requestId}`)
}

export async function getPendingRequests() {
  return get('/friend-requests/pending')
}

export async function getSentRequests() {
  return get('/friend-requests/sent')
}

export async function getFriends() {
  return get('/friends')
}
