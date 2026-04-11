import type { ValueOf } from '$lib/constants';
import { RENDER_JOB_STATUS } from '$lib/constants';

export interface VideoSubStyle {
  fontsize: number;
  color: string;
  stroke_color: string;
  stroke_width: number;
  font: string;
  method: string;
  sub_x_position: number;
  sub_y_position: number;
}

export type VideoSubJobStatus = ValueOf<typeof RENDER_JOB_STATUS>;

export interface VideoSubJob {
  id: string;
  user_id: string;
  session_id: string;
  generation_id: string;
  composition_id: string;
  style: VideoSubStyle;
  status: VideoSubJobStatus;
  attempt_count: number;
  claimed_by: string | null;
  claimed_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
  error_message: string | null;
  source_s3_bucket: string;
  source_s3_key: string;
  source_s3_url: string;
  output_s3_bucket: string | null;
  output_s3_key: string | null;
  output_s3_url: string | null;
  agent_metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  source_presigned_s3_url: string | null;
  presigned_s3_url: string | null;
}

export interface VideoSubJobListResponse {
  jobs: VideoSubJob[];
  count: number;
}

export interface CreateVideoSubJobRequest {
  composition_id: string;
  style: VideoSubStyle;
}
