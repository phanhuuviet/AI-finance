import { writable } from 'svelte/store';
import { dashboardService } from '../lib/services/dashboard.service';
import { createLoadingGate } from '../lib/utils/loading.js';

/** @typedef {import('../lib/models').DocumentItem} DocumentItem */
/** @typedef {import('../lib/models').TokenUsageAnalytics} TokenUsageAnalytics */
/** @typedef {import('../lib/models').StudioOutput} StudioOutput */
/** @typedef {import('../lib/models').PaginationMeta} PaginationMeta */

/**
 * @template T
 * @returns {{ data: T | null; loading: boolean; showLoading: boolean; error: string | null }}
 */
function createAsyncState() {
  return {
    data: null,
    loading: false,
    showLoading: false,
    error: null
  };
}

/**
 * @param {unknown} error
 */
function toMessage(error) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'Request failed.';
}

function createDashboardStore() {
  const { subscribe, update } = writable({
    documents: createAsyncState(),
    documentsPagination: /** @type {PaginationMeta | null} */ (null),
    tokenUsage: createAsyncState(),
    studioBySession: /** @type {Record<string, ReturnType<typeof createAsyncState>>} */ ({}),
    studioPaginationBySession: /** @type {Record<string, PaginationMeta | null>} */ ({})
  });

  const documentsGate = createLoadingGate(() => {
    update((state) => ({
      ...state,
      documents: {
        ...state.documents,
        showLoading: true
      }
    }));
  });

  const tokenUsageGate = createLoadingGate(() => {
    update((state) => ({
      ...state,
      tokenUsage: {
        ...state.tokenUsage,
        showLoading: true
      }
    }));
  });

  let documentsRequestId = 0;
  let tokenUsageRequestId = 0;
  /** @type {Record<string, number>} */
  const studioRequestIds = {};

  /** @param {string} sessionId */
  function ensureStudioState(sessionId) {
    update((state) => {
      if (state.studioBySession[sessionId]) return state;
      return {
        ...state,
        studioBySession: {
          ...state.studioBySession,
          [sessionId]: createAsyncState()
        },
        studioPaginationBySession: {
          ...state.studioPaginationBySession,
          [sessionId]: state.studioPaginationBySession[sessionId] || null
        }
      };
    });
  }

  /** @param {string} sessionId */
  function createStudioGate(sessionId) {
    return createLoadingGate(() => {
      update((state) => ({
        ...state,
        studioBySession: {
          ...state.studioBySession,
          [sessionId]: {
            ...(state.studioBySession[sessionId] || createAsyncState()),
            showLoading: true
          }
        }
      }));
    });
  }

  return {
    subscribe,

    async fetchDocuments() {
      const requestId = ++documentsRequestId;
      documentsGate.start();
      update((state) => ({
        ...state,
        documentsPagination: null,
        documents: {
          ...state.documents,
          data: null,
          loading: true,
          error: null,
          showLoading: false
        }
      }));

      try {
        const result = await dashboardService.getDocuments();
        const data = /** @type {DocumentItem[]} */ (Array.isArray(result?.data) ? result.data : []);
        if (requestId !== documentsRequestId) return [];
        update((state) => ({
          ...state,
          documentsPagination: result?.pagination || null,
          documents: {
            ...state.documents,
            data,
            error: null
          }
        }));
        return data;
      } catch (error) {
        if (requestId !== documentsRequestId) throw error;
        update((state) => ({
          ...state,
          documents: {
            ...state.documents,
            error: toMessage(error)
          }
        }));
        throw error;
      } finally {
        if (requestId !== documentsRequestId) return;
        documentsGate.stop();
        update((state) => ({
          ...state,
          documents: {
            ...state.documents,
            loading: false,
            showLoading: false
          }
        }));
      }
    },

    async uploadDocument(file) {
      await dashboardService.uploadDocument(file);
      return this.fetchDocuments();
    },

    async crawlWebsite(url) {
      await dashboardService.crawlWebsite(url);
      return this.fetchDocuments();
    },

    async deleteDocument(id) {
      await dashboardService.deleteDocument(id);
      return this.fetchDocuments();
    },

    async fetchTokenUsage(days) {
      const requestId = ++tokenUsageRequestId;
      tokenUsageGate.start();
      update((state) => ({
        ...state,
        tokenUsage: {
          ...state.tokenUsage,
          data: null,
          loading: true,
          error: null,
          showLoading: false
        }
      }));

      try {
        const data = /** @type {TokenUsageAnalytics} */ (await dashboardService.getTokenUsage(days));
        if (requestId !== tokenUsageRequestId) return null;
        update((state) => ({
          ...state,
          tokenUsage: {
            ...state.tokenUsage,
            data,
            error: null
          }
        }));
        return data;
      } catch (error) {
        if (requestId !== tokenUsageRequestId) throw error;
        update((state) => ({
          ...state,
          tokenUsage: {
            ...state.tokenUsage,
            error: toMessage(error)
          }
        }));
        throw error;
      } finally {
        if (requestId !== tokenUsageRequestId) return;
        tokenUsageGate.stop();
        update((state) => ({
          ...state,
          tokenUsage: {
            ...state.tokenUsage,
            loading: false,
            showLoading: false
          }
        }));
      }
    },

    async fetchStudioOutputs(sessionId) {
      ensureStudioState(sessionId);
      const requestId = (studioRequestIds[sessionId] || 0) + 1;
      studioRequestIds[sessionId] = requestId;
      const gate = createStudioGate(sessionId);
      gate.start();
      update((state) => ({
        ...state,
        studioBySession: {
          ...state.studioBySession,
          [sessionId]: {
            ...(state.studioBySession[sessionId] || createAsyncState()),
            data: null,
            loading: true,
            error: null,
            showLoading: false
          }
        }
      }));

      try {
        const result = await dashboardService.getStudioOutputs(sessionId);
        const data = /** @type {StudioOutput[]} */ (Array.isArray(result?.data) ? result.data : []);
        if (requestId !== studioRequestIds[sessionId]) return [];
        update((state) => ({
          ...state,
          studioPaginationBySession: {
            ...state.studioPaginationBySession,
            [sessionId]: result?.pagination || null
          },
          studioBySession: {
            ...state.studioBySession,
            [sessionId]: {
              ...(state.studioBySession[sessionId] || createAsyncState()),
              data,
              error: null
            }
          }
        }));
        return data;
      } catch (error) {
        if (requestId !== studioRequestIds[sessionId]) throw error;
        update((state) => ({
          ...state,
          studioBySession: {
            ...state.studioBySession,
            [sessionId]: {
              ...(state.studioBySession[sessionId] || createAsyncState()),
              error: toMessage(error)
            }
          }
        }));
        throw error;
      } finally {
        if (requestId !== studioRequestIds[sessionId]) return;
        gate.stop();
        update((state) => ({
          ...state,
          studioBySession: {
            ...state.studioBySession,
            [sessionId]: {
              ...(state.studioBySession[sessionId] || createAsyncState()),
              loading: false,
              showLoading: false
            }
          }
        }));
      }
    },

    async createStudioOutput(sessionId, type, payload) {
      const created = await dashboardService.createStudioOutput(sessionId, type, payload);
      await this.fetchStudioOutputs(sessionId);
      return created;
    },

    async generateVideoScriptPrompts(payload) {
      return dashboardService.generateVideoScriptPrompts(payload);
    },

    async renameStudioOutput(sessionId, outputId, title) {
      await dashboardService.renameStudioOutput(outputId, title);
      await this.fetchStudioOutputs(sessionId);
    },

    async deleteStudioOutput(sessionId, outputId) {
      await dashboardService.deleteStudioOutput(outputId);
      await this.fetchStudioOutputs(sessionId);
    },

    shareStudioOutput(outputId) {
      return dashboardService.shareStudioOutput(outputId);
    },

    downloadStudioOutput(outputId) {
      return dashboardService.downloadStudioOutput(outputId);
    }
  };
}

export const dashboardStore = createDashboardStore();
