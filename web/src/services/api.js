export const API_BASE = import.meta.env.VITE_API_URL
export const WS_BASE  = API_BASE.replace(/^http/, 'ws')

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: 'Bearer ' + token }),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // 1) Читаем тело один раз
  const text = await res.text();

  // 2) Ловим «неавторизованность»
  const low = text.toLowerCase();
  if (
    res.status === 401 ||
    (res.status === 404 && low.includes('unauthorized'))
  ) {
    localStorage.removeItem('token');
    window.location.pathname = '/login';
    throw new Error('Unauthorized');
  }

  // 3) Другие ошибки
  if (!res.ok) {
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }

  // 4) Если тело пустое (204 No Content), возвращаем null
  if (res.status === 204 || !text) {
    return null;
  }

  // 5) Парсим JSON из единственной прочитанной строки
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON: ${e.message}`);
  }
}

export function register({ name, password }) {
  return request('/register', {
    method: 'POST',
    body: JSON.stringify({ name, password })
  })
}

export function login({ name, password }) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({ name, password })
  })
}

export function listUsers() {
  return request('/users');
}

// сброс cookie на сервере и очистка localStorage
export async function logout() {
  try {
    await request("/logout", { method: "POST" });
  } catch (e) {
    // Если неавторизован — считаем, что токен уже сгорел, и всё равно выходим
    if (e.status === 401) {
      return;
    }
    // Во всех остальных ошибках бросаем дальше
    throw e;
  }
}



// вернуть текущий профиль
export async function getProfile() {
  return request("/profile");
}

// обновить имя
export async function updateProfile(name) {
  return request("/profile", {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
}

// сменить пароль
export async function changePassword(current_password, new_password) {
  return request("/profile/password", {
    method: "POST",
    body: JSON.stringify({ current_password, new_password }),
  });
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

export function createChat({ title = "", is_group, members }) {
  console.log("createChat params:", { title, is_group, members });
  return request("/chats", {
    method: "POST",
    body: JSON.stringify({ title, is_group, members }),
  });
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
