import { http } from '../base/http';
import type { GenerationDetailResponse, GenerationListResponse } from '$lib/models/generation.model';

export const generationApi = {
  getGenerations: (sessionId: string, page: number = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    return http<GenerationListResponse>(
      `/video-script-generator/sessions/${sessionId}/generations?${params}`
    );
  },

  getGenerationDetail: (generationId: string) =>
    http<GenerationDetailResponse>(`/video-script-generator/generations/${generationId}`),

  regenerateChunk: (generationId: string, chunkId: string, feedback: string) =>
    http<unknown>(
      `/video-script-generator/generations/${generationId}/chunks/${chunkId}/regenerate`,
      {
        method: 'POST',
        body: JSON.stringify({ feedback })
      }
    )
};
