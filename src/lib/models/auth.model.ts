export interface AuthLoginRequest {
  username: string;
  password: string;
}

export interface AuthRegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  access_token: string;
  token_type?: string;
  [key: string]: unknown;
}
