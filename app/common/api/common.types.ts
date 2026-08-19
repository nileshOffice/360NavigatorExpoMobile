export interface Site {
  id: number;
  name: string;
  // other fields...
}

export interface Company {
  id: number;
  name: string;
  // other fields...
}

export interface SiteCompanyRequest {
  id: string | number;
  id22: string | number;
}

export type User = Record<string, any> & {

  userId?: string | number;
  roleId?: string | number;
  companyId?: string | number;
  isCompanyAccess?: boolean;


  isLoggedIn?: boolean | string | number;
  isNavigationAllowed?: boolean;

};

export type LoginResponse = Record<string, string> & {
   isLoggedIn?: boolean | string | number;
   currentUser?: User;
};


export interface ModuleListResponse {
  id: number;
  name: string;
  // other properties
}[];