import { authApi, userApi } from '../api';
import type {
  AuthLoginRequest,
  AuthRegisterRequest,
  User
} from '../models';

const TOKEN_STORAGE_KEY = 'token';
const USER_STORAGE_KEY = 'user';

function persistSession(accessToken: string, userData: User): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
}

function clearSession(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export const authService = {
  getStoredUser(): User | null {
    return readStoredUser();
  },

  getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },

  async login(payload: AuthLoginRequest): Promise<User> {
    const auth = await authApi.login(payload);
    persistSession(auth.access_token, readStoredUser() || ({ username: payload.username } as User));
    const me = await authApi.me();
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(me));
    return me;
  },

  async register(payload: AuthRegisterRequest): Promise<User> {
    return authApi.register(payload);
  },

  async fetchUser(): Promise<User> {
    const me = await userApi.getProfile();
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(me));
    return me;
  },

  async updateUser(payload: Partial<User>): Promise<User> {
    const updated = await userApi.updateProfile(payload);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  logout(): void {
    clearSession();
  }
};
