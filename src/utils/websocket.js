import { get } from 'svelte/store';
import { user } from '../stores/auth.js';
import { wsStore } from '../stores/websocket.js';
import { chatStore } from '../stores/chat.js';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/chat/ws';
let ws = null;

export function connectWebSocket() {
  const currentUser = get(user);
  if (!currentUser) return;

  // Simple client_id using user._id for this example
  const clientId = currentUser._id;
  
  if (ws) {
    ws.close();
  }

  ws = new WebSocket(`${WS_URL}/${clientId}`);

  ws.onopen = () => {
    wsStore.setStatus('connected');
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    switch (data.type) {
      case 'stream_start':
        chatStore.addMessage(data.chat_id, {
          id: data.message_id,
          role: 'assistant',
          content: ''
        });
        break;
      case 'stream_chunk':
        chatStore.appendChunk(data.chat_id, data.message_id, data.content);
        break;
      case 'stream_end':
        // Handle stream completion
        break;
      case 'message':
        chatStore.addMessage(data.chat_id, data.message);
        break;
      case 'error':
        console.error('WebSocket Error:', data.error);
        break;
    }
  };

  ws.onclose = () => {
    wsStore.setStatus('disconnected');
    // Attempt to reconnect after a delay
    setTimeout(connectWebSocket, 3000);
  };

  ws.onerror = (error) => {
    console.error('WebSocket Error:', error);
    wsStore.setStatus('error');
  };
}

export function sendWebSocketMessage(chatId, content) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      chat_id: chatId,
      content: content
    }));
  } else {
    console.error('WebSocket is not connected');
  }
}

export function disconnectWebSocket() {
  if (ws) {
    ws.close();
    ws = null;
  }
}
