import { writable } from 'svelte/store';
import { fetchWithAuth } from '../utils/api.js';

/** @typedef {import('../models/chat').ChatSession} ChatSession */
/** @typedef {import('../models/chat').ChatSessionDetail} ChatSessionDetail */
/** @typedef {import('../models/chat').ChatMessage} ChatMessage */

/**
 * @typedef {{
 *  sessions: ChatSession[];
 *  currentSessionId: string | null;
 *  messages: Record<string, ChatMessage[]>;
 * }} ChatState
 */

function createChatStore() {
  const { subscribe, set, update } = writable(
    /** @type {ChatState} */
    ({
      sessions: [],
      currentSessionId: null,
      messages: {} // Map of chatId -> messages array
    })
  );

  return {
    subscribe,
    set,
    update,
    fetchSessions: async () => {
      try {
        // const data = await fetchWithAuth('/chat/sessions');
        /** @type {ChatSession[]} */
        const data = [
          {
            "_id": "session1",
            "title": "Chat about Project Alpha",
            "created_at": "2024-06-01T12:00:00Z",
            "updated_at": "2024-06-01T12:30:00Z"
          }
        ]
        update(state => ({ ...state, sessions: data }));
      } catch (error) {
        console.error('Failed to fetch chat sessions:', error);
      }
    },
    /**
     * @param {string} title
     * @param {string[]} [documentIds]
     * @returns {Promise<ChatSession>}
     */
    createSession: async (title, documentIds = []) => {
      try {
        /** @type {ChatSession} */
        const data = await fetchWithAuth('/chat/sessions', {
          method: 'POST',
          body: JSON.stringify({ title, document_ids: documentIds })
        });
        
        update(state => {
          const sessions = [data, ...state.sessions];
          return { ...state, sessions, currentSessionId: data._id };
        });
        return data;
      } catch (error) {
        console.error('Failed to create chat session:', error);
        throw error;
      }
    },
    /** @param {string | null} sessionId */
    setCurrentSession: (sessionId) => {
      update(state => ({ ...state, currentSessionId: sessionId }));
    },
    /**
     * @param {string} sessionId
     * @returns {Promise<void>}
     */
    loadMessages: async (sessionId) => {
      try {
        /** @type {ChatSessionDetail} */
        const data = await fetchWithAuth(`/chat/sessions/${sessionId}`);
        update(state => {
          const newMessages = { ...state.messages };
          newMessages[sessionId] = data.messages || [];
          return { ...state, messages: newMessages, currentSessionId: sessionId };
        });
      } catch (error) {
        console.error('Failed to load chat messages:', error);
      }
    },
    /**
     * @param {string} chatId
     * @param {ChatMessage} message
     */
    addMessage: (chatId, message) => {
      update(state => {
        const chatMessages = state.messages[chatId] || [];
        // Prevent duplicate IDs from stream chunk processing
        if (!chatMessages.find(m => m.id === message.id)) {
            return {
                ...state,
                messages: {
                ...state.messages,
                [chatId]: [...chatMessages, message]
                }
            };
        }
        return state;
      });
    },
    /**
     * @param {string} chatId
     * @param {string} messageId
     * @param {string} chunk
     */
    appendChunk: (chatId, messageId, chunk) => {
      update(state => {
        const chatMessages = [...(state.messages[chatId] || [])];
        const msgIndex = chatMessages.findIndex(m => m.id === messageId);
        
        if (msgIndex !== -1) {
          chatMessages[msgIndex] = {
            ...chatMessages[msgIndex],
            content: chatMessages[msgIndex].content + chunk
          };
          
          return {
            ...state,
            messages: {
              ...state.messages,
              [chatId]: chatMessages
            }
          };
        }
        return state;
      });
    }
  };
}

export const chatStore = createChatStore();
