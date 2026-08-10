export interface LoginRequest {
  userName: string;
  password: string;
  accessCode?: string;
  isFromLogIn?: boolean;
}

export type User = Record<string, unknown> & {
  isLoggedIn?: boolean | string | number;
    isNavigationAllowed?: boolean;

};

export type LoginResponse = Record<string, unknown> & {
  isLoggedIn?: boolean | string | number;
  currentUser?: User;
};