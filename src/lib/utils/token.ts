const ACCESS_KEY = 'auth_access_token';
const REFRESH_KEY = 'auth_refresh_token';

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage;
}

export const tokenStorage = {
  getAccess(): string | null {
    if (!canUseStorage()) return null;
    return localStorage.getItem(ACCESS_KEY);
  },

  getRefresh(): string | null {
    if (!canUseStorage()) return null;
    return localStorage.getItem(REFRESH_KEY);
  },

  setTokens(access: string, refresh: string): void {
    if (!canUseStorage()) return;
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },

  clearTokens(): void {
    if (!canUseStorage()) return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },

  hasValidSession(): boolean {
    return !!this.getAccess() && !!this.getRefresh();
  }
};
