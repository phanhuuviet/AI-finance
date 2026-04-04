import { writable, derived } from 'svelte/store';
import type { User } from '$lib/models/auth.model';

interface AuthState {
	user: User | null;
	isLoading: boolean;
	error: string | null;
}

const initialState: AuthState = {
	user: null,
	isLoading: false,
	error: null
};

export const authStore = writable<AuthState>(initialState);

export const currentUser = derived(authStore, ($s) => $s.user);
export const isLoggedIn = derived(authStore, ($s) => !!$s.user);
export const authLoading = derived(authStore, ($s) => $s.isLoading);
export const authError = derived(authStore, ($s) => $s.error);
