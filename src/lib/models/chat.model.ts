import type { Id, ISODateString } from './common.model';

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'assistant' | 'user' | 'user_message';
  content: string;
  metadata_json: Record<string, unknown>;
  created_at: string;
}

export interface ChatHistory {
  session_id: string;
  messages: ChatMessage[];
  count: number;
}

// Legacy types kept to avoid breaking older JS stores/components.
export interface ChatSession {
  _id: Id;
  title: string;
  created_at: ISODateString;
  updated_at: ISODateString;
  [key: string]: unknown;
}

export interface ChatSessionDetail extends ChatSession {
  messages: ChatMessage[];
}
