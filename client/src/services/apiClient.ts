import { getAccessToken } from "./authService";

/**
 * Tiny fetch wrapper for our Express API.
 * - Adds the login token automatically.
 * - Unwraps `{ data }` responses.
 * - Turns `{ error }` responses into an ApiError with per-field messages.
 */

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/api${path}`, { ...options, headers });
  } catch {
    throw new ApiError("Couldn't reach the server. Is it running?", 0);
  }

  if (response.status === 204) return undefined as T;

  let body: { data?: T; error?: { message?: string; details?: unknown } } = {};
  try {
    body = await response.json();
  } catch {
    // Non-JSON response (e.g. proxy error page)
  }

  if (!response.ok) {
    const details = body.error?.details;
    throw new ApiError(
      body.error?.message ?? `Request failed (${response.status}).`,
      response.status,
      details && typeof details === "object" ? (details as Record<string, string>) : {},
    );
  }
  return body.data as T;
}
