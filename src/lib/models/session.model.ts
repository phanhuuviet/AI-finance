export interface Session {
  id: string;
  title: string;
  created_at: string;
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