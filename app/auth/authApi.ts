import { api as baseApi } from "@/app/lib/api/baseApi";
import {
    LoginRequest,
    LoginResponse,
    UpdateUserSessionOnSiteChangeRequest
} from "./auth.types";


export const authApi = baseApi.injectEndpoints({



    endpoints: (builder) => ({

        login: builder.mutation<LoginResponse, LoginRequest>({

            query: (body) => ({
                url: `/api/token/`,
                method: "POST",
                body,
            }),

        }),
        

       
        logoutUser: builder.mutation<void,  {id21: any; id22: any;id51: any;}>({

            query: (body) => ({
                url: "/api/token/updateUsersAppUsageDuration",
                method: "POST",
                body: {
                    dto: body,
                },
               
            }),
        }),

        startNewSessionForUser: builder.mutation<LoginResponse, { id1: string; id2: string }>({

            query: (body) => ({
                url: `/api/token/startNewSessionForUser`,
                method: "POST",
                body,
            }),
        }),

        updateUserSessionOnSiteChange: builder.mutation<LoginResponse, UpdateUserSessionOnSiteChangeRequest>({
            query: (idDto) => ({
                url: "/api/user/updateUserSessionOnSiteChange",
                method: "POST",
                body: idDto,
            }),
        }),


        profile: builder.query<any,void>({

            query: () => ({
                url: "/profile",
                method: "GET",
            }),

            providesTags: ["Auth"],
        }),



    }),
});

export const {
    useLoginMutation,
    useLogoutUserMutation,
    useProfileQuery,
    useStartNewSessionForUserMutation,
    useUpdateUserSessionOnSiteChangeMutation
} = authApi;