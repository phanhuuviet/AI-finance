import { writable, derived } from 'svelte/store';
import type { ChatMessage } from '$lib/models/chat.model';

interface ChatState {
	activeSessionId: string | null;
	messages: ChatMessage[];
	isLoading: boolean;
	isConnecting: boolean;
	isGenerating: boolean;
	isTyping: boolean;
	streamingContent: string;
	wsError: string | null;
	error: string | null;
}

export const chatStore = writable<ChatState>({
	activeSessionId: null,
	messages: [],
	isLoading: false,
	isConnecting: false,
	isGenerating: false,
	isTyping: false,
	streamingContent: '',
	wsError: null,
	error: null,
});

export const chatMessages = derived(chatStore, ($s) => $s.messages);
export const activeSessionId = derived(chatStore, ($s) => $s.activeSessionId);
export const chatLoading = derived(chatStore, ($s) => $s.isLoading);
export const isGenerating = derived(chatStore, ($s) => $s.isGenerating);
export const isConnecting = derived(chatStore, ($s) => $s.isConnecting);
export const isTyping = derived(chatStore, ($s) => $s.isTyping);
export const streamingContent = derived(chatStore, ($s) => $s.streamingContent);
export const wsError = derived(chatStore, ($s) => $s.wsError);
