import type { Id } from './common.model';

export interface UserPreferences {
  model: string;
  [key: string]: unknown;
}

export interface User {
  _id?: Id;
  id?: Id;
  username: string;
  email?: string;
  preferences?: UserPreferences;
  [key: string]: unknown;
}
