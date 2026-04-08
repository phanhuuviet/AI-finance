import { derived } from 'svelte/store';
import { route } from '../stores/router.js';

function toParams(pathname) {
  const clean = String(pathname || '').replace(/\/+/g, '/');
  const parts = clean.split('/').filter(Boolean);

  if (parts[0] !== 'workspace') return {};

  const sessionId = parts[1] || '';
  const generationId = parts[2] === 'generations' ? (parts[3] || '') : '';

  const params = {};
  if (sessionId) params.sessionId = sessionId;
  if (generationId) params.generationId = generationId;
  return params;
}

export const page = derived(route, ($route) => ({
  route: {
    id: $route.pathname
  },
  state: {
    page: $route.page
  },
  params: toParams($route.pathname),
  url: typeof window !== 'undefined' ? new URL(window.location.href) : undefined
}));
