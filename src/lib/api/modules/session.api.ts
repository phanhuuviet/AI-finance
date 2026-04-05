import { http } from '../base/http';
import type { Session, VideoConcept, CreateSessionRequest } from '$lib/models/session.model';

export const sessionApi = {
  getSessions: () =>
    http<{ sessions?: Session[] }>('/session-init', { method: 'GET' }),

  getVideoConcepts: () =>
    http<{ video_concepts: VideoConcept[] }>('/session-init/video-concepts'),

  createSession: (body: CreateSessionRequest) =>
    http<Session>('/session-init', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};