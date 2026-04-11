import { writable, derived } from 'svelte/store';
import type { VideoSubJob } from '$lib/models/sub.model';
import type { PaginationMeta } from '$lib/models/api-response.model';

interface SubState {
  jobs: VideoSubJob[];
  pagination: PaginationMeta | null;
  currentPage: number;
  isLoadingList: boolean;
  isCreating: boolean;
  error: string | null;
}

export const subStore = writable<SubState>({
  jobs: [],
  pagination: null,
  currentPage: 1,
  isLoadingList: false,
  isCreating: false,
  error: null
});

export const subJobs = derived(subStore, ($s) => $s.jobs);
export const subPagination = derived(subStore, ($s) => $s.pagination);
export const subCurrentPage = derived(subStore, ($s) => $s.currentPage);
export const isLoadingSubs = derived(subStore, ($s) => $s.isLoadingList);
export const isCreatingSub = derived(subStore, ($s) => $s.isCreating);
