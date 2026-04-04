import type { User } from '../../models';
import { http } from '../base/http';

export const userApi = {
  async getProfile(): Promise<User> {
    const { data } = await http<User>('/auth/me');
    return data;
  },

  async updateProfile(payload: Partial<User>): Promise<User> {
    const { data } = await http<User>('/auth/me', {
      method: 'PUT',
      body: payload
    });
    return data;
  }
};
