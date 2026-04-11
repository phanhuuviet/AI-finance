import type { ValueOf } from '$lib/constants';
import { RENDER_JOB_STATUS } from '$lib/constants';

export type CompositionStatus = ValueOf<typeof RENDER_JOB_STATUS>;

export interface CompositionChunkInput {
  chunk_id: string;
  transition_name: string;
}

export interface CreateCompositionRequest {
  generation_id: string;
  chunks: CompositionChunkInput[];
  chunk_ids: string[];
}

export interface Composition {
  id: string;
  user_id: string;
  session_id: string;
  generation_id: string;
  chunk_ids: string[];
  chunk_count: number;
  status: CompositionStatus;
  attempt_count: number;
  output_s3_url: string | null;
  presigned_s3_url: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompositionChunk {
  chunk_id: string;
  sequence: number;
  transition_name: string;
  s3_url: string | null;
  presigned_s3_url: string | null;
}

export interface CompositionListResponse {
  compositions: Composition[];
  count: number;
}

export interface CompositionDetailResponse {
  composition: Composition;
  chunks: CompositionChunk[];
}
