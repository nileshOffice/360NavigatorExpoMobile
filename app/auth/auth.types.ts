export interface LoginRequest {
  userName: string;
  password: string;
  accessCode?: string;
  isFromLogIn?: boolean;
}

export interface LoginResponse {
 [key: string]: unknown;
}

export interface User {
  id: string;
  userName: string;
  name?: string;
}