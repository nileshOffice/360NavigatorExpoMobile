import {
  BaseQueryFn,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

import type {
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

import type { RootState } from "@/app/lib/store/store";

import { setSessionExpired } from "@/app/auth/authSlice";
import { BASE_URL } from "../config/apiConfig";
import { cryptoService } from "../services/crypto/cryptoService";

/**
 * ---------------------------------------------------------
 * RAW BASE QUERY
 * ---------------------------------------------------------
 *
 * This is responsible for:
 * - BASE_URL
 * - Authorization token
 * - Angular/session headers
 * - Common headers
 *
 * Encryption/decryption is handled below in
 * baseQueryWithInterceptor.
 */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,

  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;

    const currentUser = state.auth.currentUser;

    // -----------------------------------------------------
    // COMMON HEADERS
    // -----------------------------------------------------

    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    // -----------------------------------------------------
    // AUTHORIZATION TOKEN
    // -----------------------------------------------------

    if (currentUser?.accessToken) {
      headers.set(
        "Authorization",
        `Bearer ${currentUser.accessToken}`
      );
    }

    // -----------------------------------------------------
    // ANGULAR / SESSION HEADERS
    // -----------------------------------------------------

    if (currentUser?.domainName) {
      headers.set(
        "DomainName",
        currentUser.domainName
      );
    }

    if (currentUser?.accessCode) {
      headers.set(
        "AccessCode",
        currentUser.accessCode
      );
    }

    if (currentUser?.sessionToken) {
      headers.set(
        "X-Session-Token",
        currentUser.sessionToken
      );
    }

    if (currentUser?.sessionId !== undefined) {
      headers.set(
        "X-Session-Id",
        currentUser.sessionId.toString()
      );
    }

    if (currentUser?.azureApiKey) {
      headers.set(
        "x-api-key",
        currentUser.azureApiKey
      );
    }

    // -----------------------------------------------------
    // CACHE
    // -----------------------------------------------------

    headers.set(
      "Cache-Control",
      "no-cache"
    );

    headers.set(
      "Pragma",
      "no-cache"
    );

    return headers;
  },
});

/**
 * ---------------------------------------------------------
 * BASE QUERY WITH ENCRYPTION / DECRYPTION
 * ---------------------------------------------------------
 */
export const baseQueryWithInterceptor: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (
  args,
  api,
  extraOptions
) => {
  // -------------------------------------------------------
  // REQUEST URL
  // -------------------------------------------------------

  const url =
    typeof args === "string"
      ? args
      : args.url;

  // -------------------------------------------------------
  // BOOTSTRAP REQUEST
  // -------------------------------------------------------

  const isBootstrapRequest =
    url.includes("loadApplicationData");

  // -------------------------------------------------------
  // CRYPTO CONFIGURATION
  // -------------------------------------------------------

  const encryptionEnabled =
    !isBootstrapRequest &&
    cryptoService.isConfigured();

  // -------------------------------------------------------
  // CREATE REQUEST
  // -------------------------------------------------------

  let modifiedArgs: string | FetchArgs = args;

  // -------------------------------------------------------
  // ENCRYPT REQUEST BODY
  // -------------------------------------------------------

  if (
    encryptionEnabled &&
    typeof modifiedArgs !== "string" &&
    modifiedArgs.body !== undefined
  ) {
    try {
      const encryptedBody =
        cryptoService.encryptPayloadsUsingAES256(
          modifiedArgs.body
        );

      modifiedArgs = {
        ...modifiedArgs,

        // IMPORTANT:
        // Send encrypted value directly.
        body: encryptedBody,

        // Backend returns encrypted response as text
        responseHandler: "text",

        headers: {
          ...(modifiedArgs.headers as Record<
            string,
            string
          >),

          // Encrypted payload is a string
          "Content-Type": "text/plain",
        },
      };
    } catch (error) {
      console.error(
        "[baseQuery] Request encryption failed:",
        error
      );

      return {
        error: {
          status: "CUSTOM_ERROR",
          error: "Request encryption failed",
          data: error,
        },
      };
    }
  }

  // -------------------------------------------------------
  // ENCRYPT GET QUERY PARAMS
  // -------------------------------------------------------

  if (
    encryptionEnabled &&
    typeof modifiedArgs !== "string" &&
    modifiedArgs.method === "GET" &&
    modifiedArgs.params
  ) {
    try {
      const params = new URLSearchParams(
        modifiedArgs.params as Record<string, string>
      );

      const queryString = params.toString();

      if (queryString) {
        const encryptedQuery =
          cryptoService.encryptPayloadsUsingAES256(
            queryString
          );

        modifiedArgs = {
          ...modifiedArgs,

          params: {
            data: encryptedQuery,
          },
        };
      }
    } catch (error) {
      // console.error(
      //   "[baseQuery] Query encryption failed:",
      //   error
      // );
    }
  }

  // -------------------------------------------------------
  // SEND REQUEST
  // -------------------------------------------------------

  const result = await rawBaseQuery(
    modifiedArgs,
    api,
    extraOptions
  );

  // -------------------------------------------------------
  // 401
  // -------------------------------------------------------

  if (result.error?.status === 401) {
   
      const state = api.getState() as RootState;
     if (!state.auth.sessionExpired) {
    api.dispatch(setSessionExpired(true));
  }

  return result;



    // Refresh token logic can be added here later.
  }

  // -------------------------------------------------------
  // DECRYPT SUCCESS RESPONSE
  // -------------------------------------------------------

  if (
    encryptionEnabled &&
    typeof result.data === "string"
  ) {
    try {
      const decrypted =
        cryptoService.decryptAPIResponseUsingAES256(
          result.data
        );

      return {
        ...result,
        data: decrypted,
      };
    } catch (error) {
   

      return result;
    }
  }

  // -------------------------------------------------------
  // DECRYPT ERROR RESPONSE
  // -------------------------------------------------------

  if (
    encryptionEnabled &&
    result.error &&
    typeof result.error.data === "string" &&
    result.error.data.trim() !== ""
  ) {
    try {
      const decryptedError =
        cryptoService.decryptAPIResponseUsingAES256(
          result.error.data
        );

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

  // -------------------------------------------------------
  // RETURN
  // -------------------------------------------------------

  return result;
};