export interface Session {
  id: string;
  title: string;
  video_concept_id: string;
  video_concept: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SessionListResponse {
  sessions: Session[];
  count: number;
  q: string | null;
}

export interface PromptInput {
  key: string;
  label: string;
  description: string;
  required: boolean;
}

export interface VideoConcept {
  id: string;
  name: string;
  description: string;
  sample_video: string;
  prompt_inputs: PromptInput[];
}

export interface CreateSessionRequest {
  document_ids: string[];
  materials: Array<{
    asset_ref: string;
    material: string;
    type: string;
  }>;
  metadata: { source: string };
  title: string;
  video_concept_id: string;
  prompt_input_values: Record<string, string>;
}