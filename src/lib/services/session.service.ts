import { sessionApi } from '$lib/api/modules/session.api';
import { sessionStore } from '$lib/stores/session.store';
import { ApiError } from '$lib/api/base/http';
import type { CreateSessionRequest, Session } from '$lib/models/session.model';

const FALLBACK_SESSION: Session = {
  id: '69d276179789124457d929a9',
  title: 'Mock Session',
  created_at: new Date().toISOString(),
};

const HARDCODED_MATERIALS = [
  { asset_ref: 'https://cdn.example.com/uploads/face-1.jpg', material: 'face_photo', type: 'photo' },
  { asset_ref: 'https://cdn.example.com/uploads/bg-1.jpg', material: 'background_photo', type: 'photo' },
  { asset_ref: 'https://cdn.example.com/uploads/music-1.mp3', material: 'background_music', type: 'audio' },
];

export const sessionService = {
  async loadSessions(): Promise<void> {
    sessionStore.update((s) => ({ ...s, isLoadingSessions: true, error: null }));
    try {
      const { data } = await sessionApi.getSessions();
      const fromApi: Session[] = data?.sessions ?? [];
      const hasABCXYZ = fromApi.some((s) => s.id === FALLBACK_SESSION.id);
      const sessions = hasABCXYZ ? fromApi : [FALLBACK_SESSION, ...fromApi];

      sessionStore.update((s) => ({ ...s, sessions, isLoadingSessions: false }));
    } catch {
      sessionStore.update((s) => ({
        ...s,
        sessions: [FALLBACK_SESSION],
        isLoadingSessions: false,
      }));
    }
  },

  async loadVideoConcepts(): Promise<void> {
    sessionStore.update((s) => ({ ...s, isLoadingConcepts: true }));
    try {
      const { data } = await sessionApi.getVideoConcepts();
      sessionStore.update((s) => ({
        ...s,
        videoConcepts: data?.video_concepts ?? [],
        isLoadingConcepts: false,
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'CONCEPTS_LOAD_FAILED';
      sessionStore.update((s) => ({ ...s, error: message, isLoadingConcepts: false }));
    }
  },

  async createSession(
    title: string,
    videoConcept_id: string,
    promptInputValues: Record<string, string>
  ): Promise<void> {
    sessionStore.update((s) => ({ ...s, isCreating: true, error: null }));
    try {
      const body: CreateSessionRequest = {
        document_ids: [],
        materials: HARDCODED_MATERIALS,
        metadata: { source: 'web-app' },
        title,
        video_concept_id: videoConcept_id,
        prompt_input_values: promptInputValues,
      };

      await sessionApi.createSession(body);
      await sessionService.loadSessions();
      sessionStore.update((s) => ({ ...s, isCreating: false }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'SESSION_CREATE_FAILED';
      sessionStore.update((s) => ({ ...s, error: message, isCreating: false }));
      throw err;
    }
  },
};