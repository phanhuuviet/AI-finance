import { http } from '../base/http';
import type {
  Session,
  VideoConcept,
  ChatModel,
  CreateSessionRequest,
  SessionListResponse,
} from '$lib/models/session.model';

export const sessionApi = {
  getSessions: (page: number = 1, q: string = '') => {
    const params = new URLSearchParams({
      page: String(page),
      limit: '20',
      ...(q.trim() ? { q: q.trim() } : {}),
    });
    return http<SessionListResponse>(`/session-chat/history?${params.toString()}`);
  },

  getVideoConcepts: () =>
    http<{ video_concepts: VideoConcept[] }>('/session-init/video-concepts'),

  getChatModels: () =>
    http<{ models: ChatModel[] }>('/session-init/chat-models'),

  createSession: (body: CreateSessionRequest) =>
    http<Session>('/session-init', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};