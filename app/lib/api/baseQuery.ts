import type { FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { BaseQueryFn, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { handleApiError } from "@/app/common/api/apiErrorHandler";
import type { RootState } from "@/app/lib/store/store";
import { BASE_URL } from "../config/apiConfig";
import { cryptoService } from "../services/crypto/cryptoService";

// =========================================================
// CONFIGURATION
// =========================================================

const REFRESH_TOKEN_URL = "/api/token/refreshAccessToken";
const BOOTSTRAP_URL = "/api/token/loadApplicationData";

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

const EXCLUDE_ENCRYPTION_URLS = [
  "/sso/",
  "/api/token/check-sso-status",
  "/api/auth/sso-resolve-user",
  "/api/auth/sso-revoke-session",
];

const EXCLUDE_POST_ENCRYPTION_URLS = ["/run-matching"];

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
  // FORM DATA ENCRYPTION
  // -------------------------------------------------------

  // FORM DATA ENCRYPTION
  type ReactNativeFormData = FormData & {
    _parts?: Array<[string, any]>;
  };

  const encryptMultipartFormData = (formData: FormData): FormData => {
    debugger;
    const rnFormData = formData as ReactNativeFormData;
    const parts = rnFormData._parts;

    if (!Array.isArray(parts)) {
      throw new Error(
        "Unsupported React Native FormData implementation: _parts not available",
      );
    }

    // Prevent encrypting metadata again during a 401 retry.
    const existingMetadata = parts.some(([key]) => key === "metadata");

    if (existingMetadata) {
      return formData;
    }

    const companyCode = parts.find(([key]) => key === "companyCode")?.[1];

    const folderType = parts.find(([key]) => key === "folderType")?.[1];

    const objectId = parts.find(([key]) => key === "objectId")?.[1];

    if (companyCode == null || folderType == null || objectId == null) {
      throw new Error(
        "Missing required upload metadata: companyCode, folderType or objectId",
      );
    }

    const encryptedMetadata = cryptoService.encryptPayloadsUsingAES256({
      companyCode,
      folderType,
      objectId: objectId?.toString() ?? "",
    });

    // Remove only metadata fields.
    // Original file objects remain untouched.
    rnFormData._parts = parts.filter(
      ([key]) => !["companyCode", "folderType", "objectId"].includes(key),
    );

    // Append encrypted metadata.
    rnFormData._parts.push(["metadata", encryptedMetadata]);

    return formData;
  };

  if (isMultipart && method === "POST") {
    if (url.includes("/api/objectImage/uploadFilesToRootFolder")) {
      modifiedArgs.body = encryptMultipartFormData(
        modifiedArgs.body as FormData,
      );
    }

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
    debugger;
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
        console.error(
          "[Interceptor] Token refresh failed:",
          decryptedRefreshResult.error,
        );

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

      const updatedUser = {
        ...currentUser,
        accessToken: newAccessToken,
      };

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

  const shouldTrackLoader = !matchesUrl(url, EXCLUDE_LOADER_URLS);

  // -------------------------------------------------------
  // START LOADER
  // -------------------------------------------------------

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
      console.log("========== API RESPONSE DEBUG ==========");

      console.log("URL:", url);

      console.log("Status:", result.meta?.response?.status);

      console.log("Response type:", typeof result.data);

      console.log("Response data:", result.data);

      console.log("Error data:", result.error?.data);

      console.log("========================================");
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

          // FormData was already transformed in place.
          // The metadata guard prevents double encryption on retry.

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

      handleApiError(result.error, api.dispatch);
    }

    // -----------------------------------------------------
    // RETURN RESULT
    // -----------------------------------------------------

    return result;
  } finally {
    // -----------------------------------------------------
    // STOP LOADER
    // -----------------------------------------------------

    if (shouldTrackLoader) {
      api.dispatch({
        type: "apiLoader/requestFinished",
      });
    }
  }
};
