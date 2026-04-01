import { writable } from 'svelte/store';

/** @typedef {import('../models/user').User} User */

const TOKEN_STORAGE_KEY = 'token';
const USER_STORAGE_KEY = 'user';
const MOCK_USERNAME = 'admin';
const MOCK_PASSWORD = '123';
const storage = typeof window !== 'undefined' && window.localStorage ? window.localStorage : undefined;

const persistedUser = (() => {
  if (!storage) return null;
  try {
    const raw = storage.getItem(USER_STORAGE_KEY);
    return raw ? /** @type {User} */ (JSON.parse(raw)) : null;
  } catch (error) {
    console.warn('Failed to parse stored user', error);
    return null;
  }
})();

/** @type {import('svelte/store').Writable<User | null>} */
export const user = writable(/** @type {User | null} */ (persistedUser));

/** @type {import('svelte/store').Writable<string | null>} */
export const token = writable(/** @type {string | null} */ (storage?.getItem(TOKEN_STORAGE_KEY) || null));

const MOCK_USER = /** @type {User} */ ({
  id: 'mock-admin',
  username: 'admin',
  email: 'admin@example.com'
});

const mockDelay = () => new Promise((resolve) => setTimeout(resolve, 350));

const persistSession = (accessToken, userData) => {
  storage?.setItem(TOKEN_STORAGE_KEY, accessToken);
  storage?.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
  token.set(accessToken);
  user.set(userData);
};

const generateMockToken = () => `mock-token-${Date.now()}`;

/**
 * @param {string} username
 * @param {string} password
 * @returns {Promise<void>}
 */
export const login = async (username, password) => {
  await mockDelay();

  const normalizedUsername = username.trim().toLowerCase();
  if (normalizedUsername !== MOCK_USERNAME || password !== MOCK_PASSWORD) {
    throw new Error('Sai thông tin đăng nhập (dùng admin / 123)');
  }

  persistSession(generateMockToken(), MOCK_USER);
};

/**
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns {Promise<void>}
 */
export const register = async (username, email, password) => {
  await mockDelay();
  throw new Error('Chế độ mock chỉ hỗ trợ đăng nhập bằng admin / 123');
};

/**
 * @returns {Promise<User>}
 */
export const fetchUser = async () => {
  await mockDelay();
  const stored = storage?.getItem(USER_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = /** @type {User} */ (JSON.parse(stored));
      user.set(parsed);
      return parsed;
    } catch (error) {
      console.warn('Stored user payload corrupted', error);
      logout();
      throw new Error('Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.');
    }
  }
  throw new Error('Không tìm thấy người dùng. Đăng nhập lại.');
};

export const logout = () => {
  storage?.removeItem(TOKEN_STORAGE_KEY);
  storage?.removeItem(USER_STORAGE_KEY);
  token.set(null);
  user.set(null);
};
