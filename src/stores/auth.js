import { writable } from 'svelte/store';
import { authService } from '../lib/services/auth.service';

/** @typedef {import('../lib/models').User} User */

const TOKEN_STORAGE_KEY = 'token';
const storage = typeof window !== 'undefined' && window.localStorage ? window.localStorage : undefined;

const persistedUser = authService.getStoredUser();

/** @type {import('svelte/store').Writable<User | null>} */
export const user = writable(/** @type {User | null} */ (persistedUser));

/** @type {import('svelte/store').Writable<string | null>} */
export const token = writable(/** @type {string | null} */ (storage?.getItem(TOKEN_STORAGE_KEY) || null));

/**
 * @param {string} username
 * @param {string} password
 * @returns {Promise<void>}
 */
export const login = async (username, password) => {
  const me = await authService.login({ username, password });
  token.set(authService.getStoredToken());
  user.set(me);
};

/**
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns {Promise<void>}
 */
export const register = async (username, email, password) => {
  await authService.register({ username, email, password });
};

/**
 * @returns {Promise<User>}
 */
export const fetchUser = async () => {
  const me = await authService.fetchUser();
  user.set(me);
  return me;
};

export const logout = () => {
  authService.logout();
  token.set(null);
  user.set(null);
};
