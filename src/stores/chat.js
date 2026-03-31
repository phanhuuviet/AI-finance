import { writable } from 'svelte/store';
import { fetchWithAuth } from '../utils/api.js';

function createChatStore() {
  const { subscribe, set, update } = writable({
    sessions: [],
    currentSessionId: null,
    messages: {} // Map of chatId -> messages array
  });

  return {
    subscribe,
    set,
    update,
    fetchSessions: async () => {
      try {
        // const data = await fetchWithAuth('/chat/sessions');
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
    createSession: async (title, documentIds = []) => {
      try {
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
    setCurrentSession: (sessionId) => {
      update(state => ({ ...state, currentSessionId: sessionId }));
    },
    loadMessages: async (sessionId) => {
      try {
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
