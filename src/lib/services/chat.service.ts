import { chatApi } from '$lib/api/modules/chat.api';
import { chatStore } from '$lib/stores/chat.store';
import { ApiError } from '$lib/api/base/http';

export const chatService = {
  async loadHistory(sessionId: string): Promise<void> {
    chatStore.update((s) => ({ ...s, activeSessionId: sessionId, isLoading: true, error: null, messages: [] }));
    try {
      const { data } = await chatApi.getHistory(sessionId);
      chatStore.update((s) => ({
        ...s,
        messages: data.messages,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'HISTORY_LOAD_FAILED';
      chatStore.update((s) => ({ ...s, error: message, isLoading: false }));
    }
  },

  clearHistory(): void {
    chatStore.update((s) => ({ ...s, messages: [], activeSessionId: null }));
  },
};
