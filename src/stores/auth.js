import { writable } from 'svelte/store';
import { fetchWithAuth } from '../utils/api.js';

export const user = writable(null);
export const token = writable(localStorage.getItem('token') || null);

export const login = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString()
  });

  if (!res.ok) {
    throw new Error('Login failed');
  }

  const data = await res.json();
  localStorage.setItem('token', data.access_token);
  token.set(data.access_token);
  await fetchUser();
};

export const register = async (username, email, password) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password })
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || 'Registration failed');
  }

  // After registration, log them in automatically
  await login(username, password);
};

export const fetchUser = async () => {
  try {
    const userData = await fetchWithAuth('/auth/me');
    user.set(userData);
    return userData;
  } catch (error) {
    console.error('Error fetching user:', error);
    logout();
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  token.set(null);
  user.set(null);
};
