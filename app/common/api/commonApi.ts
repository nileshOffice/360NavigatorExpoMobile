import { api as baseApi } from "@/app/lib/api/baseApi";
import { Company, LoginResponse, ModuleListResponse } from "./common.types";

export const commonApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getsiteListByUserId: builder.mutation<LoginResponse[],  {id:any, id22:any}>({
      query: body => {

        return {
          url: "/api/cmn/getSiteListByUserRoleId",
          method: "POST",
          body,
        };
      },
    }),

    getSiteListByCompanyId: builder.mutation<LoginResponse[], {id:any, id22:any}>({
      query: body => {

        return {
          url: "/api/cmn/getSiteListByCompanyId",
          method: "POST",
          body,
        };
      },
    }),


    getCompanyList: builder.query<Company[], void>({
      query: () => ({
        url: '/api/Company/getCompanyList',
        method: 'GET',
      }),
    }),

    getModuleListByUserSid:builder.mutation<ModuleListResponse[],{id21:number, id22:number,id23:number} > ({
        query:body => {
          return {
             url: "/api/cmn/getMobModuleListByUserAndSId",
          method: "POST",
          body,
          }
        }
    })







  }),
});

export const {
  useGetsiteListByUserIdMutation,
  useGetSiteListByCompanyIdMutation,
  useLazyGetCompanyListQuery,
  useGetModuleListByUserSidMutation
} = commonApi;

