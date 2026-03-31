import type { Id, ISODateString } from './common';

export type DocumentStatus = 'ready' | 'processing' | 'failed' | string;
export type DocumentSourceType = 'Video' | 'Website' | 'File' | string;

export interface DocumentItem {
  _id: Id;
  title: string;
  source_type?: DocumentSourceType;
  status?: DocumentStatus;
  created_at?: ISODateString | string;
  error_message?: string;
  [key: string]: unknown;
}
