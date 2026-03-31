import { derived, writable } from 'svelte/store';
import { workspaceStore } from './workspace.js';

// Holds document selections per conversation (session)
// shape: { [sessionId]: Set<string> }
const selectedBySession = writable({});

function toArray(set) {
  return set ? Array.from(set) : [];
}

export const attachmentsStore = {
  subscribe: selectedBySession.subscribe,

  toggleDocument(sessionId, docId, checked) {
    if (!sessionId || !docId) return;
    selectedBySession.update((m) => {
      const cur = m[sessionId] ? new Set(m[sessionId]) : new Set();
      if (checked) cur.add(docId);
      else cur.delete(docId);
      return { ...m, [sessionId]: cur };
    });
  },

  clearSession(sessionId) {
    if (!sessionId) return;
    selectedBySession.update((m) => ({ ...m, [sessionId]: new Set() }));
  },

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
