import { writable } from 'svelte/store';
import type { ChatSession } from '../models';

export const chatSessionsStore = writable<ChatSession[]>([]);
