import { api as baseApi } from "@/app/lib/api/baseApi";
import {
    LoginRequest,
    LoginResponse,
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
        

        logout: builder.mutation<void, void>({

            query: () => ({
                url: "/logout",
                method: "POST",
            }),

        }),

        startNewSessionForUser: builder.mutation<LoginResponse, { id1: string; id2: string }>({

            query: (body) => ({
                url: `/api/token/startNewSessionForUser`,
                method: "POST",
                body,
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
    useLogoutMutation,
    useProfileQuery,
    useStartNewSessionForUserMutation,
} = authApi;