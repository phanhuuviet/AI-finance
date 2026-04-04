import { chatApi } from '../api';
import { ApiError } from '../api/base/http';
import type { ChatSession, ChatSessionDetail, Id, PaginationMeta } from '../models';

export const chatService = {
  async getSessions(): Promise<{ data: ChatSession[]; pagination?: PaginationMeta }> {
    try {
      return await chatApi.getSessions();
    } catch (error) {
      throw ApiError.fromUnknown(error);
    }
  },

  async createSession(title: string, documentIds: Id[] = []): Promise<ChatSession> {
    try {
      return await chatApi.createSession(title, documentIds);
    } catch (error) {
      throw ApiError.fromUnknown(error);
    }
  },

  async getSessionDetail(sessionId: Id): Promise<ChatSessionDetail> {
    try {
      return await chatApi.getSessionDetail(sessionId);
    } catch (error) {
      throw ApiError.fromUnknown(error);
    }
  }
};
