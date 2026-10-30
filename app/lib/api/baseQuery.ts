import { BaseQueryFn, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";

import type { RootState } from "@/app/lib/store/store";

import { setSessionExpired } from "@/app/auth/authSlice";

import { BASE_URL } from "../config/apiConfig";

import { cryptoService } from "../services/crypto/cryptoService";

/**
 * =========================================================
 * CONFIGURATION
 * =========================================================
 */

const REFRESH_TOKEN_URL = "/api/token/refreshAccessToken";

const BOOTSTRAP_URL = "/api/token/loadApplicationData";

/**
 * URLs excluded from loader tracking.
 *
 * These URLs are not necessarily excluded from encryption.
 */
const EXCLUDE_LOADER_URLS = [
  "/api/user/pingServer",
  "/api/openAi/matchSpareParts",
  "/api/rcm/getFailureModeCountByAssetId",
  "/api/token/refreshAccessToken",
  "/api/site/getSidebarModuleList",
  "/api/openAi/getVendorManualProgressByFileId",
  "https://tribute-ultimate-bruising.ngrok-free.dev/run-matching",
  "https://ai.360performancenavigator.com/run-matching",
];

/**
 * URLs excluded from encryption.
 */
const EXCLUDE_ENCRYPTION_URLS = [
  "/sso/",
  "/api/token/check-sso-status",
  "/api/auth/sso-resolve-user",
  "/api/auth/sso-revoke-session",
];

/**
 * URLs that should not have their POST body encrypted.
 */
const EXCLUDE_POST_ENCRYPTION_URLS = ["/run-matching"];

/**
 * Angular file upload endpoints.
 */
const FILE_UPLOAD_URLS = [
  "/api/objectImage/uploadFilesToRootFolder",
  "/api/openAi/matchSpareParts",
  "/api/openAi/extractMaintenanceTask",
];

/**
 * =========================================================
 * REFRESH TOKEN MANAGER
 * =========================================================
 *
 * Shared promise prevents multiple refresh requests.
 *
 * Example:
 * Request A -> 401
 * Request B -> 401
 * Request C -> 401
 *
 * Only one refresh request is executed.
 */

let refreshPromise: Promise<string | null> | null = null;

/**
 * =========================================================
 * URL HELPERS
 * =========================================================
 */

const getRequestUrl = (args: string | FetchArgs): string => {
  return typeof args === "string" ? args : args.url;
};

const matchesUrl = (url: string, patterns: string[]): boolean => {
  return patterns.some((pattern) => url.includes(pattern));
};

const isBootstrapRequest = (url: string) => url.includes(BOOTSTRAP_URL);

const isRefreshRequest = (url: string) => url.includes(REFRESH_TOKEN_URL);

const isMultipartRequest = (args: string | FetchArgs): boolean => {
  if (typeof args === "string") {
    return false;
  }

  return typeof FormData !== "undefined" && args.body instanceof FormData;
};

/**
 * =========================================================
 * HEADER MANAGEMENT
 * =========================================================
 */

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,

  prepareHeaders: (headers, { getState, arg }) => {
    const state = getState() as RootState;

    const currentUser = state.auth.currentUser;

    const url = getRequestUrl(arg as string | FetchArgs);

    const isBootstrap = isBootstrapRequest(url);

    const isSSORequest = matchesUrl(url, EXCLUDE_ENCRYPTION_URLS);

    /**
     * Angular skips its normal header injection
     * for bootstrap and SSO requests.
     */
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

    /**
     * Angular reads moduleId from LocalStorage.
     *
     * Adapt this lookup to your actual Redux slice
     * if moduleId is stored elsewhere.
     */
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

/**
 * =========================================================
 * FORM DATA ENCRYPTION
 * =========================================================
 *
 * Encrypt metadata only.
 * Preserve actual files.
 */

const encryptFormData = (originalFormData: FormData): FormData => {
  const newFormData = new FormData();

  const companyCode = originalFormData.get("companyCode");

  const folderType = originalFormData.get("folderType");

  const objectId = originalFormData.get("objectId")?.toString() ?? "";

  const encryptedMetadata = cryptoService.encryptPayloadsUsingAES256({
    companyCode,
    folderType,
    objectId,
  });

  newFormData.append("metadata", encryptedMetadata);

  originalFormData.forEach((value, key) => {
    if (!["companyCode", "folderType", "objectId"].includes(key)) {
      newFormData.append(key, value);
    }
  });

  return newFormData;
};

/**
 * =========================================================
 * REQUEST ENCRYPTION
 * =========================================================
 */

const prepareRequest = (args: string | FetchArgs): string | FetchArgs => {
  const url = getRequestUrl(args);

  if (typeof args === "string") {
    return args;
  }

  const isBootstrap = isBootstrapRequest(url);

  const isSSO = matchesUrl(url, EXCLUDE_ENCRYPTION_URLS);

  const isRefresh = isRefreshRequest(url);

  const isMultipart = isMultipartRequest(args);

  const skipPostEncryption = matchesUrl(url, EXCLUDE_POST_ENCRYPTION_URLS);

  /**
   * Skip encryption for:
   * - Bootstrap
   * - SSO
   * - Refresh token
   * - Unconfigured encryption
   */
  const encryptionEnabled =
    !isBootstrap && !isSSO && !isRefresh && cryptoService.isConfigured();

  if (!encryptionEnabled) {
    return args;
  }

  let modifiedArgs: FetchArgs = {
    ...args,
  };

  // -------------------------------------------------------
  // FORM DATA
  // -------------------------------------------------------

  if (isMultipart && modifiedArgs.method?.toUpperCase() === "POST") {
    modifiedArgs = {
      ...modifiedArgs,
      body: encryptFormData(modifiedArgs.body as FormData),
    };

    return modifiedArgs;
  }

  // -------------------------------------------------------
  // POST / PUT / PATCH BODY ENCRYPTION
  // -------------------------------------------------------

  const method = (modifiedArgs.method ?? "GET").toUpperCase();

  if (
    ["POST", "PUT", "PATCH"].includes(method) &&
    modifiedArgs.body !== undefined &&
    !skipPostEncryption
  ) {
    const encryptedBody = cryptoService.encryptPayloadsUsingAES256(
      modifiedArgs.body,
    );

    modifiedArgs = {
      ...modifiedArgs,

      body: encryptedBody,

      responseHandler: "text",

      headers: {
        ...(modifiedArgs.headers as Record<string, string>),

        "Content-Type": "text/plain",
      },
    };
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

      /**
       * Angular sends:
       * ?encryptedQuery
       *
       * Not:
       * ?data=encryptedQuery
       */
      const separator = url.includes("?") ? "&" : "?";

      modifiedArgs = {
        ...modifiedArgs,

        url: `${url}${separator}${encryptedQuery}`,

        params: undefined,

        responseHandler: "text",
      };
    }
  }

  return modifiedArgs;
};

/**
 * =========================================================
 * RESPONSE DECRYPTION
 * =========================================================
 */

const decryptResponse = (result: any, encryptionEnabled: boolean) => {
  if (!encryptionEnabled) {
    return result;
  }

  // -------------------------------------------------------
  // SUCCESS RESPONSE
  // -------------------------------------------------------

  if (typeof result.data === "string") {
    try {
      return {
        ...result,

        data: cryptoService.decryptAPIResponseUsingAES256(result.data),
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
      return {
        ...result,

        error: {
          ...result.error,

          data: cryptoService.decryptAPIResponseUsingAES256(result.error.data),
        },
      };
    } catch (error) {
      console.error("[Interceptor] Error response decryption failed:", error);

      return result;
    }
  }

  return result;
};

/**
 * =========================================================
 * AUTHENTICATION ERROR CLASSIFICATION
 * =========================================================
 */

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

/**
 * =========================================================
 * REFRESH TOKEN API
 * =========================================================
 */

const refreshAccessToken = async (
  api: any,
  extraOptions: any,
): Promise<string | null> => {
  /**
   * If refresh is already running,
   * return the existing promise.
   */
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const state = api.getState() as RootState;

      const currentUser = state.auth.currentUser;

      if (!currentUser || !currentUser.accessToken) {
        return null;
      }

      // ---------------------------------------------------
      // ANGULAR REFRESH PAYLOAD
      // ---------------------------------------------------

      const refreshPayload = {
        id1: currentUser.email,
        id2: currentUser.sessionToken,
        id3: currentUser.accessToken,
      };

      // ---------------------------------------------------
      // REFRESH REQUEST
      // ---------------------------------------------------

      const refreshResult = await rawBaseQuery(
        {
          url: REFRESH_TOKEN_URL,

          method: "POST",

          body: refreshPayload,

          responseHandler: "json",
        },
        api,
        extraOptions,
      );

      if (refreshResult.error) {
        console.error(
          "[Interceptor] Token refresh failed:",
          refreshResult.error,
        );

        return null;
      }

      const response: any = refreshResult.data;

      const newAccessToken =
        response?.accessToken ?? response?.data?.accessToken;

      if (!newAccessToken) {
        return null;
      }

      // ---------------------------------------------------
      // UPDATE REDUX USER
      // ---------------------------------------------------

      const updatedUser = {
        ...currentUser,
        accessToken: newAccessToken,
      };

      /**
       * IMPORTANT:
       * Your authSlice must handle this action.
       *
       * Add a reducer named updateCurrentUser,
       * or replace this action with your existing
       * user-update action.
       */
      api.dispatch({
        type: "auth/updateCurrentUser",
        payload: updatedUser,
      });

      console.log("[Interceptor] Access token refreshed successfully");

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

/**
 * =========================================================
 * MAIN BASE QUERY WITH INTERCEPTOR
 * =========================================================
 */

export const baseQueryWithInterceptor: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const url = getRequestUrl(args);

  const isBootstrap = isBootstrapRequest(url);

  const isSSO = matchesUrl(url, EXCLUDE_ENCRYPTION_URLS);

  const isRefresh = isRefreshRequest(url);

  const isMultipart = isMultipartRequest(args);

  const encryptionEnabled =
    !isBootstrap &&
    !isSSO &&
    !isRefresh &&
    !isMultipart &&
    cryptoService.isConfigured();

  const shouldTrackLoader = !matchesUrl(url, EXCLUDE_LOADER_URLS);

  /**
   * The loader counter is tracked here.
   *
   * Connect these events to your loader slice
   * if you want the Angular global-loader behaviour.
   */
  if (shouldTrackLoader) {
    api.dispatch({
      type: "apiLoader/requestStarted",
    });
  }

  try {
    // -----------------------------------------------------
    // PREPARE REQUEST
    // -----------------------------------------------------

    let modifiedArgs: string | FetchArgs;

    try {
      modifiedArgs = prepareRequest(args);
    } catch (error) {
      console.error("[Interceptor] Request encryption failed:", error);

      return {
        error: {
          status: "CUSTOM_ERROR",
          error: "Request encryption failed",
          data: error,
        },
      };
    }

    // -----------------------------------------------------
    // SEND REQUEST
    // -----------------------------------------------------

    let result = await rawBaseQuery(modifiedArgs, api, extraOptions);

    // -----------------------------------------------------
    // DECRYPT RESPONSE
    // -----------------------------------------------------

    result = decryptResponse(result, encryptionEnabled);

    // -----------------------------------------------------
    // 401 TOKEN REFRESH
    // -----------------------------------------------------

    if (result.error?.status === 401 && !isRefresh && !isBootstrap && !isSSO) {
      const authErrorCode = getAuthErrorCode(result.error.data);

      console.log("[Interceptor] 401:", authErrorCode);

      /**
       * Angular refreshes only when the error body
       * is null and the user is logged in.
       *
       * Known authentication errors should not
       * trigger a token refresh.
       */
      const knownAuthError =
        authErrorCode !== null &&
        Object.keys(AUTH_ERROR_MESSAGES).includes(authErrorCode);

      const state = api.getState() as RootState;

      const currentUser = state.auth.currentUser;

      const shouldRefresh =
        currentUser?.accessToken &&
        !knownAuthError &&
        result.error.data == null;

      if (shouldRefresh) {
        // -----------------------------------------------
        // SINGLE REFRESH
        // -----------------------------------------------

        const newToken = await refreshAccessToken(api, extraOptions);

        if (newToken) {
          /**
           * Retry the original, unencrypted request.
           *
           * This is important because prepareRequest
           * must encrypt the body only once.
           */
          const retryArgs = prepareRequest(args);

          const retryResult = await rawBaseQuery(retryArgs, api, extraOptions);

          const decryptedRetryResult = decryptResponse(
            retryResult,
            encryptionEnabled,
          );

          // ---------------------------------------------
          // RETRY FAILED AGAIN
          // ---------------------------------------------

          if (decryptedRetryResult.error?.status === 401) {
            api.dispatch(setSessionExpired(true));
          }

          return decryptedRetryResult;
        }

        // -----------------------------------------------
        // REFRESH FAILED
        // -----------------------------------------------

        api.dispatch(setSessionExpired(true));

        return result;
      }

      // ---------------------------------------------------
      // HANDLE AUTHENTICATION ERRORS
      // ---------------------------------------------------

      if (
        authErrorCode === "SessionExpired" ||
        authErrorCode === "ConcurrentLogin" ||
        authErrorCode === "RoleChanged"
      ) {
        if (!state.auth.sessionExpired) {
          api.dispatch(setSessionExpired(true));
        }
      }
    }

    // -----------------------------------------------------
    // OTHER HTTP ERRORS
    // -----------------------------------------------------

    if (result.error) {
      const status = result.error.status;

      switch (status) {
        case 400:
          console.error("[API] Bad Request", result.error.data);
          break;

        case 403:
          console.error("[API] Access Denied", result.error.data);
          break;

        case 429:
          console.error("[API] Too Many Requests", result.error.data);
          break;

        case 500:
          console.error("[API] Internal Server Error", result.error.data);
          break;

        default:
          break;
      }
    }

    // -----------------------------------------------------
    // RETURN
    // -----------------------------------------------------

    return result;
  } finally {
    // -----------------------------------------------------
    // LOADER CLEANUP
    // -----------------------------------------------------

    if (shouldTrackLoader) {
      api.dispatch({
        type: "apiLoader/requestFinished",
      });
    }
  }
};
