import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { AppDispatch } from "@/src/lib/store/store";
import type { ApiAlert } from "@/src/common/hooks/apiErrorSlice";
import { showApiAlert } from "@/src/common/hooks/apiErrorSlice";

const AUTH_MESSAGES: Record<
  string,
  {
    title: string;
    message: string;
    type: "error" | "warning";
    action?: "logout";
  }
> = {
  InvalidCredentials: {
    title: "Invalid Credentials!",
    message:
      "The access code, username, or password is incorrect. Please try again.",
    type: "error",
  },

  LockedAccount: {
    title: "Account Locked!",
    message: "Your account has been locked due to multiple failed attempts.",
    type: "error",
  },

  LicenceExpired: {
    title: "Licence Expired!",
    message: "Your licence has expired.",
    type: "error",
  },

  ConcurrentLogin: {
    title: "Concurrent Login Detected!",
    message:
      "Your account was logged in from another device or browser. For security reasons, your current session has ended.",
    type: "error",
    action: "logout",
  },

  SessionExpired: {
    title: "Session Expired!",
    message: "Your session has timed out.",
    type: "error",
    action: "logout",
  },

  RoleChanged: {
    title: "Role Changed!",
    message: "Your role has been changed. Please log in again to continue.",
    type: "warning",
    action: "logout",
  },

  TokenExpired: {
    title: "Access Link Expired",
    message:
      "For security reasons, this link is no longer valid. Please request a new link or sign in again.",
    type: "error",
  },

  InvalidToken: {
    title: "Access Link Expired",
    message:
      "For security reasons, this link is no longer valid. Please request a new link or sign in again.",
    type: "error",
  },
};

const getErrorMessage = (data: unknown): string | null => {
  if (!data) return null;

  if (typeof data === "string") {
    const rawData = data;
    try {
      data = JSON.parse(rawData);
    } catch {
      return rawData;
    }
  }

  if (typeof data !== "object" || data === null) return null;

  const body = data as {
    message?: unknown;
    error?: { message?: unknown };
    title?: unknown;
  };
  const message = body.message ?? body.error?.message ?? body.title;

  return typeof message === "string" ? message : null;
};

export const handleApiError = (
  error: FetchBaseQueryError,
  dispatch: AppDispatch,
) => {
  const status = error.status;
  const data = error.data;

  const errorCode = getErrorMessage(data);

  // ---------------------------------------------
  // AUTHENTICATION ERRORS
  // ---------------------------------------------

  if (errorCode && AUTH_MESSAGES[errorCode]) {
    const config = AUTH_MESSAGES[errorCode];

    dispatch(
      showApiAlert({
        ...config,
        confirmText: config.action === "logout" ? "Login Again" : "OK",
      }),
    );

    return;
  }

  // ---------------------------------------------
  // HTTP STATUS ERRORS
  // ---------------------------------------------

  let alert: ApiAlert | null = null;

  switch (status) {
    case 401:
      alert = {
        title: "Session Expired!",
        message: "Your session has timed out. Please log in again.",
        type: "error",
        action: "logout",
        confirmText: "Login Again",
      };
      break;

    case 400:
      alert = {
        title: "Bad Request!",
        message:
          "The server couldn't understand your request due to invalid or missing parameters.",
        type: "error" as const,
      };
      break;

    case 403:
      alert = {
        title: "Access Denied!",
        message: "You don't have permission to perform this action.",
        type: "error" as const,
      };
      break;

    case 429:
      alert = {
        title: "Too Many Requests!",
        message:
          "You have exceeded the allowed number of requests. Please try again later.",
        type: "error" as const,
      };
      break;

    case 500:
      alert = {
        title: "Internal Server Error!",
        message: "Something went wrong on the server. Please try again later.",
        type: "error" as const,
      };
      break;

    case "FETCH_ERROR":
      alert = {
        title: "Network Error!",
        message:
          "Unable to connect to the server. Please check your internet connection.",
        type: "error" as const,
      };
      break;

    case "TIMEOUT_ERROR":
      alert = {
        title: "Request Timeout!",
        message: "The server took too long to respond. Please try again.",
        type: "warning" as const,
      };
      break;

    case "PARSING_ERROR":
      alert = {
        title: "Response Error!",
        message: "Unable to process the server response.",
        type: "error" as const,
      };
      break;

    case "CUSTOM_ERROR":
      alert = {
        title: "Request Failed!",
        message: error.error || "Something went wrong.",
        type: "error" as const,
      };
      break;

    default:
      alert = {
        title: "Request Failed!",
        message: "The request could not be completed. Please try again.",
        type: "error" as const,
      };
  }

  dispatch(showApiAlert(alert));
};
