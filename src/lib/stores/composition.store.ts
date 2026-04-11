import { writable, derived } from 'svelte/store';
import type { Composition, CompositionChunk } from '$lib/models/composition.model';
import type { PaginationMeta } from '$lib/models/api-response.model';

interface CompositionState {
  compositions: Composition[];
  pagination: PaginationMeta | null;
  currentPage: number;
  isLoadingList: boolean;
  isCreating: boolean;
  activeComposition: Composition | null;
  activeChunks: CompositionChunk[];
  isLoadingDetail: boolean;
  error: string | null;
}

export const compositionStore = writable<CompositionState>({
  compositions: [],
  pagination: null,
  currentPage: 1,
  isLoadingList: false,
  isCreating: false,
  activeComposition: null,
  activeChunks: [],
  isLoadingDetail: false,
  error: null
});

export const compositions = derived(compositionStore, ($s) => $s.compositions);
export const compositionPagination = derived(compositionStore, ($s) => $s.pagination);
export const compositionCurrentPage = derived(compositionStore, ($s) => $s.currentPage);
export const isLoadingCompositions = derived(compositionStore, ($s) => $s.isLoadingList);
export const isCreatingComposition = derived(compositionStore, ($s) => $s.isCreating);
export const activeComposition = derived(compositionStore, ($s) => $s.activeComposition);
export const activeCompositionChunks = derived(compositionStore, ($s) => $s.activeChunks);
export const isLoadingCompositionDetail = derived(compositionStore, ($s) => $s.isLoadingDetail);
