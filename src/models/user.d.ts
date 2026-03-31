import type { Id } from './common';

export interface UserPreferences {
  model: string;
  [key: string]: unknown;
}

export interface User {
  /** Backend commonly uses `_id`, mock may use `id`. */
  _id?: Id;
  id?: Id;
  username: string;
  email?: string;
  preferences?: UserPreferences;
  [key: string]: unknown;
}
