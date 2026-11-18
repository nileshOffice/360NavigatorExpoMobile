import type { FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { BaseQueryFn, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { updateCurrentUser } from "@/src/auth/authSlice";
import { handleApiError } from "@/src/common/api/apiErrorHandler";
import { BASE_URL } from "@/src/lib/config/apiConfig";
import { cryptoService } from "@/src/lib/services/crypto/cryptoService";
import type { RootState } from "@/src/lib/store/store";

// =========================================================
// CONFIGURATION
// =========================================================

const REFRESH_TOKEN_URL = "/api/token/refreshAccessToken";
const BOOTSTRAP_URL = "/api/token/loadApplicationData";

const EXCLUDE_ENCRYPTION_URLS = [
  "/sso/",
  "/api/token/check-sso-status",
  "/api/auth/sso-resolve-user",
  "/api/auth/sso-revoke-session",
];

const EXCLUDE_POST_ENCRYPTION_URLS = ["/run-matching"];

// Background calls: a network/server hiccup here must not pop a blocking
// alert every few minutes. Auth errors (e.g. ConcurrentLogin) still show.
const SILENT_ERROR_URLS = ["/api/user/pingServer", BOOTSTRAP_URL];

const isTransientError = (status: FetchBaseQueryError["status"]): boolean =>
  status === "FETCH_ERROR" ||
  status === "TIMEOUT_ERROR" ||
  (typeof status === "number" && status >= 500);

// =========================================================
// REFRESH TOKEN MANAGER
// =========================================================

let refreshPromise: Promise<string | null> | null = null;

// =========================================================
// URL HELPERS
// =========================================================

const getRequestUrl = (args: string | FetchArgs): string => {
  return typeof args === "string" ? args : args.url;
};

const matchesUrl = (url: string, patterns: string[]): boolean => {
  return patterns.some((pattern) => url.includes(pattern));
};

const isBootstrapRequest = (url: string): boolean =>
  url.includes(BOOTSTRAP_URL);

const isRefreshRequest = (url: string): boolean =>
  url.includes(REFRESH_TOKEN_URL);

const isMultipartRequest = (args: string | FetchArgs): boolean => {
  if (typeof args === "string") {
    return false;
  }

  return typeof FormData !== "undefined" && args.body instanceof FormData;
};

// =========================================================
// BASE QUERY
// =========================================================

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,

  prepareHeaders: (headers, { getState, arg }) => {
    const state = getState() as RootState;
    const currentUser = state.auth.currentUser;

    const url = getRequestUrl(arg as string | FetchArgs);

    const isBootstrap = isBootstrapRequest(url);
    const isSSORequest = matchesUrl(url, EXCLUDE_ENCRYPTION_URLS);

    // Angular skips common headers for these requests.
    if (isBootstrap || isSSORequest) {
      return headers;
    }

    // -----------------------------------------------------
    // COMMON HEADERS
    // -----------------------------------------------------

    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }

    const isMultipart = isMultipartRequest(arg as string | FetchArgs);

    if (isMultipart) {
      headers.delete("Content-Type");
    } else if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    // -----------------------------------------------------
    // AUTHORIZATION
    // -----------------------------------------------------

    if (currentUser?.accessToken) {
      headers.set("Authorization", `Bearer ${currentUser.accessToken}`);
    }

    // -----------------------------------------------------
    // SESSION HEADERS
    // -----------------------------------------------------

    if (currentUser?.domainName) {
      headers.set("DomainName", currentUser.domainName);
    }

    if (currentUser?.accessCode) {
      headers.set("AccessCode", currentUser.accessCode);
    }

    if (currentUser?.sessionToken) {
      headers.set("X-Session-Token", currentUser.sessionToken);
    }

    if (currentUser?.sessionId !== undefined) {
      headers.set("X-Session-Id", currentUser.sessionId.toString());
    }

    if (currentUser?.azureApiKey) {
      headers.set("x-api-key", currentUser.azureApiKey);
    }

    // -----------------------------------------------------
    // MODULE / SITE / COMPANY HEADERS
    // -----------------------------------------------------

    const moduleId =
      (state as any).application?.moduleId ??
      (state as any).common?.moduleId ??
      0;

    headers.set("X-Module-Id", String(moduleId));

    if (currentUser?.siteName) {
      headers.set("X-Site-Name", currentUser.siteName);
    }

    if (currentUser?.companyName) {
      headers.set("X-Company-Name", currentUser.companyName);
    }

    // -----------------------------------------------------
    // CACHE
    // -----------------------------------------------------

    headers.set("Cache-Control", "no-cache");
    headers.set("Pragma", "no-cache");

    return headers;
  },
});

// =========================================================
// REQUEST ENCRYPTION
// =========================================================

const prepareRequest = (args: string | FetchArgs): string | FetchArgs => {
  const url = getRequestUrl(args);

  const isBootstrap = isBootstrapRequest(url);

  const isSSO = matchesUrl(url, EXCLUDE_ENCRYPTION_URLS);

  // Refresh is intentionally NOT excluded.
  // Angular encrypts refresh requests as well.
  const encryptionEnabled =
    !isBootstrap && !isSSO && cryptoService.isConfigured();

  if (!encryptionEnabled) {
    return args;
  }

  // Support both string URL and FetchArgs.
  let modifiedArgs: FetchArgs =
    typeof args === "string" ? { url: args } : { ...args };

  const isMultipart = isMultipartRequest(args);

  const skipPostEncryption = matchesUrl(url, EXCLUDE_POST_ENCRYPTION_URLS);

  const method = (modifiedArgs.method ?? "GET").toUpperCase();

  // -------------------------------------------------------
  // RESPONSE HANDLER
  // -------------------------------------------------------

  // Read encrypted responses as text.
  // Important for GET requests without query parameters too.
  modifiedArgs.responseHandler = "text";

  // -------------------------------------------------------
  // FORM DATA
  // -------------------------------------------------------
  // Multipart bodies are sent as-is. Upload metadata is encrypted when the
  // FormData is built (see uploadFilesToRootFolder.ts): mutating a FormData
  // that is already stored in RTK Query state breaks Redux's immutability
  // check and depended on React Native's private `_parts` field.

  if (isMultipart) {
    return modifiedArgs;
  }
  // -------------------------------------------------------
  // POST / PUT / PATCH BODY ENCRYPTION
  // -------------------------------------------------------

  if (
    ["POST", "PUT", "PATCH"].includes(method) &&
    modifiedArgs.body !== undefined &&
    !skipPostEncryption
  ) {
    modifiedArgs.body = cryptoService.encryptPayloadsUsingAES256(
      modifiedArgs.body,
    );

    // Angular sends application/json for encrypted bodies.
    // Do not change this to text/plain.
  }

  // -------------------------------------------------------
  // GET QUERY PARAMETER ENCRYPTION
  // -------------------------------------------------------

  if (method === "GET" && modifiedArgs.params) {
    const params = new URLSearchParams();

    Object.entries(
      modifiedArgs.params as Record<string, string | number | boolean>,
    ).forEach(([key, value]) => {
      params.append(key, String(value));
    });

    const queryString = params.toString();

    if (queryString) {
      const encryptedQuery =
        cryptoService.encryptPayloadsUsingAES256(queryString);

      // Angular format:
      // ?encryptedQuery
      // NOT ?data=encryptedQuery

      const separator = url.includes("?") ? "&" : "?";

      modifiedArgs = {
        ...modifiedArgs,
        url: `${url}${separator}${encryptedQuery}`,
        params: undefined,
      };
    }
  }

  return modifiedArgs;
};

// =========================================================
// RESPONSE DECRYPTION
// =========================================================

const decryptResponse = async (
  result: any,
  encryptionEnabled: boolean,
): Promise<any> => {
  if (!encryptionEnabled) {
    return result;
  }

  // -------------------------------------------------------
  // SUCCESS RESPONSE
  // -------------------------------------------------------

  if (typeof result.data === "string" && result.data.trim() !== "") {
    try {
      const decryptedData = await cryptoService.decryptAPIResponseUsingAES256(
        result.data,
      );

      return {
        ...result,
        data: decryptedData,
      };
    } catch (error) {
      console.error("[Interceptor] Success response decryption failed:", error);

      return result;
    }
  }

  // -------------------------------------------------------
  // ERROR RESPONSE
  // -------------------------------------------------------

  if (
    result.error &&
    typeof result.error.data === "string" &&
    result.error.data.trim() !== ""
  ) {
    try {
      const decryptedError = await cryptoService.decryptAPIResponseUsingAES256(
        result.error.data,
      );

      return {
        ...result,
        error: {
          ...result.error,
          data: decryptedError,
        },
      };
    } catch (error) {
      console.error("[Interceptor] Error response decryption failed:", error);

      return result;
    }
  }

  return result;
};

// =========================================================
// AUTHENTICATION ERROR CLASSIFICATION
// =========================================================

const getAuthErrorCode = (errorData: any): string | null => {
  if (!errorData) {
    return null;
  }

  if (typeof errorData === "string") {
    try {
      const parsed = JSON.parse(errorData);

      return parsed?.message ?? null;
    } catch {
      return null;
    }
  }

  return errorData?.message ?? errorData?.error?.message ?? null;
};

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  InvalidCredentials: "The access code, username, or password is incorrect.",

  LockedAccount:
    "Your account has been locked due to multiple failed attempts.",

  LicenceExpired: "Your licence has expired.",

  ConcurrentLogin: "Your account was logged in from another device.",

  SessionExpired: "Your session has timed out.",

  RoleChanged: "Your role has been changed. Please log in again.",

  TokenExpired: "Your access link has expired.",

  InvalidToken: "Your access link is no longer valid.",
};

// =========================================================
// REFRESH TOKEN API
// =========================================================

const refreshAccessToken = async (
  api: any,
  extraOptions: any,
): Promise<string | null> => {
  // Reuse existing refresh request.
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const state = api.getState() as RootState;

      const currentUser = state.auth.currentUser;

      if (!currentUser?.accessToken) {
        return null;
      }

      // ---------------------------------------------------
      // REFRESH PAYLOAD - SAME AS ANGULAR
      // ---------------------------------------------------

      const refreshPayload = {
        id1: currentUser.email,
        id2: currentUser.sessionToken,
        id3: currentUser.accessToken,
      };

      // ---------------------------------------------------
      // ENCRYPT REFRESH REQUEST
      // ---------------------------------------------------

      const refreshArgs = prepareRequest({
        url: REFRESH_TOKEN_URL,
        method: "POST",
        body: refreshPayload,
      });

      // ---------------------------------------------------
      // SEND REFRESH REQUEST
      // ---------------------------------------------------

      const refreshResult = await rawBaseQuery(refreshArgs, api, extraOptions);

      // ---------------------------------------------------
      // DECRYPT REFRESH RESPONSE
      // ---------------------------------------------------

      const decryptedRefreshResult = await decryptResponse(
        refreshResult,
        cryptoService.isConfigured(),
      );

      if (decryptedRefreshResult.error) {
        // Expected when the session has expired: the caller shows the
        // "Session Expired" alert and logs out. console.error raised the
        // red LogBox screen in dev; also only the status is logged, as the
        // error body may contain token data.
        if (__DEV__) {
          console.warn(
            "[Interceptor] Token refresh failed:",
            decryptedRefreshResult.error.status,
          );
        }

        return null;
      }

      const response: any = decryptedRefreshResult.data;

      const newAccessToken =
        response?.accessToken ?? response?.data?.accessToken;

      if (!newAccessToken) {
        console.error("[Interceptor] Refresh response has no accessToken");

        return null;
      }

      // ---------------------------------------------------
      // UPDATE REDUX USER
      // ---------------------------------------------------

      // Previously dispatched a non-existent action, so the new token was
      // never stored and every retry went out with the expired token.
      api.dispatch(updateCurrentUser({ accessToken: newAccessToken }));

      return newAccessToken;
    } catch (error) {
      console.error("[Interceptor] Refresh token exception:", error);

      return null;
    }
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};

// =========================================================
// MAIN BASE QUERY WITH INTERCEPTOR
// =========================================================

export const baseQueryWithInterceptor: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const url = getRequestUrl(args);

  const isBootstrap = isBootstrapRequest(url);

  const isSSO = matchesUrl(url, EXCLUDE_ENCRYPTION_URLS);

  const isRefresh = isRefreshRequest(url);

  const encryptionEnabled =
    !isBootstrap && !isSSO && cryptoService.isConfigured();

  try {
    // -----------------------------------------------------
    // PREPARE REQUEST
    // -----------------------------------------------------

    let modifiedArgs: string | FetchArgs;

    try {
      modifiedArgs = prepareRequest(args);
    } catch (error) {
      console.error("[Interceptor] Request encryption failed:", error);

      const requestError: FetchBaseQueryError = {
        status: "CUSTOM_ERROR",
        error: "Request encryption failed",
        data: error,
      };

      handleApiError(requestError, api.dispatch);

      return {
        error: requestError,
      };
    }

    // -----------------------------------------------------
    // SEND REQUEST
    // -----------------------------------------------------

    let result = await rawBaseQuery(modifiedArgs, api, extraOptions);

    // -----------------------------------------------------
    // DECRYPT RESPONSE
    // -----------------------------------------------------

    result = await decryptResponse(result, encryptionEnabled);

    // -----------------------------------------------------
    // DEVELOPMENT LOGS
    // -----------------------------------------------------

    if (__DEV__) {
      // Never log response bodies: they contain tokens and user data.
      console.log(
        `[API] ${url} -> ${result.meta?.response?.status ?? result.error?.status}`,
      );
    }

    // -----------------------------------------------------
    // 401 TOKEN REFRESH
    // -----------------------------------------------------

    if (result.error?.status === 401 && !isRefresh && !isBootstrap && !isSSO) {
      const authErrorCode = getAuthErrorCode(result.error.data);

      console.log("[Interceptor] 401:", authErrorCode);

      // Known authentication errors should not refresh.
      const knownAuthError =
        authErrorCode !== null &&
        Object.keys(AUTH_ERROR_MESSAGES).includes(authErrorCode);

      const state = api.getState() as RootState;

      const currentUser = state.auth.currentUser;

      // fetchBaseQuery with responseHandler: "text"
      // may return an empty string instead of null.
      const isEmptyErrorBody =
        result.error.data == null || result.error.data === "";

      const shouldRefresh =
        !!currentUser?.accessToken && !knownAuthError && isEmptyErrorBody;

      if (shouldRefresh) {
        // -----------------------------------------------
        // REFRESH ACCESS TOKEN
        // -----------------------------------------------

        const newToken = await refreshAccessToken(api, extraOptions);

        if (newToken) {
          // ---------------------------------------------
          // RETRY ORIGINAL REQUEST
          // ---------------------------------------------

          // FormData bodies are reused unchanged on retry.

          const retryArgs = prepareRequest(args);

          const retryResult = await rawBaseQuery(retryArgs, api, extraOptions);

          const decryptedRetryResult = await decryptResponse(
            retryResult,
            encryptionEnabled,
          );

          if (decryptedRetryResult.error) {
            handleApiError(decryptedRetryResult.error, api.dispatch);
          }

          return decryptedRetryResult;
        }

        // -----------------------------------------------
        // REFRESH FAILED
        // -----------------------------------------------

        handleApiError(result.error, api.dispatch);

        return result;
      }
    }

    // -----------------------------------------------------
    // OTHER HTTP ERRORS
    // -----------------------------------------------------

    if (result.error) {
      const silent =
        matchesUrl(url, SILENT_ERROR_URLS) &&
        isTransientError(result.error.status);

      if (!silent) {
        handleApiError(result.error, api.dispatch);
      }
    }

    // -----------------------------------------------------
    // RETURN RESULT
    // -----------------------------------------------------

    return result;
  } catch (error) {
    // Unexpected failure (e.g. decryption threw): surface it as a normal
    // RTK Query error instead of an unhandled promise rejection.
    const unexpectedError: FetchBaseQueryError = {
      status: "CUSTOM_ERROR",
      error: error instanceof Error ? error.message : "Unexpected error",
    };

    handleApiError(unexpectedError, api.dispatch);
    return { error: unexpectedError };
  }
};
