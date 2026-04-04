/**
 * Auth API — wraps all endpoints under /api/v1/auth
 *
 * HOW TO MERGE (for the auth owner):
 *  1. This file handles HTTP transport only. Business logic / routing
 *     after login stays in your AuthProvider / AuthContext.
 *  2. After calling `login()`, call `useAuthStore.getState().setAuth(token, user)`
 *     to store the token in memory and make it available to the API client.
 *  3. The API client will automatically send `Authorization: Bearer <token>`
 *     on every subsequent request and will attempt a silent refresh on 401.
 *  4. Do NOT store the access token in localStorage or sessionStorage.
 *
 * All endpoints return the raw backend `ApiResponse<T>` so the caller
 * can read `.message` for user-facing feedback.
 */

import { API_BASE, apiGet, apiPost } from '@/api/client';
import type {
  ApiResponse,
  AuthenticationResponse,
  UserSecuredResponse,
} from '@/types/api.types';

// ─── Request types (kept here for co-location, auth owner can extend) ────────

export interface LoginRequest {
  /** Use email OR phoneNumber, not both. */
  email?: string;
  phoneNumber?: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerifyRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * POST /auth/login
 * Returns access token + user info. refresh_token is set via HttpOnly cookie.
 */
export async function login(
  req: LoginRequest,
): Promise<ApiResponse<AuthenticationResponse>> {
  return apiPost<ApiResponse<AuthenticationResponse>>('/auth/login', req);
}

/**
 * POST /auth/logout
 * Invalidates the access token and clears the refresh_token cookie.
 */
export async function logout(): Promise<ApiResponse<null>> {
  return apiPost<ApiResponse<null>>('/auth/logout');
}

/**
 * GET /auth/account
 * Returns the currently authenticated user's profile.
 * Call this on app bootstrap to hydrate the session.
 */
export async function getAccount(): Promise<ApiResponse<UserSecuredResponse>> {
  return apiGet<ApiResponse<UserSecuredResponse>>('/auth/account');
}

/**
 * GET /auth/refresh
 * Uses the HttpOnly refresh_token cookie to issue a new access token.
 * Called automatically by the API client on 401; auth owner may also call
 * this explicitly on app startup to restore a previous session.
 *
 * IMPORTANT: this function intentionally uses a raw `fetch` (NOT `apiGet`)
 * so it bypasses the 401-retry logic in apiRequest. If we used apiGet here
 * the refresh call itself would 401 → trigger another refresh → infinite loop.
 */
export async function refreshAuthToken(): Promise<AuthenticationResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'GET',
      credentials: 'include', // sends the HttpOnly refresh_token cookie
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const body: ApiResponse<AuthenticationResponse> = await res.json();
    return body.data;
  } catch {
    return null;
  }
}

/**
 * POST /auth/register
 * Sends registration form. On success, user receives a verification email.
 */
export async function register(
  req: RegisterRequest,
): Promise<ApiResponse<null>> {
  return apiPost<ApiResponse<null>>('/auth/register', req);
}

/**
 * POST /auth/verify-active-account
 * Activates the account using the JWT token from the verification email.
 * On success returns auth tokens (same shape as login).
 */
export async function verifyActiveAccount(
  token: string,
): Promise<ApiResponse<AuthenticationResponse>> {
  return apiPost<ApiResponse<AuthenticationResponse>>(
    '/auth/verify-active-account',
    { token } satisfies VerifyEmailRequest,
  );
}

/**
 * POST /auth/resend-verify
 * Re-sends the verification email for an unverified account.
 */
export async function resendVerify(email: string): Promise<ApiResponse<null>> {
  return apiPost<ApiResponse<null>>('/auth/resend-verify', {
    email,
  } satisfies ResendVerifyRequest);
}

/**
 * POST /auth/forgot-password
 * Sends a password-reset link to the given email address.
 */
export async function forgotPassword(
  email: string,
): Promise<ApiResponse<null>> {
  return apiPost<ApiResponse<null>>('/auth/forgot-password', {
    email,
  } satisfies ForgotPasswordRequest);
}

/**
 * POST /auth/reset-password
 * Sets a new password using the JWT token from the reset email.
 */
export async function resetPassword(
  req: ResetPasswordRequest,
): Promise<ApiResponse<null>> {
  return apiPost<ApiResponse<null>>('/auth/reset-password', req);
}
