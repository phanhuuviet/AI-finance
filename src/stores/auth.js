import { derived, get, writable } from 'svelte/store';
import { authService } from '../lib/services/auth.service';
import { createLoadingGate } from '../lib/utils/loading.js';
import { authStore } from '../lib/stores/auth.store';
import { userApi } from '../lib/api/modules/user.api';

/** @typedef {import('../lib/models/auth.model').User} User */

/** @type {import('svelte/store').Readable<User | null>} */
export const user = derived(authStore, ($s) => /** @type {User | null} */ ($s.user));
console.log('user data', get(user));
const initialAsync = {
  data: null,
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
    await authService.login({ email: username, password });
    const me = get(authStore).user;
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
    await authService.register({ email, full_name: username, password });
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
    await authService.fetchCurrentUser();
    const me = get(authStore).user;
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
 * @param {Record<string, unknown>} payload
 * @returns {Promise<User | null>}
 */
export const updateProfile = async (payload) => {
  authState.update((state) => ({ ...state, updating: true, error: null }));
  try {
    await userApi.updateProfile(payload);
    await authService.fetchCurrentUser();
    const me = get(authStore).user;
    authState.update((state) => ({ ...state, data: me, error: null }));
    return me;
  } catch (error) {
    authState.update((state) => ({ ...state, error: error?.message || 'Failed to update profile.' }));
    throw error;
  } finally {
    authState.update((state) => ({ ...state, updating: false }));
  }
};

export const logout = async () => {
  await authService.logout();
  authState.set({ ...initialAsync, data: null });
};
