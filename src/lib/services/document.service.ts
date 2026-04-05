import { get } from 'svelte/store';
import { documentApi } from '$lib/api/modules/document.api';
import { documentStore } from '$lib/stores/document.store';
import { ApiError } from '$lib/api/base/http';

const HARDCODED_MODEL_METADATA = {
  indexing_state: 'queued' as const,
  paper_context: { source: 'arxiv' as const },
};

export const documentService = {
  async loadDocuments(page: number = 1): Promise<void> {
    documentStore.update((s) => ({ ...s, isLoading: true, error: null, currentPage: page }));
    try {
      const { data, pagination } = await documentApi.getDocuments(page);
      documentStore.update((s) => ({
        ...s,
        documents: data.documents,
        pagination: pagination ?? null,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'DOCUMENT_LOAD_FAILED';
      documentStore.update((s) => ({ ...s, error: message, isLoading: false }));
    }
  },

  async createDocument(title: string, content: string): Promise<void> {
    documentStore.update((s) => ({ ...s, isCreating: true, error: null }));
    try {
      await documentApi.createDocument({
        title,
        content,
        source_type: 'raw',
        model_metadata: HARDCODED_MODEL_METADATA,
      });
      await documentService.loadDocuments(1);
      documentStore.update((s) => ({ ...s, isCreating: false }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'DOCUMENT_CREATE_FAILED';
      documentStore.update((s) => ({ ...s, error: message, isCreating: false }));
      throw err;
    }
  },

  goToPage(page: number): void {
    documentService.loadDocuments(page);
  },

  async deleteDocument(documentId: string): Promise<void> {
    documentStore.update((s) => ({ ...s, isLoading: true, error: null }));
    try {
      await documentApi.deleteDocument(documentId);
      const currentPage = get(documentStore).currentPage;
      await documentService.loadDocuments(currentPage);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'DOCUMENT_DELETE_FAILED';
      documentStore.update((s) => ({ ...s, error: message, isLoading: false }));
      throw err;
    }
  },
};