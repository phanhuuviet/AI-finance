import type {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthRegisterRequest,
  User
} from '../../models';
import { http } from '../base/http';

export const authApi = {
  login(payload: AuthLoginRequest): Promise<AuthLoginResponse> {
    return http<AuthLoginResponse>('/auth/login', {
      method: 'POST',
      body: payload
    });
  },

  register(payload: AuthRegisterRequest): Promise<User> {
    return http<User>('/auth/register', {
      method: 'POST',
      body: payload
    });
  },

  me(): Promise<User> {
    return http<User>('/auth/me');
  },

  updateMe(payload: Partial<User>): Promise<User> {
    return http<User>('/auth/me', {
      method: 'PUT',
      body: payload
    });
  }
};
