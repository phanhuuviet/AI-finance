import { writable } from 'svelte/store';

function createWebSocketStore() {
  const { subscribe, set, update } = writable({
    status: 'disconnected', // 'disconnected', 'connecting', 'connected', 'error'
    error: null
  });

  return {
    subscribe,
    setStatus: (status) => update(state => ({ ...state, status })),
    setError: (error) => update(state => ({ ...state, error, status: 'error' })),
    reset: () => set({ status: 'disconnected', error: null })
  };
}

export const wsStore = createWebSocketStore();
