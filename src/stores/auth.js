import { writable } from 'svelte/store';
import { authService } from '../lib/services/auth.service';
import { createLoadingGate } from '../lib/utils/loading.js';

/** @typedef {import('../lib/models').User} User */

const TOKEN_STORAGE_KEY = 'token';
const storage = typeof window !== 'undefined' && window.localStorage ? window.localStorage : undefined;

const persistedUser = authService.getStoredUser();

/** @type {import('svelte/store').Writable<User | null>} */
export const user = writable(/** @type {User | null} */ (persistedUser));

/** @type {import('svelte/store').Writable<string | null>} */
export const token = writable(/** @type {string | null} */ (storage?.getItem(TOKEN_STORAGE_KEY) || null));

const initialAsync = {
  data: persistedUser,
  loading: false,
  showLoading: false,
  updating: false,
  error: null
};

export const authState = writable(initialAsync);

const authLoadingGate = createLoadingGate(() => {
  authState.update((state) => ({ ...state, showLoading: true }));
});

/**
 * @param {string} username
 * @param {string} password
 * @returns {Promise<void>}
 */
export const login = async (username, password) => {
  authLoadingGate.start();
  authState.update((state) => ({ ...state, loading: true, showLoading: false, error: null }));
  try {
    const me = await authService.login({ username, password });
    token.set(authService.getStoredToken());
    user.set(me);
    authState.update((state) => ({ ...state, data: me, error: null }));
  } catch (error) {
    authState.update((state) => ({ ...state, error: error?.message || 'Login failed.' }));
    throw error;
  } finally {
    authLoadingGate.stop();
    authState.update((state) => ({ ...state, loading: false, showLoading: false }));
  }
};

/**
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns {Promise<void>}
 */
export const register = async (username, email, password) => {
  authLoadingGate.start();
  authState.update((state) => ({ ...state, loading: true, showLoading: false, error: null }));
  try {
    await authService.register({ username, email, password });
  } catch (error) {
    authState.update((state) => ({ ...state, error: error?.message || 'Register failed.' }));
    throw error;
  } finally {
    authLoadingGate.stop();
    authState.update((state) => ({ ...state, loading: false, showLoading: false }));
  }
};

/**
 * @returns {Promise<User>}
 */
export const fetchUser = async () => {
  authLoadingGate.start();
  authState.update((state) => ({ ...state, loading: true, showLoading: false, error: null }));
  try {
    const me = await authService.fetchUser();
    user.set(me);
    authState.update((state) => ({ ...state, data: me, error: null }));
    return me;
  } catch (error) {
    authState.update((state) => ({ ...state, error: error?.message || 'Failed to fetch user.' }));
    throw error;
  } finally {
    authLoadingGate.stop();
    authState.update((state) => ({ ...state, loading: false, showLoading: false }));
  }
};

/**
 * @param {Partial<User>} payload
 * @returns {Promise<User>}
 */
export const updateProfile = async (payload) => {
  authState.update((state) => ({ ...state, updating: true, error: null }));
  try {
    const updated = await authService.updateUser(payload);
    user.set(updated);
    authState.update((state) => ({ ...state, data: updated, error: null }));
    return updated;
  } catch (error) {
    authState.update((state) => ({ ...state, error: error?.message || 'Failed to update profile.' }));
    throw error;
  } finally {
    authState.update((state) => ({ ...state, updating: false }));
  }
};

export const logout = () => {
  authService.logout();
  token.set(null);
  user.set(null);
  authState.set({ ...initialAsync, data: null });
};
