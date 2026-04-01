import type {
  ChatSession,
  ChatSessionDetail,
  Id
} from '../../models';
import { http } from '../base/http';

export const chatApi = {
  getSessions(): Promise<ChatSession[]> {
    return http<ChatSession[]>('/chat/sessions');
  },

  createSession(title: string, documentIds: Id[] = []): Promise<ChatSession> {
    return http<ChatSession>('/chat/sessions', {
      method: 'POST',
      body: { title, document_ids: documentIds }
    });
  },

  getSessionDetail(sessionId: Id): Promise<ChatSessionDetail> {
    return http<ChatSessionDetail>(`/chat/sessions/${encodeURIComponent(String(sessionId))}`);
  }
};
