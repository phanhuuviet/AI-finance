import { get } from 'svelte/store';
import { user } from '../stores/auth.js';
import { wsStore } from '../stores/websocket.js';
import { chatStore } from '../stores/chat.js';

/** @typedef {import('../models/user').User} User */
/** @typedef {import('../models/websocket').WsInboundMessage} WsInboundMessage */
/** @typedef {import('../models/websocket').WsSendMessage} WsSendMessage */

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/chat/ws';
/** @type {WebSocket | null} */
let ws = null;

export function connectWebSocket() {
  /** @type {User | null} */
  const currentUser = get(user);
  if (!currentUser) return;

  // Simple client_id using user._id for this example
  const clientId = currentUser._id ?? currentUser.id;
  if (!clientId) return;
  
  if (ws) {
    ws.close();
  }

  ws = new WebSocket(`${WS_URL}/${clientId}`);

  ws.onopen = () => {
    wsStore.setStatus('connected');
  };

  ws.onmessage = (event) => {
    /** @type {WsInboundMessage} */
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

/**
 * @param {string} chatId
 * @param {string} content
 */
export function sendWebSocketMessage(chatId, content) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    /** @type {WsSendMessage} */
    const payload = {
      chat_id: chatId,
      content
    };
    ws.send(JSON.stringify(payload));
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
