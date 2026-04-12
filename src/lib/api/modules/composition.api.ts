import { http } from '../base/http';
import type {
  Composition,
  CreateCompositionRequest,
  CompositionListResponse,
  CompositionDetailResponse
} from '$lib/models/composition.model';

export const compositionApi = {
  createComposition: (body: CreateCompositionRequest) =>
    http<Composition>('/video-maker/compositions', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  getCompositions: (page: number = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    return http<CompositionListResponse>(`/video-maker/compositions?${params}`);
  },

  getCompositionDetail: (compositionId: string) =>
    http<CompositionDetailResponse>(`/video-maker/compositions/${compositionId}`),

  retryComposition: (compositionId: string) =>
    http<unknown>(`/video-maker/compositions/${compositionId}/retry`, {
      method: 'POST'
    })
};
