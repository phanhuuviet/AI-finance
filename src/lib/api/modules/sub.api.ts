import { http } from '../base/http';
import type {
  CreateVideoSubJobRequest,
  VideoSubJob,
  VideoSubJobListResponse
} from '$lib/models/sub.model';

export const subApi = {
  createSubJob: (body: CreateVideoSubJobRequest) =>
    http<VideoSubJob>('/video-subber/jobs', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  getSubJobs: (page: number = 1, limit: number = 20) =>
    http<VideoSubJobListResponse>(`/video-subber/jobs?page=${page}&limit=${limit}`)
};
