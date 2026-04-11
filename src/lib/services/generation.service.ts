import { generationApi } from '$lib/api/modules/generation.api';
import { generationStore } from '$lib/stores/generation.store';
import { ApiError } from '$lib/api/base/http';

export const generationService = {
  async loadGenerations(sessionId: string, page: number = 1): Promise<void> {
    generationStore.update((s) => ({
      ...s,
      isLoadingList: true,
      error: null,
      currentPage: page
    }));

    try {
      const { data, pagination } = await generationApi.getGenerations(sessionId, page);
      generationStore.update((s) => ({
        ...s,
        generations: Array.isArray(data.generations) ? data.generations : [],
        pagination: pagination ?? null,
        isLoadingList: false
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'GENERATION_LOAD_FAILED';
      generationStore.update((s) => ({
        ...s,
        generations: [],
        error: message,
        isLoadingList: false
      }));
    }
  },

  async loadGenerationDetail(generationId: string): Promise<void> {
    generationStore.update((s) => ({
      ...s,
      isLoadingDetail: true,
      activeGeneration: null,
      chunks: [],
      error: null
    }));

    try {
      const { data } = await generationApi.getGenerationDetail(generationId);
      generationStore.update((s) => ({
        ...s,
        activeGeneration: data.generation,
        chunks: (Array.isArray(data.chunks) ? data.chunks : []).sort((a, b) => a.index - b.index),
        isLoadingDetail: false
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'GENERATION_DETAIL_FAILED';
      generationStore.update((s) => ({ ...s, error: message, isLoadingDetail: false }));
    }
  },

  async regenerateChunk(
    generationId: string,
    chunkId: string,
    feedback: string
  ): Promise<void> {
    try {
      await generationApi.regenerateChunk(generationId, chunkId, feedback);
      await generationService.loadGenerationDetail(generationId);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'REGENERATE_FAILED';
      generationStore.update((s) => ({ ...s, error: message }));
      throw err;
    }
  },

  goToPage(sessionId: string, page: number): void {
    generationService.loadGenerations(sessionId, page);
  }
};
