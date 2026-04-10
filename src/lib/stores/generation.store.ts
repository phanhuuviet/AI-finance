import { writable, derived } from 'svelte/store';
import type { Generation, GenerationChunk } from '$lib/models/generation.model';
import type { PaginationMeta } from '$lib/models/api-response.model';

interface GenerationState {
  generations: Generation[];
  pagination: PaginationMeta | null;
  currentPage: number;
  isLoadingList: boolean;
  activeGeneration: Generation | null;
  chunks: GenerationChunk[];
  isLoadingDetail: boolean;
  isCreatingVideo: boolean;
  error: string | null;
}

export const generationStore = writable<GenerationState>({
  generations: [],
  pagination: null,
  currentPage: 1,
  isLoadingList: false,
  activeGeneration: null,
  chunks: [],
  isLoadingDetail: false,
  isCreatingVideo: false,
  error: null
});

export const generations = derived(generationStore, ($s) => $s.generations);
export const generationPagination = derived(generationStore, ($s) => $s.pagination);
export const generationCurrentPage = derived(generationStore, ($s) => $s.currentPage);
export const activeGeneration = derived(generationStore, ($s) => $s.activeGeneration);
export const generationChunks = derived(generationStore, ($s) => $s.chunks);
export const isLoadingList = derived(generationStore, ($s) => $s.isLoadingList);
export const isLoadingDetail = derived(generationStore, ($s) => $s.isLoadingDetail);
export const isCreatingVideo = derived(generationStore, ($s) => $s.isCreatingVideo);
