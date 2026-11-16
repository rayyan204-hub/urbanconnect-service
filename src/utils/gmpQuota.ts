export const GMP_QUOTA_EXCEEDED_EVENT = 'gmp-quota-exceeded';

export function checkAndNotifyGmpQuotaError(err: unknown): boolean {
  if (!err) return false;

  const errObj = err as { status?: number | string; code?: number | string; message?: string };
  const message =
    err instanceof Error
      ? err.message
      : typeof err === 'string'
        ? err
        : String(errObj?.message || err);

  const status = errObj?.status;
  const code = errObj?.code;

  const isQuotaError =
    status === 429 ||
    code === 429 ||
    status === 'RESOURCE_EXHAUSTED' ||
    status === 'OVER_QUERY_LIMIT' ||
    message.includes('RESOURCE_EXHAUSTED') ||
    message.includes('OVER_QUERY_LIMIT') ||
    message.includes('OverQuotaMapError') ||
    message.includes('QuotaExceededError') ||
    message.includes('429');

  if (isQuotaError && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(GMP_QUOTA_EXCEEDED_EVENT));
  }

  return isQuotaError;
}
