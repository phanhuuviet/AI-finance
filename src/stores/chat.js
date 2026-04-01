import { writable } from 'svelte/store';
import { chatService } from '../lib/services/chat.service';
import { createLoadingGate } from '../lib/utils/loading.js';

/** @typedef {import('../lib/models').ChatSession} ChatSession */
/** @typedef {import('../lib/models').ChatSessionDetail} ChatSessionDetail */
/** @typedef {import('../lib/models').ChatMessage} ChatMessage */

/**
 * @typedef {{
 *  sessions: ChatSession[];
 *  currentSessionId: string | null;
 *  messages: Record<string, ChatMessage[]>;
 *  sessionsState: { data: ChatSession[] | null; loading: boolean; showLoading: boolean; error: string | null };
 *  messagesState: Record<string, { data: ChatMessage[] | null; loading: boolean; showLoading: boolean; error: string | null }>;
 * }} ChatState
 */

function createAsyncState() {
  return {
    data: null,
    loading: false,
    showLoading: false,
    error: null
  };
}

function createChatStore() {
  const { subscribe, set, update } = writable(
    /** @type {ChatState} */
    ({
      sessions: [],
      currentSessionId: null,
      messages: {},
      sessionsState: createAsyncState(),
      messagesState: {}
    })
  );

  const sessionsGate = createLoadingGate(() => {
    update((state) => ({
      ...state,
      sessionsState: {
        ...state.sessionsState,
        showLoading: true
      }
    }));
  });

  /** @param {string} sessionId */
  function createMessageGate(sessionId) {
    return createLoadingGate(() => {
      update((state) => ({
        ...state,
        messagesState: {
          ...state.messagesState,
          [sessionId]: {
            ...(state.messagesState[sessionId] || createAsyncState()),
            showLoading: true
          }
        }
      }));
    });
  }

  return {
    subscribe,
    set,
    update,
    fetchSessions: async () => {
      sessionsGate.start();
      update((state) => ({
        ...state,
        sessionsState: {
          ...state.sessionsState,
          loading: true,
          showLoading: false,
          error: null
        }
      }));
      try {
        /** @type {ChatSession[]} */
        const data = await chatService.getSessions();
        update(state => ({
          ...state,
          sessions: data,
          sessionsState: {
            ...state.sessionsState,
            data,
            error: null
          }
        }));
      } catch (error) {
        update((state) => ({
          ...state,
          sessionsState: {
            ...state.sessionsState,
            error: error?.message || 'Failed to fetch chat sessions.'
          }
        }));
      } finally {
        sessionsGate.stop();
        update((state) => ({
          ...state,
          sessionsState: {
            ...state.sessionsState,
            loading: false,
            showLoading: false
          }
        }));
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
      const messagesGate = createMessageGate(sessionId);
      messagesGate.start();
      update((state) => ({
        ...state,
        messagesState: {
          ...state.messagesState,
          [sessionId]: {
            ...(state.messagesState[sessionId] || createAsyncState()),
            loading: true,
            showLoading: false,
            error: null,
            data: state.messages[sessionId] || null
          }
        }
      }));

      try {
        /** @type {ChatSessionDetail} */
        const data = await chatService.getSessionDetail(sessionId);
        update(state => {
          const newMessages = { ...state.messages };
          newMessages[sessionId] = data.messages || [];
          return {
            ...state,
            messages: newMessages,
            currentSessionId: sessionId,
            messagesState: {
              ...state.messagesState,
              [sessionId]: {
                ...(state.messagesState[sessionId] || createAsyncState()),
                data: data.messages || [],
                error: null
              }
            }
          };
        });
      } catch (error) {
        update((state) => ({
          ...state,
          messagesState: {
            ...state.messagesState,
            [sessionId]: {
              ...(state.messagesState[sessionId] || createAsyncState()),
              error: error?.message || 'Failed to load chat messages.'
            }
          }
        }));
      } finally {
        messagesGate.stop();
        update((state) => ({
          ...state,
          messagesState: {
            ...state.messagesState,
            [sessionId]: {
              ...(state.messagesState[sessionId] || createAsyncState()),
              loading: false,
              showLoading: false
            }
          }
        }));
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
