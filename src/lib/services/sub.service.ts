import { subApi } from '$lib/api/modules/sub.api';
import { subStore } from '$lib/stores/sub.store';
import { ApiError } from '$lib/api/base/http';
import type { VideoSubStyle } from '$lib/models/sub.model';

const DEFAULT_SUB_STYLE: VideoSubStyle = {
  fontsize: 70,
  color: 'yellow',
  stroke_color: 'black',
  stroke_width: 3,
  font: 'Arial-Bold',
  method: 'caption',
  sub_x_position: 0,
  sub_y_position: 0
};

export const subService = {
  async loadSubJobs(page: number = 1): Promise<void> {
    subStore.update((s) => ({
      ...s,
      isLoadingList: true,
      currentPage: page,
      error: null
    }));

    try {
      const { data, pagination } = await subApi.getSubJobs(page, 20);
      subStore.update((s) => ({
        ...s,
        jobs: Array.isArray(data.jobs) ? data.jobs : [],
        pagination: pagination ?? null,
        isLoadingList: false
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'VIDEO_SUB_LIST_FAILED';
      subStore.update((s) => ({ ...s, isLoadingList: false, jobs: [], error: message }));
    }
  },

  async createSubJob(compositionId: string): Promise<void> {
    subStore.update((s) => ({ ...s, isCreating: true, error: null }));

    try {
      await subApi.createSubJob({
        composition_id: compositionId,
        style: DEFAULT_SUB_STYLE
      });
      subStore.update((s) => ({ ...s, isCreating: false }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'VIDEO_SUB_CREATE_FAILED';
      subStore.update((s) => ({ ...s, isCreating: false, error: message }));
      throw err;
    }
  },

  goToPage(page: number): void {
    subService.loadSubJobs(page);
  }
};
