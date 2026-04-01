import type {
  DocumentItem,
  Id,
  StudioOutput,
  StudioOutputListResponse,
  TokenUsageAnalytics
} from '../../models';
import { http } from '../base/http';

export const dashboardApi = {
  getDocuments(): Promise<DocumentItem[]> {
    return http<DocumentItem[]>('/documents/');
  },

  uploadDocument(formData: FormData): Promise<unknown> {
    return http<unknown>('/documents/upload', {
      method: 'POST',
      body: formData
    });
  },

  crawlWebsite(formData: FormData): Promise<unknown> {
    return http<unknown>('/documents/crawl', {
      method: 'POST',
      body: formData
    });
  },

  deleteDocument(id: Id): Promise<{ ok?: boolean }> {
    return http<{ ok?: boolean }>(`/documents/${encodeURIComponent(String(id))}`, {
      method: 'DELETE'
    });
  },

  getTokenUsage(days: number): Promise<TokenUsageAnalytics> {
    return http<TokenUsageAnalytics>('/analytics/tokens', {
      query: { days }
    });
  },

  getStudioOutputs(sessionId: Id): Promise<StudioOutputListResponse> {
    return http<StudioOutputListResponse>('/studio/outputs', {
      query: { session_id: sessionId }
    });
  },

  createStudioOutput(sessionId: Id, type: string, payload: unknown): Promise<StudioOutput> {
    return http<StudioOutput>('/studio/outputs', {
      method: 'POST',
      body: {
        session_id: sessionId,
        type,
        payload
      }
    });
  },

  renameStudioOutput(outputId: Id, title: string): Promise<{ ok?: boolean }> {
    return http<{ ok?: boolean }>(`/studio/outputs/${encodeURIComponent(String(outputId))}`, {
      method: 'PATCH',
      body: { title }
    });
  },

  deleteStudioOutput(outputId: Id): Promise<{ ok?: boolean }> {
    return http<{ ok?: boolean }>(`/studio/outputs/${encodeURIComponent(String(outputId))}`, {
      method: 'DELETE'
    });
  },

  shareStudioOutput(outputId: Id): Promise<{ share_url?: string; url?: string }> {
    return http<{ share_url?: string; url?: string }>(`/studio/outputs/${encodeURIComponent(String(outputId))}/share`, {
      method: 'POST'
    });
  },

  downloadStudioOutput(outputId: Id): Promise<{ download_url?: string }> {
    return http<{ download_url?: string }>(`/studio/outputs/${encodeURIComponent(String(outputId))}/download`);
  }
};
