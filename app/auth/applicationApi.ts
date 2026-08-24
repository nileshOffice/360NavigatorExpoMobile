import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithInterceptor } from "../lib/api/baseQuery";
import { cryptoService } from "../lib/services/crypto/cryptoService";

export const applicationApi = createApi({
  reducerPath: "applicationApi",

  baseQuery: baseQueryWithInterceptor,

  endpoints: (builder) => ({
    loadApplicationData: builder.query<string, void>({
      query: () => ({
        url: "/api/token/loadApplicationData",
        method: "GET",
        responseHandler: "text",
      }),


     

      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          console.log(
            "[loadApplicationData] Response received"
          );

          cryptoService.configureFromApplicationData(data);

          console.log(
            "[loadApplicationData] Crypto configured:",
            cryptoService.isConfigured()
          );

        } catch (error) {
          console.error(
            "[loadApplicationData] Failed:",
            error
          );
        }
      },
    }),

    
    pingServer: builder.mutation<unknown,{ id21: string | number; id22: number;id23: number;}>({
      query: (body) => ({
        url: '/api/user/pingServer',
        method: 'POST',
        body,
      }),
    }),


  }),
});

export const {
  useLazyLoadApplicationDataQuery,
  usePingServerMutation
} = applicationApi;