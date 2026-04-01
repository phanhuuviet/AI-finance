import { chatApi } from '../api';
import type { ChatSession, ChatSessionDetail, Id } from '../models';

export const chatService = {
  getSessions(): Promise<ChatSession[]> {
    return chatApi.getSessions();
  },

  createSession(title: string, documentIds: Id[] = []): Promise<ChatSession> {
    return chatApi.createSession(title, documentIds);
  },

  getSessionDetail(sessionId: Id): Promise<ChatSessionDetail> {
    return chatApi.getSessionDetail(sessionId);
  }
};
