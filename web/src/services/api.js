export const API_BASE = import.meta.env.VITE_API_URL
export const WS_BASE  = API_BASE.replace(/^http/, 'ws')

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`)
  }
  return res.status !== 204 ? res.json() : null
}

export function createUser(name) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify({ name })
  })
}

export function listChats() {
  return request('/chats')
}

export function createChat({ title, is_group, members }) {
  return request('/chats', {
    method: 'POST',
    body: JSON.stringify({ title, is_group, members })
  })
}

export function listMessages(chatID) {
  return request(`/chats/${chatID}/messages`)
}

export function sendMessage(chatID, sender_id, content) {
  return request(`/chats/${chatID}/messages`, {
    method: 'POST',
    body: JSON.stringify({ sender_id, content })
  })
}

export function listPosts() {
  return request('/posts')
}

export function createPost({ author_id, title, body }) {
  return request('/posts', {
    method: 'POST',
    body: JSON.stringify({ author_id, title, body })
  })
}

export function getPost(id) {
  return request(`/posts/${id}`)
}

export function updatePost(id, { title, body }) {
  return request(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, body })
  })
}

export function deletePost(id) {
  return request(`/posts/${id}`, { method: 'DELETE' })
}
