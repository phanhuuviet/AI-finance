import { http } from '../base/http';
import type { ChatHistory } from '$lib/models/chat.model';

export const chatApi = {
  getHistory: (sessionId: string) =>
    http<{ session_id: string; messages: ChatHistory['messages']; count: number }>(
      `/session-chat/${sessionId}/history?limit=100`
    ),
};
