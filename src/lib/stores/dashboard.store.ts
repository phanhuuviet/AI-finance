import { writable } from 'svelte/store';
import type { DocumentItem, StudioOutput } from '../models';

export const dashboardDocumentsStore = writable<DocumentItem[]>([]);
export const studioOutputsStore = writable<StudioOutput[]>([]);
