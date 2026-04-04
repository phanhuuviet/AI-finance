import { http } from '../base/http';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshResponse,
  LogoutRequest,
  LogoutResponse,
  User
} from '$lib/models/auth.model';

export const authApi = {
  register: (body: RegisterRequest) =>
    http<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  login: (body: LoginRequest) =>
    http<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  refresh: (body: { refresh_token: string }) =>
    http<RefreshResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  me: () => http<{ user: User }>('/auth/me'),

  logout: (body: LogoutRequest) =>
    http<LogoutResponse>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify(body)
    })
};
