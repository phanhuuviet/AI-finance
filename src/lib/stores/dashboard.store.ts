import { writable } from 'svelte/store';
import type { DocumentItem } from '../models';

export const dashboardDocumentsStore = writable<DocumentItem[]>([]);
