const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

/**
 * @param {string} endpoint
 * @param {{ headers?: Record<string, string>, [key: string]: any }} options
 */
async function tryMock(endpoint, options) {
  const { canMockEndpoint, mockFetch } = await import('./mockApi.js');
  if (!canMockEndpoint(endpoint)) return null;
  return mockFetch(endpoint, options);
}

/**
 * Authenticated JSON fetch helper.
 *
 * Note: This function is intentionally generic; call sites can narrow via
 * JSDoc casts using `@type` on an assignment.
 *
 * @template T
 * @param {string} endpoint
 * @param {{
 *  method?: string;
 *  headers?: Record<string, string>;
 *  body?: any;
 *  [key: string]: any;
 * }} [options]
 * @returns {Promise<T>}
 */
export async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  /** @type {Record<string, string>} */
  const headers = {
    ...(options.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  // Only set Content-Type if it's not FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  } else {
    // Delete Content-Type for FormData to let browser set it with boundary
    delete headers['Content-Type'];
  }

  if (USE_MOCK_API) {
    const mocked = await tryMock(endpoint, { ...options, headers });
    if (mocked !== null) return mocked;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });
  } catch (err) {
    const mocked = await tryMock(endpoint, { ...options, headers });
    if (mocked !== null) return mocked;
    throw err;
  }

  if (response.status === 401) {
    // Handle unauthorized (e.g., clear token, redirect to login)
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'API request failed');
  }

  return response.json();
}
