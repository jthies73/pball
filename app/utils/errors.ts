/** Extracts a human-readable message from an ofetch/H3 error. Auto-imported. */
export function apiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  const e = error as {
    data?: { statusMessage?: string; message?: string }
    statusMessage?: string
  }
  return e?.data?.statusMessage || e?.data?.message || e?.statusMessage || fallback
}
