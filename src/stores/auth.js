import { writable } from 'svelte/store';
import { fetchWithAuth } from '../utils/api.js';

/** @typedef {import('../models/user').User} User */
/** @typedef {import('../models/auth').AuthLoginResponse} AuthLoginResponse */

/** @type {import('svelte/store').Writable<User | null>} */
export const user = writable(/** @type {User | null} */ (null));

/** @type {import('svelte/store').Writable<string | null>} */
export const token = writable(/** @type {string | null} */ (localStorage.getItem('token') || null));

/**
 * @param {string} username
 * @param {string} password
 * @returns {Promise<void>}
 */
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

  /** @type {AuthLoginResponse} */
  const data = await res.json();
  localStorage.setItem('token', data.access_token);
  token.set(data.access_token);
  await fetchUser();
};

/**
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns {Promise<void>}
 */
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

/**
 * @returns {Promise<User>}
 */
export const fetchUser = async () => {
  try {
    /** @type {User} */
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
