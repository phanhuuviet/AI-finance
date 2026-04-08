import type { ValueOf } from '$lib/constants';
import { DOC_SOURCE_TYPE, DOC_STATUS } from '$lib/constants';

export type DocumentSourceType = ValueOf<typeof DOC_SOURCE_TYPE>;
export type DocumentStatus = ValueOf<typeof DOC_STATUS>;

export interface Document {
  id: string;
  user_id: string;
  title: string;
  content: string;
  source_type: DocumentSourceType;
  source_url: string | null;
  status: DocumentStatus;
  metadata_json: Record<string, unknown>;
  model_metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentRequest {
  title: string;
  content: string;
  source_type: typeof DOC_SOURCE_TYPE.RAW;
  model_metadata: {
    indexing_state: 'queued';
    paper_context: { source: 'arxiv' };
  };
}

export interface DeleteDocumentResponse {
  document_id: string;
}

// Legacy alias for existing dashboard modules.
export type DocumentItem = Document;
