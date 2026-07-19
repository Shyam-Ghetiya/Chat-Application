import { get, post, put, del } from './api'

export async function createConversation(type, memberIds, name = null) {
  return post('/conversations', { type, memberIds, name })
}

export async function getConversations() {
  return get('/conversations')
}

export async function getConversation(conversationId) {
  return get(`/conversations/${conversationId}`)
}

// Group Management
export async function renameGroup(conversationId, name) {
  return put(`/conversations/${conversationId}/rename`, { name })
}

export async function addMember(conversationId, userId) {
  return post(`/conversations/${conversationId}/members`, { userId })
}

export async function removeMember(conversationId, memberId) {
  return del(`/conversations/${conversationId}/members/${memberId}`)
}

export async function leaveGroup(conversationId) {
  return post(`/conversations/${conversationId}/leave`, {})
}

export async function deleteGroup(conversationId) {
  return del(`/conversations/${conversationId}`)
}
