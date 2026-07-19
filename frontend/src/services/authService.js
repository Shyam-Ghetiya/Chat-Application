import { post, get } from './api'

export async function register(name, email, password) {
  return post('/auth/register', { name, email, password })
}

export async function login(email, password) {
  return post('/auth/login', { email, password })
}

export async function getCurrentUser() {
  return get('/auth/me')
}
