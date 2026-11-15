/** Session-replay API root (backend/src/session-replay/session-replay.controller.ts) */
export const REPLAY_API = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1/session-replay`;

/**
 * Why a session-replay call failed: the server's `code` (OPENREPLAY_NOT_CONFIGURED,
 * OPENREPLAY_PROJECT_KEY_MISSING, OPENREPLAY_PROJECT_ID_MISSING, OPENREPLAY_ERROR)
 * and its message, or `fallback` when it sent none.
 */
export function replayProblem(error, fallback) {
  const data = error?.response?.data;
  const message = Array.isArray(data?.message) ? data.message.join('; ') : data?.message;
  return { code: data?.code ?? null, status: error?.response?.status ?? null, message: message || fallback };
}
