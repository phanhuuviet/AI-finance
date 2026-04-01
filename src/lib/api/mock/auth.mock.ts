import type { AuthLoginResponse, User } from '../../models';
import type { MockRegistryEntry } from './mock.registry';

function parseJsonBody(body: unknown): Record<string, unknown> {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (body instanceof FormData) return {};
  return body as Record<string, unknown>;
}

function loginMock(): AuthLoginResponse {
  return {
    access_token: 'mock-access-token-v1',
    token_type: 'bearer',
    expires_in: 3600,
    issued_at: '2026-04-01T08:00:00.000Z'
  };
}

function registerMock(payload: Record<string, unknown>): User {
  return {
    _id: 'user_registered_001',
    id: 'user_registered_001',
    username: String(payload.username || 'new.user'),
    email: String(payload.email || 'new.user@example.com'),
    preferences: {
      model: 'gpt-4o-mini'
    },
    created_at: '2026-04-01T08:00:00.000Z'
  };
}

export const authMockEntries: MockRegistryEntry[] = [
  {
    method: 'POST',
    pattern: /^\/auth\/login\/?$/,
    handler: () => loginMock()
  },
  {
    method: 'POST',
    pattern: /^\/auth\/register\/?$/,
    handler: ({ config }) => registerMock(parseJsonBody(config.body))
  }
];
