import type { ValueOf } from '$lib/constants';
import { CHUNK_SECTION, RENDER_JOB_STATUS } from '$lib/constants';

export type GenerationStatus = ValueOf<typeof RENDER_JOB_STATUS>;
export type ChunkSection = ValueOf<typeof CHUNK_SECTION> | string;

export interface GenerationSummary {
  pending: number;
  completed: number;
  failed: number;
}

export interface Generation {
  id: string;
  session_id: string;
  video_concept_id: string;
  video_concept: string;
  script: string;
  requested_chunk_count: number;
  chunk_count: number;
  total_chunks: number;
  estimated_total_duration_seconds: number;
  provider: string;
  model: string;
  submitted_video_prompt_input_values: Record<string, string>;
  resolved_prompt_values: Record<string, string>;
  status: GenerationStatus;
  summary: GenerationSummary;
  created_at: string;
  updated_at: string;
}

export interface GenerationChunk {
  id: string;
  generation_id: string;
  session_id: string;
  chunk_id: string;
  index: number;
  section: ChunkSection;
  target_seconds: number;
  estimated_syllables: number;
  video_prompt: string;
  narration: string;
  status: GenerationStatus;
  s3_url: string | null;
  presigned_s3_url: string | null;
  attempt_count: number;
  regenerate_count: number;
  current_version: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerationListResponse {
  session_id: string;
  generations: Generation[];
  count: number;
}

export interface GenerationDetailResponse {
  generation: Generation;
  chunks: GenerationChunk[];
}

export interface RegenerateChunkRequest {
  feedback: string;
}
