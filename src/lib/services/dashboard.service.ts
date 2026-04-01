import { dashboardApi } from '../api';
import type {
  DocumentItem,
  Id,
  StudioOutput,
  TokenUsageAnalytics
} from '../models';

export const dashboardService = {
  getDocuments(): Promise<DocumentItem[]> {
    return dashboardApi.getDocuments();
  },

  uploadDocument(file: File): Promise<unknown> {
    const formData = new FormData();
    formData.append('file', file);
    return dashboardApi.uploadDocument(formData);
  },

  crawlWebsite(url: string): Promise<unknown> {
    const formData = new FormData();
    formData.append('url', url);
    return dashboardApi.crawlWebsite(formData);
  },

  deleteDocument(id: Id): Promise<{ ok?: boolean }> {
    return dashboardApi.deleteDocument(id);
  },

  getTokenUsage(days: number): Promise<TokenUsageAnalytics> {
    return dashboardApi.getTokenUsage(days);
  },

  async getStudioOutputs(sessionId: Id): Promise<StudioOutput[]> {
    const result = await dashboardApi.getStudioOutputs(sessionId);
    return Array.isArray(result.items) ? result.items : [];
  },

  createStudioOutput(sessionId: Id, type: string, payload: unknown): Promise<StudioOutput> {
    return dashboardApi.createStudioOutput(sessionId, type, payload);
  },

  renameStudioOutput(outputId: Id, title: string): Promise<{ ok?: boolean }> {
    return dashboardApi.renameStudioOutput(outputId, title);
  },

  deleteStudioOutput(outputId: Id): Promise<{ ok?: boolean }> {
    return dashboardApi.deleteStudioOutput(outputId);
  },

  shareStudioOutput(outputId: Id): Promise<{ share_url?: string; url?: string }> {
    return dashboardApi.shareStudioOutput(outputId);
  },

  downloadStudioOutput(outputId: Id): Promise<{ download_url?: string }> {
    return dashboardApi.downloadStudioOutput(outputId);
  }
};
