import { get, writable } from 'svelte/store';
import { ROUTE_DEFINITIONS, DEFAULT_PROTECTED_ROUTE, NOT_FOUND_ROUTE, ROOT_REDIRECT_PATH } from '../routes/definitions.js';
import { authStore } from '../lib/stores/auth.store';
import { tokenStorage } from '../lib/utils/token';

/**
 * @typedef {'workspace' | 'analytics' | 'settings' | 'login' | 'not-found'} Page
 * @typedef {{
 *   pathname: string;
 *   page: Page;
 *   chatId: string | null;
 *   generationId: string | null;
 *   compositionId: string | null;
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

/**
 * @param {string} pathname
 * @param {boolean} [hasSession]
 */
function parseRoute(pathname, hasSession) {
  const normalized = normalizePath(pathname);
  const snapshot = hasSession ?? tokenStorage.hasValidSession();

  if (normalized === '/' || normalized === '') {
    return coerceRoute(DEFAULT_PROTECTED_ROUTE, null, snapshot);
  }

  for (const definition of ROUTE_DEFINITIONS) {
    const match = normalized.match(definition.pattern);
    if (match) {
      return coerceRoute(definition, match, snapshot);
    }
  }

  return coerceRoute(NOT_FOUND_ROUTE, null, snapshot);
}

/**
 * @param {{ requiresAuth: boolean; build: (match: RegExpMatchArray | null) => Route }} definition
 * @param {RegExpMatchArray | null} match
 * @param {boolean} hasSession
 */
function coerceRoute(definition, match, hasSession) {
  if (definition.requiresAuth && !hasSession) {
    return NOT_FOUND_ROUTE.build(null);
  }

  return definition.build(match);
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

  if (current === '/' || current === '') {
    navigate(ROOT_REDIRECT_PATH, { replace: true });
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
  const parsedTarget = parseRoute(to);
  const target = parsedTarget.pathname;
  const current = normalizePath(window.location.pathname);

  if (target === current) {
    store.set(parsedTarget);
    return;
  }

  if (opts.replace) {
    window.history.replaceState({}, '', target);
  } else {
    window.history.pushState({}, '', target);
  }

  syncFromLocation();
}

authStore.subscribe(() => {
  if (typeof window === 'undefined') return;
  const current = normalizePath(window.location.pathname);
  const parsed = parseRoute(current, tokenStorage.hasValidSession());

  if (parsed.pathname !== current) {
    navigate(parsed.pathname, { replace: true });
    return;
  }

  store.set(parsed);
});
