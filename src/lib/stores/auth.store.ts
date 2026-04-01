import { writable } from 'svelte/store';
import type { User } from '../models';
import { authService } from '../services/auth.service';

const initialUser = authService.getStoredUser();

export const authUserStore = writable<User | null>(initialUser);
