export type DocumentSourceType = 'raw' | 'url' | 'file';
export type DocumentStatus = 'processed' | 'processing' | 'error';

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
  source_type: 'raw';
  model_metadata: {
    indexing_state: 'queued';
    paper_context: { source: 'arxiv' };
  };
}

// Legacy alias for existing dashboard modules.
export type DocumentItem = Document;
