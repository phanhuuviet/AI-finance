import { goto } from '$app/navigation';
import { authApi } from '$lib/api/modules/auth.api';
import { ApiError } from '$lib/api/base/http';
import { authStore } from '$lib/stores/auth.store';
import { sessionService } from './session.service';
import { tokenStorage } from '$lib/utils/token';
import type { LoginRequest, RegisterRequest } from '$lib/models/auth.model';

export const authService = {
  async login(body: LoginRequest): Promise<void> {
    authStore.update((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const { data } = await authApi.login(body);
      tokenStorage.setTokens(data.access_token, data.refresh_token);
      authStore.update((s) => ({ ...s, user: data.user, isLoading: false }));
      await sessionService.loadSessions();
      goto('/workspace');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'LOGIN_FAILED';
      authStore.update((s) => ({ ...s, error: message, isLoading: false }));
      throw err;
    }
  },

  async register(body: RegisterRequest): Promise<void> {
    authStore.update((s) => ({ ...s, isLoading: true, error: null }));
    try {
      await authApi.register(body);
      authStore.update((s) => ({ ...s, isLoading: false }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'REGISTER_FAILED';
      authStore.update((s) => ({ ...s, error: message, isLoading: false }));
      throw err;
    }
  },

  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefresh();
    try {
      if (refreshToken) {
        await authApi.logout({ refresh_token: refreshToken });
      }
    } finally {
      tokenStorage.clearTokens();
      authStore.set({ user: null, isLoading: false, error: null });
      goto('/login');
    }
  },

  async fetchCurrentUser(): Promise<void> {
    if (!tokenStorage.hasValidSession()) return;
    authStore.update((s) => ({ ...s, isLoading: true }));
    try {
      const { data } = await authApi.me();
      authStore.update((s) => ({ ...s, user: data.user, isLoading: false }));
    } catch (err) {
      tokenStorage.clearTokens();
      authStore.set({ user: null, isLoading: false, error: null });
    }
  },

  async rehydrate(): Promise<void> {
    await authService.fetchCurrentUser();
  }
};
