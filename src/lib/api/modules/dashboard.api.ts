import type {
  DocumentItem,
  Id,
  PaginationMeta,
  StudioOutput,
  StudioOutputListResponse,
  TokenUsageAnalytics
} from '../../models';
import { http } from '../base/http';

export const dashboardApi = {
  async getDocuments(): Promise<{ data: DocumentItem[]; pagination?: PaginationMeta }> {
    const { data, pagination } = await http<DocumentItem[]>('/documents/');
    return { data, pagination };
  },

  async uploadDocument(formData: FormData): Promise<unknown> {
    const { data } = await http<unknown>('/documents/upload', {
      method: 'POST',
      body: formData
    });
    return data;
  },

  async crawlWebsite(formData: FormData): Promise<unknown> {
    const { data } = await http<unknown>('/documents/crawl', {
      method: 'POST',
      body: formData
    });
    return data;
  },

  async deleteDocument(id: Id): Promise<{ ok?: boolean }> {
    const { data } = await http<{ ok?: boolean }>(`/documents/${encodeURIComponent(String(id))}`, {
      method: 'DELETE'
    });
    return data;
  },

  async getTokenUsage(days: number): Promise<TokenUsageAnalytics> {
    const { data } = await http<TokenUsageAnalytics>('/analytics/tokens', {
      query: { days }
    });
    return data;
  },

  async getStudioOutputs(sessionId: Id): Promise<{ data: StudioOutputListResponse; pagination?: PaginationMeta }> {
    const { data, pagination } = await http<StudioOutputListResponse>('/studio/outputs', {
      query: { session_id: sessionId }
    });
    return { data, pagination };
  },

  async createStudioOutput(sessionId: Id, type: string, payload: unknown): Promise<StudioOutput> {
    const { data } = await http<StudioOutput>('/studio/outputs', {
      method: 'POST',
      body: {
        session_id: sessionId,
        type,
        payload
      }
    });
    return data;
  },

  async generateVideoScriptPrompts(payload: {
    chunk_count: number;
    script: string;
    session_id: Id;
    video_prompt_input_values: {
      aspect_ratio: string;
      target_platform: string;
      visual_style: string;
    };
  }): Promise<unknown> {
    const { data } = await http<unknown>('/video-script-generator', {
      method: 'POST',
      body: payload
    });
    return data;
  },

  async renameStudioOutput(outputId: Id, title: string): Promise<{ ok?: boolean }> {
    const { data } = await http<{ ok?: boolean }>(`/studio/outputs/${encodeURIComponent(String(outputId))}`, {
      method: 'PATCH',
      body: { title }
    });
    return data;
  },

  async deleteStudioOutput(outputId: Id): Promise<{ ok?: boolean }> {
    const { data } = await http<{ ok?: boolean }>(`/studio/outputs/${encodeURIComponent(String(outputId))}`, {
      method: 'DELETE'
    });
    return data;
  },

  async shareStudioOutput(outputId: Id): Promise<{ share_url?: string; url?: string }> {
    const { data } = await http<{ share_url?: string; url?: string }>(`/studio/outputs/${encodeURIComponent(String(outputId))}/share`, {
      method: 'POST'
    });
    return data;
  },

  async downloadStudioOutput(outputId: Id): Promise<{ download_url?: string }> {
    const { data } = await http<{ download_url?: string }>(`/studio/outputs/${encodeURIComponent(String(outputId))}/download`);
    return data;
  }
};
