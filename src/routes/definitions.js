/**
 * @typedef {'workspace' | 'analytics' | 'settings' | 'login' | 'not-found'} Page
 * @typedef {{
 *   pathname: string;
 *   page: Page;
 *   chatId: string | null;
 *   generationId: string | null;
 *   compositionId: string | null;
 * }} Route
 * @typedef {{
 *   name: Page;
 *   requiresAuth: boolean;
 *   pattern: RegExp;
 *   build: (match: RegExpMatchArray | null) => Route;
 * }} RouteDefinition
 */

import { ROUTES } from '$lib/constants/index.js';

const workspaceRoute = /** @type {RouteDefinition} */ ({
  name: 'workspace',
  requiresAuth: true,
  pattern: /^\/workspace(?:\/([^/]+)(?:\/(generations|compositions)\/([^/]+))?)?$/,
  build: (match) => {
    const chatId = match?.[1] ?? null;
    const detailType = match?.[2] ?? null;
    const detailId = match?.[3] ?? null;
    const generationId = detailType === 'generations' ? detailId : null;
    const compositionId = detailType === 'compositions' ? detailId : null;

    /** @type {string} */
    let pathname = ROUTES.WORKSPACE;
    if (chatId) {
      pathname = `${ROUTES.WORKSPACE}/${chatId}`;
      if (generationId) {
        pathname = `${pathname}/generations/${generationId}`;
      } else if (compositionId) {
        pathname = `${pathname}/compositions/${compositionId}`;
      }
    }

    return {
      pathname,
      page: 'workspace',
      chatId,
      generationId,
      compositionId
    };
  }
});

const analyticsRoute = /** @type {RouteDefinition} */ ({
  name: 'analytics',
  requiresAuth: true,
  pattern: /^\/analytics$/,
  build: () => ({
    pathname: ROUTES.ANALYTICS,
    page: 'analytics',
    chatId: null,
    generationId: null,
    compositionId: null
  })
});

const settingsRoute = /** @type {RouteDefinition} */ ({
  name: 'settings',
  requiresAuth: true,
  pattern: /^\/settings$/,
  build: () => ({
    pathname: ROUTES.SETTINGS,
    page: 'settings',
    chatId: null,
    generationId: null,
    compositionId: null
  })
});

const loginRoute = /** @type {RouteDefinition} */ ({
  name: 'login',
  requiresAuth: false,
  pattern: /^\/login$/,
  build: () => ({
    pathname: ROUTES.LOGIN,
    page: 'login',
    chatId: null,
    generationId: null,
    compositionId: null
  })
});

const notFoundRoute = /** @type {RouteDefinition} */ ({
  name: 'not-found',
  requiresAuth: false,
  pattern: /^\/404$/,
  build: () => ({
    pathname: ROUTES.NOT_FOUND,
    page: 'not-found',
    chatId: null,
    generationId: null,
    compositionId: null
  })
});

export const ROUTE_DEFINITIONS = /** @type {RouteDefinition[]} */ ([
  workspaceRoute,
  analyticsRoute,
  settingsRoute,
  loginRoute,
  notFoundRoute
]);

export const DEFAULT_PROTECTED_ROUTE = workspaceRoute;
export const LOGIN_ROUTE = loginRoute;
export const NOT_FOUND_ROUTE = notFoundRoute;
export const ROOT_REDIRECT_PATH = ROUTES.WORKSPACE;
