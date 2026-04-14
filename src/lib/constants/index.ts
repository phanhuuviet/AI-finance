export const MODAL_TOOL = {
  VIDEO_OVERVIEW: 'video_overview',
  AUDIO_OVERVIEW: 'audio_overview',
  DATA: 'data',
  MINDMAP: 'mindmap',
  QUIZ: 'quiz',
  REPORT: 'report'
} as const;

export const CHAT_ROLE = {
  ASSISTANT: 'assistant',
  USER: 'user',
  USER_MESSAGE: 'user_message'
} as const;

export const WS_EVENT = {
  PING: 'ping',
  PONG: 'pong',
  ACK: 'ack',
  USER_MESSAGE: 'user_message',
  ASSISTANT_CHUNK: 'assistant_chunk',
  ASSISTANT_DONE: 'assistant_done',
  STOP_GENERATION: 'stop_generation',
  ERROR: 'error'
} as const;

export const WS_MESSAGE = {
  CHAT_CONNECTED: 'CHAT_CONNECTED',
  CHAT_MESSAGE_RECEIVED: 'CHAT_MESSAGE_RECEIVED',
  CHAT_MESSAGE_SENT: 'CHAT_MESSAGE_SENT'
} as const;

export const WS_CLOSE_CODE = {
  UNAUTHORIZED: 4401,
  FORBIDDEN: 4403
} as const;

export const DOC_SOURCE_TYPE = {
  RAW: 'raw',
  URL: 'url',
  FILE: 'file'
} as const;

export const DOC_STATUS = {
  PROCESSED: 'processed',
  PROCESSING: 'processing',
  ERROR: 'error'
} as const;

export const RENDER_JOB_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const;

export const GEN_STATUS = {
  ...RENDER_JOB_STATUS
} as const;

export const CHUNK_SECTION = {
  HOOK: 'hook',
  BODY: 'body',
  PROOF: 'proof',
  CTA: 'cta'
} as const;

export const WS_PHASE = {
  INITIAL_SCRIPT: 'initial_script'
} as const;

export const ROUTES = {
  ROOT: '/',
  LOGIN: '/login',
  NOT_FOUND: '/404',
  WORKSPACE: '/workspace',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings'
} as const;

export const LOCALE = {
  VI: 'vi',
  EN: 'en'
} as const;

export type ValueOf<T> = T[keyof T];
