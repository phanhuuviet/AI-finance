import { writable } from 'svelte/store';

/** @typedef {import('../lib/models').WebSocketStatus} WebSocketStatus */

/**
 * @typedef {{
 *  status: WebSocketStatus;
 *  error: string | null;
 * }} WebSocketState
 */

function createWebSocketStore() {
  const { subscribe, set, update } = writable(
    /** @type {WebSocketState} */
    ({
      status: 'disconnected', // 'disconnected', 'connecting', 'connected', 'error'
      error: null
    })
  );

  return {
    subscribe,
    /** @param {WebSocketStatus} status */
    setStatus: (status) => update(state => ({ ...state, status })),
    /** @param {string} error */
    setError: (error) => update(state => ({ ...state, error, status: 'error' })),
    reset: () => set({ status: 'disconnected', error: null })
  };
}

export const wsStore = createWebSocketStore();
