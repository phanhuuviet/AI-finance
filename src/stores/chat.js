import { writable } from 'svelte/store';

/** @typedef {import('../lib/models').ChatSession} ChatSession */
/** @typedef {import('../lib/models').ChatSessionDetail} ChatSessionDetail */
/** @typedef {import('../lib/models').ChatMessage} ChatMessage */
/** @typedef {import('../lib/models').PaginationMeta} PaginationMeta */

/**
 * @typedef {{
 *  sessions: ChatSession[];
 *  sessionsPagination: PaginationMeta | null;
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
      sessionsPagination: null,
      currentSessionId: null,
      messages: {},
      sessionsState: createAsyncState(),
      messagesState: {}
    })
  );

  return {
    subscribe,
    set,
    update,
    /**
     * @param {string} title
     * @param {string[]} [documentIds]
     * @returns {Promise<ChatSession>}
     */
    /** @param {string | null} sessionId */
    setCurrentSession: (sessionId) => {
      update(state => ({ ...state, currentSessionId: sessionId }));
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
