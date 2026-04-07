import type { Id, ISODateString } from './common.model';

export type StudioOutputType =
  | 'video_overview'
  | 'audio_overview'
  | 'mindmap'
  | 'report'
  | 'quiz'
  | 'data'
  | string;

export type StudioOutputStatus = 'processing' | 'ready' | 'failed' | string;

export interface StudioOutput<TPayload = unknown> {
  id: Id;
  session_id: Id;
  type: StudioOutputType;
  status: StudioOutputStatus;
  created_at: ISODateString;
  payload?: TPayload;
  result_url?: string | null;
  [key: string]: unknown;
}

export interface StudioOutputListResponse {
  session_id: Id;
  items: StudioOutput[];
  [key: string]: unknown;
}
