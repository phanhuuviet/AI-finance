/**
 * @typedef {'workspace' | 'analytics' | 'settings' | 'login'} Page
 * @typedef {{
 *   pathname: string;
 *   page: Page;
 *   chatId: string | null;
 * }} Route
 * @typedef {{
 *   name: Page;
 *   requiresAuth: boolean;
 *   pattern: RegExp;
 *   build: (match: RegExpMatchArray | null) => Route;
 * }} RouteDefinition
 */

const workspaceRoute = /** @type {RouteDefinition} */ ({
  name: 'workspace',
  requiresAuth: true,
  pattern: /^\/workspace(?:\/([^/]+))?$/,
  build: (match) => {
    const chatId = match?.[1] ?? null;
    return {
      pathname: chatId ? `/workspace/${chatId}` : '/workspace',
      page: 'workspace',
      chatId
    };
  }
});

const analyticsRoute = /** @type {RouteDefinition} */ ({
  name: 'analytics',
  requiresAuth: true,
  pattern: /^\/analytics$/,
  build: () => ({
    pathname: '/analytics',
    page: 'analytics',
    chatId: null
  })
});

const settingsRoute = /** @type {RouteDefinition} */ ({
  name: 'settings',
  requiresAuth: true,
  pattern: /^\/settings$/,
  build: () => ({
    pathname: '/settings',
    page: 'settings',
    chatId: null
  })
});

const loginRoute = /** @type {RouteDefinition} */ ({
  name: 'login',
  requiresAuth: false,
  pattern: /^\/login$/,
  build: () => ({
    pathname: '/login',
    page: 'login',
    chatId: null
  })
});

export const ROUTE_DEFINITIONS = /** @type {RouteDefinition[]} */ ([
  workspaceRoute,
  analyticsRoute,
  settingsRoute,
  loginRoute
]);

export const DEFAULT_PROTECTED_ROUTE = workspaceRoute;
export const LOGIN_ROUTE = loginRoute;
export const ROOT_REDIRECT_PATH = '/workspace';
