import type { Id, ISODateString } from './common.model';

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: Id;
  role: ChatRole;
  content: string;
  created_at?: ISODateString;
  [key: string]: unknown;
}

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
