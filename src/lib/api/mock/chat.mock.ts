import type { ChatMessage, ChatSession, ChatSessionDetail } from '../../models';
import type { MockRegistryEntry } from './mock.registry';

const nowIso = '2026-04-01T08:00:00.000Z';

let sessions: ChatSession[] = [
  {
    _id: 'chat_session_001',
    title: 'Q1 Revenue Analysis',
    created_at: '2026-03-28T09:10:00.000Z',
    updated_at: '2026-03-31T17:25:00.000Z'
  },
  {
    _id: 'chat_session_002',
    title: 'Customer Churn Insights',
    created_at: '2026-03-29T10:00:00.000Z',
    updated_at: '2026-04-01T07:50:00.000Z'
  }
];

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

export const chatMockEntries: MockRegistryEntry[] = [
  {
    method: 'GET',
    pattern: /^\/chat\/sessions\/?$/,
    handler: () => sessions
  },
];
