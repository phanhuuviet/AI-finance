import { goto } from '$app/navigation';
import { chatStore } from '$lib/stores/chat.store';
import { tokenStorage } from '$lib/utils/token';

type WsEventType = 'ack' | 'assistant_chunk' | 'assistant_done' | 'error' | 'pong';

interface WsEnvelope {
  type: WsEventType;
  payload?: {
    statusCode: number;
    message: string;
    data?: Record<string, unknown>;
  };
}

function buildWsUrl(sessionId: string): string {
  const base = import.meta.env.VITE_API_BASE_URL as string;
  const wsBase = base.replace(/^http/, 'ws');
  const token = tokenStorage.getAccess() ?? '';
  return `${wsBase}/session-chat/${sessionId}?token=${encodeURIComponent(token)}`;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private sessionId: string | null = null;
  private pendingRetry: {
    content: string;
    documentIds: string[];
    timeoutId: ReturnType<typeof setTimeout> | null;
  } | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private isGenerating = false;
  private receivedInitialChunk = false;
  private skippingInitialScript = false;

  connect(sessionId: string): void {
    this.disconnect();
    this.sessionId = sessionId;
    this.receivedInitialChunk = false;
    this.skippingInitialScript = false;

    chatStore.update((s) => ({
      ...s,
      activeSessionId: sessionId,
      isConnecting: true,
      isGenerating: false,
      isTyping: false,
      wsError: null,
      streamingContent: '',
    }));

    const url = buildWsUrl(sessionId);
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.startPing();
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const msg: WsEnvelope = JSON.parse(event.data as string);
        this.handleMessage(msg);
      } catch {
        console.error('WS parse error', event.data);
      }
    };

    this.ws.onerror = () => {
      chatStore.update((s) => ({ ...s, wsError: 'CONNECTION_ERROR', isConnecting: false }));
    };

    this.ws.onclose = (event: CloseEvent) => {
      this.stopPing();
      this.isGenerating = false;
      chatStore.update((s) => ({ ...s, isConnecting: false, isGenerating: false, isTyping: false }));

      if (event.code === 4401) {
        tokenStorage.clearTokens();
        goto('/login');
      } else if (event.code === 4403) {
        chatStore.update((s) => ({ ...s, wsError: 'FORBIDDEN' }));
      }
    };
  }

  private handleMessage(msg: WsEnvelope): void {
    switch (msg.type) {
      case 'ack': {
        const message = msg.payload?.message;
        if (message === 'CHAT_CONNECTED') {
          this.receivedInitialChunk = false;
          this.skippingInitialScript = false;
          chatStore.update((s) => ({ ...s, isConnecting: false, isTyping: false, wsError: null }));
        }

        if (message === 'CHAT_MESSAGE_RECEIVED') {
          chatStore.update((s) => ({
            ...s,
            isTyping: true,
            streamingContent: '',
          }));
        }
        break;
      }

      case 'assistant_chunk': {
        const phase = msg.payload?.data?.phase as string | undefined;
        const isInitialScript = phase === 'initial_script';
        if (isInitialScript && !this.receivedInitialChunk) {
          this.receivedInitialChunk = true;
          this.skippingInitialScript = true;
          return;
        }

        if (this.skippingInitialScript) {
          return;
        }

        const content = (msg.payload?.data?.content as string) ?? '';
        this.isGenerating = true;
        chatStore.update((s) => ({
          ...s,
          isTyping: false,
          isGenerating: true,
          streamingContent: (s.streamingContent ?? '') + content,
        }));
        break;
      }

      case 'assistant_done': {
        if (this.skippingInitialScript) {
          this.skippingInitialScript = false;
          chatStore.update((s) => ({ ...s, isTyping: false, isGenerating: false }));
          return;
        }

        chatStore.update((s) => {
          const finishedContent = s.streamingContent?.trim() ?? '';
          const newMessages = finishedContent
            ? [
                ...s.messages,
                {
                  id: crypto.randomUUID(),
                  session_id: s.activeSessionId ?? '',
                  role: 'assistant' as const,
                  content: finishedContent,
                  metadata_json: {},
                  created_at: new Date().toISOString(),
                },
              ]
            : s.messages;

          return {
            ...s,
            messages: newMessages,
            streamingContent: '',
            isGenerating: false,
            isTyping: false,
          };
        });
        this.isGenerating = false;
        break;
      }

      case 'error': {
        chatStore.update((s) => ({
          ...s,
          isTyping: false,
          isGenerating: false,
          streamingContent: '',
        }));

        const payload = msg.payload;
        const retryable = payload?.data?.retryable as boolean | undefined;
        const retryAfter = (payload?.data?.retry_after_seconds as number | undefined) ?? 3;
        const retryMessage = (payload?.data?.retry_message as string | undefined) ?? '';

        if (retryable && this.pendingRetry && (payload?.statusCode === 502 || payload?.statusCode === 409)) {
          chatStore.update((s) => ({ ...s, wsError: retryMessage }));
          const { content, documentIds } = this.pendingRetry;
          this.pendingRetry.timeoutId = setTimeout(() => {
            chatStore.update((s) => ({ ...s, wsError: null }));
            this.isGenerating = false;
            this.sendMessage(content, documentIds);
          }, retryAfter * 1000);
        } else {
          this.isGenerating = false;
          chatStore.update((s) => ({
            ...s,
            wsError: payload?.message ?? 'UNKNOWN_ERROR',
          }));
        }
        break;
      }

      case 'pong':
        break;
    }
  }

  sendMessage(content: string, documentIds: string[] = []): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    if (this.isGenerating) return;

    this.pendingRetry = {
      content,
      documentIds,
      timeoutId: null,
    };

    chatStore.update((s) => ({
      ...s,
      messages: [
        ...s.messages,
        {
          id: crypto.randomUUID(),
          session_id: s.activeSessionId ?? '',
          role: 'user' as const,
          content,
          metadata_json: {},
          created_at: new Date().toISOString(),
        },
      ],
      streamingContent: '',
      isGenerating: true,
      wsError: null,
    }));

    this.ws.send(
      JSON.stringify({
        type: 'user_message',
        content,
        document_ids: documentIds,
      })
    );
  }

  stopGeneration(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    if (this.pendingRetry?.timeoutId) {
      clearTimeout(this.pendingRetry.timeoutId);
      this.pendingRetry = null;
    }
    this.ws.send(JSON.stringify({ type: 'stop_generation' }));
    this.isGenerating = false;
    chatStore.update((s) => ({ ...s, isGenerating: false, isTyping: false, streamingContent: '' }));
  }

  disconnect(): void {
    this.stopPing();
    if (this.pendingRetry?.timeoutId) clearTimeout(this.pendingRetry.timeoutId);
    this.pendingRetry = null;
    this.isGenerating = false;
    this.receivedInitialChunk = false;
    this.skippingInitialScript = false;
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    chatStore.update((s) => ({
      ...s,
      isConnecting: false,
      isGenerating: false,
      isTyping: false,
      streamingContent: '',
      wsError: null,
    }));
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

export const wsService = new WebSocketService();

// Legacy exports kept so existing app boot auth flow remains unchanged.
export function connectWebSocket(): void {}

export function disconnectWebSocket(): void {
  wsService.disconnect();
}
