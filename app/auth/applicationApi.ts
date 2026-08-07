import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithInterceptor } from "../lib/api/baseQuery";
import { cryptoService } from "../lib/services/crypto/cryptoService";

export const applicationApi = createApi({
  reducerPath: "applicationApi",

  baseQuery: baseQueryWithInterceptor,

  endpoints: (builder) => ({
    loadApplicationData: builder.query<void, void>({
      query: () => ({
        url: "/api/token/loadApplicationData",
        method: "GET",
        responseHandler: "text",
      }),

      transformResponse: (response: string) => {
        console.log("[applicationApi] raw response:", response);

        // fetchBaseQuery may JSON-encode plain text responses — strip surrounding quotes
        const raw = response.trim().replace(/^"|"$/g, "");

        let decodedResponse: string;
        try {
          decodedResponse = atob(raw);
        } catch {
          return;
        }

        const parts = decodedResponse.split("|");
        const key = parts[8];
        const iv = parts[9];

        if (!key || !iv) {
          return;
        }

        cryptoService.setEncryptionConfig(key, iv);
        console.log("[applicationApi] encryption config set successfully");
      },
    }),
  }),
});

export const {
  useLazyLoadApplicationDataQuery,
} = applicationApi;