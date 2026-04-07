import { dashboardApi } from '../api';
import { ApiError } from '../api/base/http';
import type {
  DocumentItem,
  Id,
  PaginationMeta,
  StudioOutput,
  TokenUsageAnalytics
} from '../models';

export const dashboardService = {
  async getDocuments(): Promise<{ data: DocumentItem[]; pagination?: PaginationMeta }> {
    try {
      return await dashboardApi.getDocuments();
    } catch (error) {
      throw ApiError.fromUnknown(error);
    }
  },

  async uploadDocument(file: File): Promise<unknown> {
    const formData = new FormData();
    formData.append('file', file);
    try {
      return await dashboardApi.uploadDocument(formData);
    } catch (error) {
      throw ApiError.fromUnknown(error);
    }
  },

  async crawlWebsite(url: string): Promise<unknown> {
    const formData = new FormData();
    formData.append('url', url);
    try {
      return await dashboardApi.crawlWebsite(formData);
    } catch (error) {
      throw ApiError.fromUnknown(error);
    }
  },

  async deleteDocument(id: Id): Promise<{ ok?: boolean }> {
    try {
      return await dashboardApi.deleteDocument(id);
    } catch (error) {
      throw ApiError.fromUnknown(error);
    }
  },

  async getTokenUsage(days: number): Promise<TokenUsageAnalytics> {
    try {
      return await dashboardApi.getTokenUsage(days);
    } catch (error) {
      throw ApiError.fromUnknown(error);
    }
  },

  async getStudioOutputs(sessionId: Id): Promise<{ data: StudioOutput[]; pagination?: PaginationMeta }> {
    try {
      const { data, pagination } = await dashboardApi.getStudioOutputs(sessionId);
      return {
        data: Array.isArray(data.items) ? data.items : [],
        pagination
      };
    } catch (error) {
      throw ApiError.fromUnknown(error);
    }
  },

  async createStudioOutput(sessionId: Id, type: string, payload: unknown): Promise<StudioOutput> {
    try {
      return await dashboardApi.createStudioOutput(sessionId, type, payload);
    } catch (error) {
      throw ApiError.fromUnknown(error);
    }
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
    try {
      return await dashboardApi.generateVideoScriptPrompts(payload);
    } catch (error) {
      throw ApiError.fromUnknown(error);
    }
  },

  async renameStudioOutput(outputId: Id, title: string): Promise<{ ok?: boolean }> {
    try {
      return await dashboardApi.renameStudioOutput(outputId, title);
    } catch (error) {
      throw ApiError.fromUnknown(error);
    }
  },

  async deleteStudioOutput(outputId: Id): Promise<{ ok?: boolean }> {
    try {
      return await dashboardApi.deleteStudioOutput(outputId);
    } catch (error) {
      throw ApiError.fromUnknown(error);
    }
  },

  async shareStudioOutput(outputId: Id): Promise<{ share_url?: string; url?: string }> {
    try {
      return await dashboardApi.shareStudioOutput(outputId);
    } catch (error) {
      throw ApiError.fromUnknown(error);
    }
  },

  async downloadStudioOutput(outputId: Id): Promise<{ download_url?: string }> {
    try {
      return await dashboardApi.downloadStudioOutput(outputId);
    } catch (error) {
      throw ApiError.fromUnknown(error);
    }
  }
};
