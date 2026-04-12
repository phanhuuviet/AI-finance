import { compositionApi } from '$lib/api/modules/composition.api';
import { compositionStore } from '$lib/stores/composition.store';
import { ApiError } from '$lib/api/base/http';
import type { CompositionChunkInput } from '$lib/models/composition.model';

export const compositionService = {
  async createComposition(
    generationId: string,
    orderedChunks: Array<{ id: string }>
  ): Promise<void> {
    compositionStore.update((s) => ({ ...s, isCreating: true, error: null }));
    try {
      const body = {
        generation_id: generationId,
        chunks: orderedChunks.map(
          (c): CompositionChunkInput => ({
            chunk_id: c.id,
            transition_name: 'basic'
          })
        ),
        chunk_ids: orderedChunks.map((c) => c.id)
      };
      await compositionApi.createComposition(body);
      compositionStore.update((s) => ({ ...s, isCreating: false }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'COMPOSITION_CREATE_FAILED';
      compositionStore.update((s) => ({ ...s, error: message, isCreating: false }));
      throw err;
    }
  },

  async loadCompositions(page: number = 1): Promise<void> {
    compositionStore.update((s) => ({
      ...s,
      isLoadingList: true,
      error: null,
      currentPage: page
    }));
    try {
      const { data, pagination } = await compositionApi.getCompositions(page);
      compositionStore.update((s) => ({
        ...s,
        compositions: Array.isArray(data.compositions) ? data.compositions : [],
        pagination: pagination ?? null,
        isLoadingList: false
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'COMPOSITION_LOAD_FAILED';
      compositionStore.update((s) => ({ ...s, error: message, isLoadingList: false }));
    }
  },

  async loadCompositionDetail(compositionId: string): Promise<void> {
    compositionStore.update((s) => ({
      ...s,
      isLoadingDetail: true,
      activeComposition: null,
      activeChunks: [],
      error: null
    }));
    try {
      const { data } = await compositionApi.getCompositionDetail(compositionId);
      compositionStore.update((s) => ({
        ...s,
        activeComposition: data.composition,
        activeChunks: [...data.chunks].sort((a, b) => a.sequence - b.sequence),
        isLoadingDetail: false
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'COMPOSITION_DETAIL_FAILED';
      compositionStore.update((s) => ({ ...s, error: message, isLoadingDetail: false }));
    }
  },

  async retryComposition(compositionId: string): Promise<void> {
    try {
      await compositionApi.retryComposition(compositionId);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'COMPOSITION_RETRY_FAILED';
      compositionStore.update((s) => ({ ...s, error: message }));
      throw err;
    }
  },

  goToPage(page: number): void {
    compositionService.loadCompositions(page);
  }
};
