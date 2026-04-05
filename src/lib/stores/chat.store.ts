import { writable, derived } from 'svelte/store';
import type { ChatMessage } from '$lib/models/chat.model';

interface ChatState {
	activeSessionId: string | null;
	messages: ChatMessage[];
	isLoading: boolean;
	error: string | null;
}

export const chatStore = writable<ChatState>({
	activeSessionId: null,
	messages: [],
	isLoading: false,
	error: null,
});

export const chatMessages = derived(chatStore, ($s) => $s.messages);
export const activeSessionId = derived(chatStore, ($s) => $s.activeSessionId);
export const chatLoading = derived(chatStore, ($s) => $s.isLoading);
