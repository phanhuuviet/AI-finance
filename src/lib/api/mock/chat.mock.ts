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

const messagesBySession: Record<string, ChatMessage[]> = {
  chat_session_001: [
    {
      id: 'msg_001',
      role: 'user',
      content: 'Summarize the revenue trend for Q1.',
      created_at: '2026-03-31T17:20:00.000Z'
    },
    {
      id: 'msg_002',
      role: 'assistant',
      content: 'Revenue increased month-over-month with strongest growth in March.',
      created_at: '2026-03-31T17:21:00.000Z'
    }
  ],
  chat_session_002: [
    {
      id: 'msg_101',
      role: 'user',
      content: 'What segments have the highest churn risk?',
      created_at: '2026-04-01T07:45:00.000Z'
    },
    {
      id: 'msg_102',
      role: 'assistant',
      content: 'New users in month one and low-frequency users show the highest risk.',
      created_at: '2026-04-01T07:46:00.000Z'
    }
  ]
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

function createSession(title: string): ChatSession {
  const created: ChatSession = {
    _id: `chat_session_${String(sessions.length + 1).padStart(3, '0')}`,
    title,
    created_at: nowIso,
    updated_at: nowIso
  };
  sessions = [created, ...sessions];
  messagesBySession[created._id] = [];
  return created;
}

function buildSessionDetail(sessionId: string): ChatSessionDetail {
  const session = sessions.find((item) => item._id === sessionId) || {
    _id: sessionId,
    title: 'Untitled Session',
    created_at: nowIso,
    updated_at: nowIso
  };

  return {
    ...session,
    messages: messagesBySession[sessionId] || [],
    pagination: {
      page: 1,
      page_size: 50,
      total: (messagesBySession[sessionId] || []).length
    }
  };
}

export const chatMockEntries: MockRegistryEntry[] = [
  {
    method: 'GET',
    pattern: /^\/chat\/sessions\/?$/,
    handler: () => sessions
  },
  {
    method: 'POST',
    pattern: /^\/chat\/sessions\/?$/,
    handler: ({ config }) => {
      const payload = parseJsonBody(config.body);
      return createSession(String(payload.title || 'New Conversation'));
    }
  },
  {
    method: 'GET',
    pattern: /^\/chat\/sessions\/[^/]+\/?$/,
    handler: ({ path }) => {
      const sessionId = decodeURIComponent(path.split('/').pop() || '');
      return buildSessionDetail(sessionId);
    }
  }
];
