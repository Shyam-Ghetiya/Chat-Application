import { get, put, del } from './api'

export async function getNotifications() {
  return get('/notifications')
}

export async function getUnreadNotifications() {
  return get('/notifications/unread')
}

export async function getUnreadCount() {
  return get('/notifications/unread/count')
}

export async function markAsRead(notificationId) {
  return put(`/notifications/${notificationId}/read`, {})
}

export async function markAllAsRead() {
  return put('/notifications/read-all', {})
}

export async function deleteNotification(notificationId) {
  return del(`/notifications/${notificationId}`)
}
