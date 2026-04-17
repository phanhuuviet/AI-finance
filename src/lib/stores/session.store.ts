import { writable, derived } from 'svelte/store';
import type { PaginationMeta } from '$lib/models';
import type { Session, VideoConcept, ChatModel } from '$lib/models/session.model';

interface SessionState {
  sessions: Session[];
  videoConcepts: VideoConcept[];
  chatModels: ChatModel[];
  pagination: PaginationMeta | null;
  currentPage: number;
  searchQuery: string;
  isLoadingSessions: boolean;
  isLoadingConcepts: boolean;
  isLoadingChatModels: boolean;
  isCreating: boolean;
  error: string | null;
}

export const sessionStore = writable<SessionState>({
  sessions: [],
  videoConcepts: [],
  chatModels: [],
  pagination: null,
  currentPage: 1,
  searchQuery: '',
  isLoadingSessions: false,
  isLoadingConcepts: false,
  isLoadingChatModels: false,
  isCreating: false,
  error: null,
});

export const sessions = derived(sessionStore, ($s) => $s.sessions);
export const videoConcepts = derived(sessionStore, ($s) => $s.videoConcepts);
export const chatModels = derived(sessionStore, ($s) => $s.chatModels);
export const isCreating = derived(sessionStore, ($s) => $s.isCreating);
export const sessionPagination = derived(sessionStore, ($s) => $s.pagination);
export const sessionCurrentPage = derived(sessionStore, ($s) => $s.currentPage);
export const sessionSearchQuery = derived(sessionStore, ($s) => $s.searchQuery);