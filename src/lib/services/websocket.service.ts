import { get } from 'svelte/store';
import { user } from '../../stores/auth.js';
import { wsStore } from '../../stores/websocket.js';
import { chatStore } from '../../stores/chat.js';
import type { User, WsInboundMessage, WsSendMessage } from '../models';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/chat/ws';
let ws: WebSocket | null = null;

function parseInbound(eventData: string): WsInboundMessage {
  return JSON.parse(eventData) as WsInboundMessage;
}

export function connectWebSocket(): void {
  const currentUser = get(user) as User | null;
  if (!currentUser) return;

  const clientId = currentUser._id ?? currentUser.id;
  if (!clientId) return;

  if (ws) ws.close();
  wsStore.setStatus('connecting');

  ws = new WebSocket(`${WS_URL}/${clientId}`);

  ws.onopen = () => {
    wsStore.setStatus('connected');
  };

  ws.onmessage = (event: MessageEvent<string>) => {
    const data = parseInbound(event.data);
    switch (data.type) {
      case 'stream_start':
        chatStore.addMessage(String(data.chat_id), {
          id: String(data.message_id),
          role: 'assistant',
          content: ''
        });
        break;
      case 'stream_chunk':
        chatStore.appendChunk(String(data.chat_id), String(data.message_id), String(data.content));
        break;
      case 'message':
        chatStore.addMessage(String(data.chat_id), data.message as any);
        break;
      case 'error':
        wsStore.setError(String(data.error));
        break;
      default:
        break;
    }
  };

  ws.onclose = () => {
    wsStore.setStatus('disconnected');
    setTimeout(connectWebSocket, 3000);
  };

  ws.onerror = () => {
    wsStore.setStatus('error');
  };
}

export function sendWebSocketMessage(chatId: string, content: string, documentIds: string[] = []): void {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  const payload: WsSendMessage = {
    chat_id: chatId,
    content,
    document_ids: documentIds
  };
  ws.send(JSON.stringify(payload));
}

export function disconnectWebSocket(): void {
  if (ws) {
    ws.close();
    ws = null;
  }
}
