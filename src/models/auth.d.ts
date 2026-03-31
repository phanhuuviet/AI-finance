export interface AuthLoginResponse {
  access_token: string;
  token_type?: string;
  [key: string]: unknown;
}
