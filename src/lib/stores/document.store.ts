import { writable, derived } from 'svelte/store';
import type { Document } from '$lib/models/document.model';
import type { PaginationMeta } from '$lib/models/api-response.model';

interface DocumentState {
  documents: Document[];
  pagination: PaginationMeta | null;
  currentPage: number;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
}

export const documentStore = writable<DocumentState>({
  documents: [],
  pagination: null,
  currentPage: 1,
  isLoading: false,
  isCreating: false,
  error: null,
});

export const documents = derived(documentStore, ($s) => $s.documents);
export const documentPagination = derived(documentStore, ($s) => $s.pagination);
export const currentPage = derived(documentStore, ($s) => $s.currentPage);
export const isCreatingDoc = derived(documentStore, ($s) => $s.isCreating);