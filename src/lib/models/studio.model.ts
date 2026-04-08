import type { Id, ISODateString } from './common.model';
import type { ValueOf } from '$lib/constants';
import { GEN_STATUS, MODAL_TOOL } from '$lib/constants';

export type StudioOutputType =
  | ValueOf<typeof MODAL_TOOL>
  | string;

export type StudioOutputStatus = ValueOf<typeof GEN_STATUS> | 'ready' | string;

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
