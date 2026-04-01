import { derived, writable } from 'svelte/store';
import { workspaceStore } from './workspace.js';

/** @typedef {import('../lib/models').SelectedBySession} SelectedBySession */

// Holds document selections per conversation (session)
// shape: { [sessionId]: Set<string> }
/** @type {import('svelte/store').Writable<SelectedBySession>} */
const selectedBySession = writable(/** @type {SelectedBySession} */ ({}));

/** @param {Set<string> | undefined} set */
function toArray(set) {
  return set ? Array.from(set) : [];
}

export const attachmentsStore = {
  subscribe: selectedBySession.subscribe,

  /**
   * @param {string | null} sessionId
   * @param {string} docId
   * @param {boolean} checked
   */
  toggleDocument(sessionId, docId, checked) {
    if (!sessionId || !docId) return;
    selectedBySession.update((m) => {
      const cur = m[sessionId] ? new Set(m[sessionId]) : new Set();
      if (checked) cur.add(docId);
      else cur.delete(docId);
      return { ...m, [sessionId]: cur };
    });
  },

  /** @param {string | null} sessionId */
  clearSession(sessionId) {
    if (!sessionId) return;
    selectedBySession.update((m) => ({ ...m, [sessionId]: new Set() }));
  },

  /**
   * @param {string | null} sessionId
   * @returns {string[]}
   */
  getSelectedIds(sessionId) {
    let ids = [];
    selectedBySession.update((m) => {
      ids = toArray(m[sessionId]);
      return m;
    });
    return ids;
  }
};

export const currentSessionSelectedDocIds = derived(
  [workspaceStore, selectedBySession],
  ([$ws, $sel]) => {
    const sid = $ws.currentSessionId;
    return sid ? toArray($sel[sid]) : [];
  }
);
