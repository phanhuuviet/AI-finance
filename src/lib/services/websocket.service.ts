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

  connect(sessionId: string): void {
    this.disconnect();
    this.sessionId = sessionId;

    chatStore.update((s) => ({
      ...s,
      activeSessionId: sessionId,
      isConnecting: true,
      isGenerating: false,
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
      chatStore.update((s) => ({ ...s, isConnecting: false, isGenerating: false }));

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
      case 'ack':
        if (msg.payload?.message === 'CHAT_CONNECTED') {
          chatStore.update((s) => ({ ...s, isConnecting: false, wsError: null }));
        }
        break;

      case 'assistant_chunk': {
        const content = (msg.payload?.data?.content as string) ?? '';
        this.isGenerating = true;
        chatStore.update((s) => ({
          ...s,
          isGenerating: true,
          streamingContent: (s.streamingContent ?? '') + content,
        }));
        break;
      }

      case 'assistant_done':
        chatStore.update((s) => {
          const finishedContent = s.streamingContent ?? '';
          if (!finishedContent) return { ...s, isGenerating: false, streamingContent: '' };
          const newMessage = {
            id: crypto.randomUUID(),
            session_id: s.activeSessionId ?? '',
            role: 'assistant' as const,
            content: finishedContent,
            metadata_json: {},
            created_at: new Date().toISOString(),
          };
          return {
            ...s,
            messages: [...s.messages, newMessage],
            streamingContent: '',
            isGenerating: false,
          };
        });
        this.isGenerating = false;
        break;

      case 'error': {
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
            isGenerating: false,
            streamingContent: '',
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
    chatStore.update((s) => ({ ...s, isGenerating: false, streamingContent: '' }));
  }

  disconnect(): void {
    this.stopPing();
    if (this.pendingRetry?.timeoutId) clearTimeout(this.pendingRetry.timeoutId);
    this.pendingRetry = null;
    this.isGenerating = false;
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    chatStore.update((s) => ({
      ...s,
      isConnecting: false,
      isGenerating: false,
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
