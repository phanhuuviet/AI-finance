import { writable } from 'svelte/store';

// Behavior B:
// - Must pick a conversation (session) first.
// - Documents/Chat/Studio shown only after session is selected.
// - When switching to a different session, reset its active section to 'chat'.
const initial = {
  currentSessionId: null,
  activeSectionBySession: {}
};

function createWorkspaceStore() {
  const { subscribe, update, set } = writable(structuredClone(initial));

  return {
    subscribe,
    reset: () => set(structuredClone(initial)),

    setCurrentSession: (sessionId) =>
      update((s) => ({
        ...s,
        currentSessionId: sessionId,
        activeSectionBySession: {
          ...s.activeSectionBySession,
          ...(sessionId ? { [sessionId]: 'chat' } : {})
        }
      })),

    setActiveSectionForCurrentSession: (section) =>
      update((s) => {
        if (!s.currentSessionId) return s;
        return {
          ...s,
          activeSectionBySession: {
            ...s.activeSectionBySession,
            [s.currentSessionId]: section
          }
        };
      })
  };
}

export const workspaceStore = createWorkspaceStore();
