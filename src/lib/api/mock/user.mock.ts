import type { User } from '../../models';
import type { MockRegistryEntry } from './mock.registry';

let currentUser: User = {
  _id: 'user_demo_001',
  id: 'user_demo_001',
  username: 'demo.user',
  email: 'demo.user@example.com',
  preferences: {
    model: 'gpt-4o-mini'
  },
  updated_at: '2026-04-01T08:00:00.000Z'
};

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

function mergeProfileUpdate(payload: Record<string, unknown>): User {
  const preferences =
    typeof payload.preferences === 'object' && payload.preferences !== null
      ? (payload.preferences as Record<string, unknown>)
      : {};

  currentUser = {
    ...currentUser,
    ...payload,
    preferences: {
      ...(currentUser.preferences || {}),
      ...preferences,
      model: String(
        (preferences.model as string | undefined) ||
          currentUser.preferences?.model ||
          'gpt-4o-mini'
      )
    },
    updated_at: new Date().toISOString()
  };

  return currentUser;
}

export const userMockEntries: MockRegistryEntry[] = [
  {
    method: 'GET',
    pattern: /^\/auth\/me\/?$/,
    handler: () => currentUser
  },
  {
    method: 'PUT',
    pattern: /^\/auth\/me\/?$/,
    handler: ({ config }) => mergeProfileUpdate(parseJsonBody(config.body))
  }
];

export function getCurrentMockUser(): User {
  return currentUser;
}
