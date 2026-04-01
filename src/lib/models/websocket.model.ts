import type { Id } from './common.model';
import type { ChatMessage } from './chat.model';

export type WebSocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface WsStreamStart {
  type: 'stream_start';
  chat_id: Id;
  message_id: Id;
  [key: string]: unknown;
}

export interface WsStreamChunk {
  type: 'stream_chunk';
  chat_id: Id;
  message_id: Id;
  content: string;
  [key: string]: unknown;
}

export interface WsStreamEnd {
  type: 'stream_end';
  chat_id: Id;
  message_id?: Id;
  [key: string]: unknown;
}

export interface WsMessage {
  type: 'message';
  chat_id: Id;
  message: ChatMessage;
  [key: string]: unknown;
}

export interface WsError {
  type: 'error';
  error: string;
  [key: string]: unknown;
}

export type WsInboundMessage =
  | WsStreamStart
  | WsStreamChunk
  | WsStreamEnd
  | WsMessage
  | WsError
  | { type: string; [key: string]: unknown };

export interface WsSendMessage {
  chat_id: Id;
  content: string;
  document_ids?: Id[];
  [key: string]: unknown;
}
