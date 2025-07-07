const API_URL = 'http://localhost:3000/api';

export async function registerUser(username, password, email = '', role = 'editor') {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email, role })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Erro ao registrar.');
  }

  return data;
}

export async function loginUser(username, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Erro no login.');
  }

  // Salva o usuário no localStorage
  localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
}

export function getUser() {
  return JSON.parse(localStorage.getItem('user'));
}

export function isLoggedIn() {
  return !!localStorage.getItem('user');
}

export function logout() {
  localStorage.removeItem('user');
}