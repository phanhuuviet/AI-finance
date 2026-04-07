import { sessionApi } from '$lib/api/modules/session.api';
import { sessionStore } from '$lib/stores/session.store';
import { ApiError } from '$lib/api/base/http';
import { get } from 'svelte/store';
import type { CreateSessionRequest } from '$lib/models/session.model';

const HARDCODED_MATERIALS = [
  { asset_ref: 'https://cdn.example.com/uploads/face-1.jpg', material: 'face_photo', type: 'photo' },
  { asset_ref: 'https://cdn.example.com/uploads/bg-1.jpg', material: 'background_photo', type: 'photo' },
  { asset_ref: 'https://cdn.example.com/uploads/music-1.mp3', material: 'background_music', type: 'audio' },
];

export const sessionService = {
  async loadSessions(page: number = 1, q: string = ''): Promise<void> {
    sessionStore.update((s) => ({
      ...s,
      isLoadingSessions: true,
      error: null,
      currentPage: page,
      searchQuery: q,
    }));
    try {
      const { data, pagination } = await sessionApi.getSessions(page, q);
      sessionStore.update((s) => ({
        ...s,
        sessions: data.sessions,
        pagination: pagination ?? null,
        isLoadingSessions: false,
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'SESSION_LOAD_FAILED';
      sessionStore.update((s) => ({
        ...s,
        sessions: [],
        pagination: null,
        error: message,
        isLoadingSessions: false,
      }));
    }
  },

  goToPage(page: number): void {
    const q = get(sessionStore).searchQuery;
    sessionService.loadSessions(page, q);
  },

  search(q: string): void {
    sessionService.loadSessions(1, q);
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
    const q = get(sessionStore).searchQuery;
    await sessionService.loadSessions(1, q);
      sessionStore.update((s) => ({ ...s, isCreating: false }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'SESSION_CREATE_FAILED';
      sessionStore.update((s) => ({ ...s, error: message, isCreating: false }));
      throw err;
    }
  },
};