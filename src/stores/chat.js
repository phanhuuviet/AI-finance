import { writable } from 'svelte/store';
import { chatService } from '../lib/services/chat.service';

/** @typedef {import('../lib/models').ChatSession} ChatSession */
/** @typedef {import('../lib/models').ChatSessionDetail} ChatSessionDetail */
/** @typedef {import('../lib/models').ChatMessage} ChatMessage */

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
        /** @type {ChatSession[]} */
        const data = await chatService.getSessions();
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
        const data = await chatService.createSession(title, documentIds);
        
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
        const data = await chatService.getSessionDetail(sessionId);
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
