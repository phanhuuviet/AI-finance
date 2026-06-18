import { writable } from 'svelte/store';

/**
 * Global UI state shared across the app shell and pages.
 * `newChatModalOpen` lets both the sidebar and the Chats page open the
 * single New-chat modal that lives in the app shell.
 */
export const newChatModalOpen = writable(false);
