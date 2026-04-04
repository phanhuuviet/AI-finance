import type {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthRegisterRequest,
  User
} from '../../models';
import { http } from '../base/http';

export const authApi = {
  async login(payload: AuthLoginRequest): Promise<AuthLoginResponse> {
    const { data } = await http<AuthLoginResponse>('/auth/login', {
      method: 'POST',
      body: payload
    });
    return data;
  },

  async register(payload: AuthRegisterRequest): Promise<User> {
    const { data } = await http<User>('/auth/register', {
      method: 'POST',
      body: payload
    });
    return data;
  },

  async me(): Promise<User> {
    const { data } = await http<User>('/auth/me');
    return data;
  },

  async updateMe(payload: Partial<User>): Promise<User> {
    const { data } = await http<User>('/auth/me', {
      method: 'PUT',
      body: payload
    });
    return data;
  }
};
