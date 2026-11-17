export type LoginFormValues = {
  userName: string;
  accessCode: string;
  password: string;
};

type LoginMutationError = {
  status?: number | string;
  error?: string;
  data?: unknown;
};

const getServerMessage = (data: unknown): string | null => {
  if (typeof data === 'string' && data.trim()) {
    try {
      return getServerMessage(JSON.parse(data));
    } catch {
      return data;
    }
  }

  if (data && typeof data === 'object') {
    const response = data as Record<string, unknown>;
    const message = response.message ?? response.detail ?? response.error;
    return typeof message === 'string' && message.trim() ? message : null;
  }

  return null;
};

export const getLoginValidationMessage = ({
  accessCode,
  userName,
  password,
}: LoginFormValues): string | null => {
  if (!accessCode.trim() && !userName.trim() && !password) {
    return 'Enter your access code, user name, and password.';
  }

  if (!accessCode.trim()) {
    return 'Enter your access code.';
  }

  if (!userName.trim()) {
    return 'Enter your user name.';
  }

  if (!password) {
    return 'Enter your password.';
  }

  return null;
};

export const getLoginErrorMessage = (error: unknown): string => {
  const mutationError = error as LoginMutationError;
  const serverMessage = getServerMessage(mutationError.data);
  const status = mutationError.status;
  const statusMessages: Record<number, string> = {
    400: 'Please check your access code, user name, and password.',
    401: 'Your user name or password is incorrect.',
    403: 'You do not have permission to sign in.',
    404: 'The login service is currently unavailable.',
    408: 'The login request timed out. Please try again.',
    429: 'Too many login attempts. Please wait and try again.',
  };

  if (serverMessage) {
    return serverMessage;
  }

  if (typeof status === 'number' && status >= 500) {
    return 'The server is unavailable. Please try again shortly.';
  }

  if (typeof status === 'number') {
    return statusMessages[status] || 'Unable to sign in. Please try again.';
  }

  if (status === 'FETCH_ERROR' || mutationError.error === 'FETCH_ERROR') {
    return 'Unable to connect. Check your internet connection and try again.';
  }

  return 'Unable to sign in. Please try again.';
};
