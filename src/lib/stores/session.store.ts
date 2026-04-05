import { writable, derived } from 'svelte/store';
import type { Session, VideoConcept } from '$lib/models/session.model';

interface SessionState {
  sessions: Session[];
  videoConcepts: VideoConcept[];
  isLoadingSessions: boolean;
  isLoadingConcepts: boolean;
  isCreating: boolean;
  error: string | null;
}

export const sessionStore = writable<SessionState>({
  sessions: [],
  videoConcepts: [],
  isLoadingSessions: false,
  isLoadingConcepts: false,
  isCreating: false,
  error: null,
});

export const sessions = derived(sessionStore, ($s) => $s.sessions);
export const videoConcepts = derived(sessionStore, ($s) => $s.videoConcepts);
export const isCreating = derived(sessionStore, ($s) => $s.isCreating);