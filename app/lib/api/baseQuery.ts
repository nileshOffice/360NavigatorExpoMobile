import {
  BaseQueryFn,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

import type {
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

import { BASE_URL } from "../config/apiConfig";
import { cryptoService } from "../services/crypto/cryptoService";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,

  prepareHeaders: async (headers) => {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    return headers;
  },
});

export const baseQueryWithInterceptor:BaseQueryFn<string | FetchArgs,unknown,FetchBaseQueryError> = async (
    args,
    api,
    extraOptions
  ) => {

    const url =
      typeof args === "string"
        ? args
        : args.url;

    const isBootstrapRequest =
      url.includes("loadApplicationData");

    // Encrypted responses are ciphertext, so bypass JSON response parsing.
    let modifiedArgs: string | FetchArgs =
      !isBootstrapRequest && cryptoService.isConfigured()
        ? typeof args === "string"
          ? { url: args, responseHandler: "text" }
          : { ...args, responseHandler: "text" }
        : args;
    if (
      !isBootstrapRequest &&
      typeof args !== "string" &&
      args.body !== undefined &&
      cryptoService.isConfigured()
    ) {
      const encryptedBody =
        cryptoService.encryptPayloadsUsingAES256(args.body);
      modifiedArgs = {
        ...args,
        body: encryptedBody,
        responseHandler: "text",
        headers: {
          ...(args.headers as Record<string, string> | undefined),
          "Content-Type": "text/plain",
        },
      };
    }

    const result = await rawBaseQuery(
      modifiedArgs,
      api,
      extraOptions
    );

    const canDecrypt =
      !isBootstrapRequest &&
      cryptoService.isConfigured();

    // ----------------------------------
    // SUCCESS RESPONSE DECRYPTION
    // ----------------------------------

    if (
      canDecrypt &&
      typeof result.data === "string"
    ) {
      try {
        const decrypted =cryptoService.decryptAPIResponseUsingAES256(result.data);
        return {
          ...result,
          data: decrypted,
        };

      } catch (error) {
        return result;
      }
    }

    // ----------------------------------
    // 401
    // ----------------------------------
    if (result.error?.status === 401) {
     
      // Refresh token will go here later.
    }

    // ----------------------------------
    // ERROR RESPONSE
    // ----------------------------------

    if (
      canDecrypt &&
      result.error &&
      typeof result.error.data === "string"
    ) {

      try {

        const decryptedError =
          cryptoService.decryptAPIResponseUsingAES256(result.error.data);

    

        return {
          ...result,

          error: {
            ...result.error,
            data: decryptedError,
          },
        };

      } catch (error) {

        console.error(
          "[baseQuery] Error response decryption failed:",
          error
        );

        return result;
      }
    }

    return result;
  };