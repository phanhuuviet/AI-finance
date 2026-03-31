import { writable } from 'svelte/store';

/**
 * @typedef {'workspace' | 'analytics' | 'settings' | 'login'} Page
 * @typedef {{
 *  pathname: string;
 *  page: Page;
 *  chatId: string | null;
 * }} Route
 */

/** @param {string} path */
function normalizePath(path) {
  if (!path) return '/';
  let out = path;

  // Strip query/hash if accidentally provided
  const q = out.indexOf('?');
  const h = out.indexOf('#');
  const cut = q === -1 ? h : h === -1 ? q : Math.min(q, h);
  if (cut !== -1) out = out.slice(0, cut);

  if (!out.startsWith('/')) out = '/' + out;
  // Remove trailing slash (except root)
  if (out.length > 1 && out.endsWith('/')) out = out.slice(0, -1);
  return out;
}

/** @param {string} pathname */
function parseRoute(pathname) {
  const normalized = normalizePath(pathname);
  const parts = normalized.split('/').filter(Boolean);

  /** @type {Route} */
  const route = {
    pathname: normalized,
    page: 'workspace',
    chatId: null
  };

  if (parts.length === 0) {
    route.page = 'workspace';
    return route;
  }

  const [first, second] = parts;
  if (first === 'workspace') {
    route.page = 'workspace';
    route.chatId = second || null;
    return route;
  }

  if (first === 'analytics') {
    route.page = 'analytics';
    return route;
  }

  if (first === 'settings') {
    route.page = 'settings';
    return route;
  }

  if (first === 'login') {
    route.page = 'login';
    return route;
  }

  // Unknown path -> treat as workspace (caller may redirect)
  route.page = 'workspace';
  route.pathname = '/workspace';
  route.chatId = null;
  return route;
}

const store = writable(
  /** @type {Route} */
  (parseRoute(typeof window !== 'undefined' ? window.location.pathname : '/'))
);

export const route = {
  subscribe: store.subscribe
};

function syncFromLocation() {
  store.set(parseRoute(window.location.pathname));
}

let started = false;

/**
 * Call once on app startup.
 * @returns {() => void} cleanup
 */
export function initRouter() {
  if (started || typeof window === 'undefined') return () => {};
  started = true;

  const current = normalizePath(window.location.pathname);

  // Root redirect: / -> /workspace
  if (current === '/' || current === '') {
    navigate('/workspace', { replace: true });
  } else {
    const parsed = parseRoute(current);
    if (parsed.pathname !== current) {
      navigate(parsed.pathname, { replace: true });
    } else {
      syncFromLocation();
    }
  }

  const onPopState = () => syncFromLocation();
  window.addEventListener('popstate', onPopState);

  return () => {
    window.removeEventListener('popstate', onPopState);
    started = false;
  };
}

/**
 * @param {string} to
 * @param {{ replace?: boolean }} [opts]
 */
export function navigate(to, opts = {}) {
  if (typeof window === 'undefined') return;
  const target = normalizePath(to);
  const current = normalizePath(window.location.pathname);

  if (target === current) {
    syncFromLocation();
    return;
  }

  if (opts.replace) {
    window.history.replaceState({}, '', target);
  } else {
    window.history.pushState({}, '', target);
  }

  syncFromLocation();
}
