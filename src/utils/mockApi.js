import { getMockTokenUsageAnalytics } from './mockTokenAnalytics.js';

/** @typedef {import('../models/user').User} User */
/** @typedef {import('../models/tokenAnalytics').TokenUsageAnalytics} TokenUsageAnalytics */

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MOCK_USER_STORAGE_KEY = 'mock_user_v1';

function getDefaultMockUser() {
  /** @type {User} */
  const u = {
    _id: 'user_demo',
    id: 'user_demo',
    username: 'demo',
    email: 'demo@example.com',
    preferences: {
      model: 'gpt-3.5-turbo'
    }
  };
  return u;
}

function readMockUser() {
  const raw = localStorage.getItem(MOCK_USER_STORAGE_KEY);
  if (!raw) return getDefaultMockUser();
  try {
    const parsed = JSON.parse(raw);
    return {
      ...getDefaultMockUser(),
      ...(parsed || {}),
      preferences: {
        ...getDefaultMockUser().preferences,
        ...(parsed?.preferences || {})
      }
    };
  } catch {
    return getDefaultMockUser();
  }
}

/** @param {User} user */
function writeMockUser(user) {
  localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(user));
  return user;
}

function parseEndpoint(endpoint) {
  const [path, queryString = ''] = String(endpoint || '').split('?');
  const query = new URLSearchParams(queryString);
  return { path, query };
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeMethod(options = {}) {
  return String(options?.method || 'GET').toUpperCase();
}

export function canMockEndpoint(endpoint) {
  const { path } = parseEndpoint(endpoint);
  return path === '/auth/me' || path === '/analytics/tokens';
}

export async function mockFetch(endpoint, options = {}) {
  const method = normalizeMethod(options);
  const { path, query } = parseEndpoint(endpoint);

  if (path === '/analytics/tokens' && method === 'GET') {
    await delay(250);
    const days = Number(query.get('days') || 30);
    /** @type {TokenUsageAnalytics} */
    const data = getMockTokenUsageAnalytics(days);
    return data;
  }

  if (path === '/auth/me' && method === 'GET') {
    await delay(200);
    const user = readMockUser();
    writeMockUser(user);
    return user;
  }

  if (path === '/auth/me' && (method === 'PUT' || method === 'PATCH')) {
    await delay(450);

    const existing = readMockUser();
    const body = typeof options?.body === 'string' ? safeJsonParse(options.body) : options?.body;

    const next = {
      ...existing,
      ...(body || {}),
      preferences: {
        ...(existing.preferences || {}),
        ...(body?.preferences || {})
      }
    };

    return writeMockUser(next);
  }

  await delay(200);
  throw new Error(`Mock API: no handler for ${method} ${path}`);
}
