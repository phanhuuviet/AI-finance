import { http } from '../base/http';
import type { Document, CreateDocumentRequest } from '$lib/models/document.model';

export const documentApi = {
  getDocuments: (page: number = 1) =>
    http<{ documents: Document[] }>(`/document?page=${page}&limit=20`),

  createDocument: (body: CreateDocumentRequest) =>
    http<Document>('/document', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};