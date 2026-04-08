import type {
  DocumentItem,
  StudioOutput,
  StudioOutputListResponse,
  TokenUsageAnalytics
} from '../../models';
import { GEN_STATUS, MODAL_TOOL } from '$lib/constants';
import type { MockRegistryEntry } from './mock.registry';

const studioBySession: Record<string, StudioOutput[]> = {
  chat_session_001: [
    {
      id: 'studio_001',
      session_id: 'chat_session_001',
      type: MODAL_TOOL.REPORT,
      status: 'ready',
      created_at: '2026-03-31T18:00:00.000Z',
      title: 'Q1 Revenue Report',
      result_url: 'https://example.com/downloads/studio_001.pdf'
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

function buildTokenUsage(days: number): TokenUsageAnalytics {
  const safeDays = Math.min(Math.max(days || 30, 1), 90);
  const daily_usage = Array.from({ length: safeDays }).map((_, idx) => {
    const date = new Date('2026-04-01T00:00:00.000Z');
    date.setDate(date.getDate() - (safeDays - idx - 1));
    return {
      date: date.toISOString().slice(0, 10),
      model: idx % 2 === 0 ? 'gpt-4o-mini' : 'gpt-4.1-mini',
      total: 6200 + idx * 180
    };
  });

  const total_tokens_period = daily_usage.reduce((sum, row) => sum + row.total, 0);

  return {
    summary: {
      total_tokens_period,
      period_days: safeDays
    },
    daily_usage
  };
}

function listStudioOutputs(sessionId: string): StudioOutputListResponse {
  const items = studioBySession[sessionId] || [];
  return {
    session_id: sessionId,
    items,
    pagination: {
      page: 1,
      page_size: 20,
      total: items.length
    }
  };
}

function createStudioOutput(payload: Record<string, unknown>): StudioOutput {
  const sessionId = String(payload.session_id || 'chat_session_001');
  const type = String(payload.type || MODAL_TOOL.REPORT);
  const created: StudioOutput = {
    id: `studio_${Date.now()}`,
    session_id: sessionId,
    type,
    status: GEN_STATUS.PROCESSING,
    created_at: new Date().toISOString(),
    payload: payload.payload,
    title: `Generated ${type}`
  };
  const existing = studioBySession[sessionId] || [];
  studioBySession[sessionId] = [created, ...existing];
  return created;
}

export const dashboardMockEntries: MockRegistryEntry[] = [
  {
    method: 'GET',
    pattern: /^\/documents\/?$/,
    handler: () => document
  },
  {
    method: 'GET',
    pattern: /^\/analytics\/tokens\/?$/,
    handler: ({ query }) => buildTokenUsage(Number(query.get('days') || '30'))
  },
  {
    method: 'GET',
    pattern: /^\/studio\/outputs\/?$/,
    handler: ({ query }) => listStudioOutputs(String(query.get('session_id') || 'chat_session_001'))
  },
  {
    method: 'POST',
    pattern: /^\/studio\/outputs\/?$/,
    handler: ({ config }) => createStudioOutput(parseJsonBody(config.body))
  },
  {
    method: 'PATCH',
    pattern: /^\/studio\/outputs\/[^/]+\/?$/,
    handler: ({ path, config }) => {
      const outputId = decodeURIComponent(path.split('/').pop() || '');
      const payload = parseJsonBody(config.body);
      const nextTitle = String(payload.title || 'Renamed output');

      for (const sessionId of Object.keys(studioBySession)) {
        studioBySession[sessionId] = (studioBySession[sessionId] || []).map((item) =>
          item.id === outputId ? { ...item, title: nextTitle } : item
        );
      }

      return { ok: true };
    }
  },
  {
    method: 'DELETE',
    pattern: /^\/studio\/outputs\/[^/]+\/?$/,
    handler: ({ path }) => {
      const outputId = decodeURIComponent(path.split('/').pop() || '');
      for (const sessionId of Object.keys(studioBySession)) {
        studioBySession[sessionId] = (studioBySession[sessionId] || []).filter(
          (item) => item.id !== outputId
        );
      }
      return { ok: true };
    }
  },
  {
    method: 'POST',
    pattern: /^\/studio\/outputs\/[^/]+\/share\/?$/,
    handler: ({ path }) => {
      const outputId = decodeURIComponent(path.split('/')[3] || '');
      return { share_url: `https://example.com/share/${outputId}` };
    }
  },
  {
    method: 'GET',
    pattern: /^\/studio\/outputs\/[^/]+\/download\/?$/,
    handler: ({ path }) => {
      const outputId = decodeURIComponent(path.split('/')[3] || '');
      return { download_url: `https://example.com/download/${outputId}` };
    }
  }
];
