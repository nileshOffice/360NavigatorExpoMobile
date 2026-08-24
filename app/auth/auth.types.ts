export interface LoginRequest {
  userName: string;
  password: string;
  accessCode?: string;
  isFromLogIn?: boolean;
}

export type User = Record<string, any> & {
  userId?: string | number;
  roleId?: string | number;
  companyId?: string | number;
  isCompanyAccess?: boolean;
  sessionId?: number;
  sessionToken?: string;
  accessToken?: string;
  isLoggedIn?: boolean | string | number;
  isNavigationAllowed?: boolean;

};

export type Site = Record<string, any> & {
  id: number;
  siteName: string;
  siteDescription?: string;
  siteAddress?: string;

  companyId: number;
  city?: string;
  division?: string;
  orgid?: string;

  asset_Count?: number;

  isActive?: number;
  isDeleted?: boolean;
  isHQSite?: boolean;

  siteColor?: string;

};

export type LoginResponse = Record<string, string> & {
   isLoggedIn?: boolean | string | number;
   currentUser?: User;
};


export interface LogoutDto {
  id21: string | number | any;
  id22: string | number | any ;
  id51: boolean;
}



export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isCompanySelectedByUser: boolean;
  isSiteSelectedByUser: Site;
  visitFlag: boolean;
  lastVisitedRoute: string | null;
}



export interface UpdateUserSessionOnSiteChangeRequest {
  id1: string | number | null;
  id2: string | number | null;
  id3: string | number | null;
  id4: string | number | null;
  id5: string | number | null;
  id6: string | number | null;
  id7: string | number | null;
  id8: string | number | null;
  id21: number;
  id22: number;
  id23: number;
  id24: number;
}