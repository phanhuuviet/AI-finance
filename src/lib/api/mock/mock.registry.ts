import type { ApiError } from '../base/http';
import type { HttpRequestConfig } from '../base/request';
import { authMockEntries } from './auth.mock';
import { chatMockEntries } from './chat.mock';
import { dashboardMockEntries } from './dashboard.mock';
import { userMockEntries } from './user.mock';

export const USE_MOCK_FALLBACK =
  (import.meta.env.VITE_USE_MOCK_FALLBACK ?? 'true') === 'true';

export interface MockRequestContext {
  method: string;
  endpoint: string;
  path: string;
  query: URLSearchParams;
  config: HttpRequestConfig;
  error: ApiError;
}

export interface MockRegistryEntry<T = unknown> {
  method: string;
  pattern: RegExp;
  handler: (context: MockRequestContext) => T | Promise<T>;
}

const mockRegistry: MockRegistryEntry[] = [
  ...authMockEntries,
  ...userMockEntries,
  ...dashboardMockEntries,
  ...chatMockEntries
];

function normalizePath(path: string): string {
  if (!path) return '/';
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1);
  return path;
}

function parseEndpoint(endpoint: string): { path: string; query: URLSearchParams } {
  const [rawPath, rawQuery = ''] = endpoint.split('?');
  return {
    path: normalizePath(rawPath),
    query: new URLSearchParams(rawQuery)
  };
}

function matchEntry(method: string, path: string): MockRegistryEntry | undefined {
  return mockRegistry.find((entry) => {
    if (entry.method.toUpperCase() !== method.toUpperCase()) return false;
    return entry.pattern.test(path);
  });
}

export async function resolveMockFallback<T>(
  method: string,
  endpoint: string,
  config: HttpRequestConfig,
  error: ApiError
): Promise<T | undefined> {
  const { path, query } = parseEndpoint(endpoint);
  const entry = matchEntry(method, path);
  if (!entry) return undefined;

  const data = await entry.handler({
    method,
    endpoint,
    path,
    query,
    config,
    error
  });

  return data as T;
}
