import type { User } from '../../models';
import { http } from '../base/http';

export const userApi = {
  getProfile(): Promise<User> {
    return http<User>('/auth/me');
  },

  updateProfile(payload: Partial<User>): Promise<User> {
    return http<User>('/auth/me', {
      method: 'PUT',
      body: payload
    });
  }
};
