import type {
  ChatSession,
  ChatSessionDetail,
  Id,
  PaginationMeta
} from '../../models';
import { http } from '../base/http';

export const chatApi = {
  async getSessions(): Promise<{ data: ChatSession[]; pagination?: PaginationMeta }> {
    const { data, pagination } = await http<ChatSession[]>('/chat/sessions');
    return { data, pagination };
  },

  async createSession(title: string, documentIds: Id[] = []): Promise<ChatSession> {
    const { data } = await http<ChatSession>('/chat/sessions', {
      method: 'POST',
      body: { title, document_ids: documentIds }
    });
    return data;
  },

  async getSessionDetail(sessionId: Id): Promise<ChatSessionDetail> {
    const { data } = await http<ChatSessionDetail>(`/chat/sessions/${encodeURIComponent(String(sessionId))}`);
    return data;
  }
};
