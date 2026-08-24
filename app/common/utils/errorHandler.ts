export const getErrorStatus = (error: unknown): number | undefined => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error
  ) {
    return (error as { status?: number }).status;
  }

  return undefined;
};