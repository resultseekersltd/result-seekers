/**
 * Shared helpers for Expert Pool BFF Route Handlers.
 *
 * Architecture:
 *   Browser → Next.js Route Handler → Laravel API
 *
 * The Sanctum bearer token is stored in a secure httpOnly cookie set by
 * these helpers. The browser never sees the raw token value.
 * On each proxied request the cookie is read and forwarded as an
 * Authorization: Bearer header to Laravel.
 */

import { cookies } from "next/headers";
import { env } from "@/lib/env";

export const COOKIE_NAME = "ep_session";
export const LARAVEL_BASE = `${env.apiUrl}/expert-pool`;

export interface BffProxyOptions {
  path: string;
  method?: string;
  body?: unknown;
  /** Use this token instead of the cookie (e.g. MFA exchange). */
  bearerToken?: string;
  /** Whether to forward multipart/form-data unchanged. */
  formData?: FormData;
  contentType?: string;
}

/**
 * Read the stored expert session token from the httpOnly cookie.
 * Returns null if no session exists.
 */
export async function getSessionToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value ?? null;
}

/**
 * Proxy a request to Laravel, injecting the stored session token.
 * Returns the raw Response from Laravel.
 */
export async function laravelFetch(opts: BffProxyOptions): Promise<Response> {
  const { path, method = "GET", body, bearerToken, formData } = opts;
  const token = bearerToken ?? (await getSessionToken());

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let fetchBody: BodyInit | undefined;

  if (formData) {
    fetchBody = formData;
    // Let fetch set the correct multipart Content-Type with boundary.
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    fetchBody = JSON.stringify(body);
  }

  return fetch(`${LARAVEL_BASE}${path}`, {
    method,
    headers,
    body: fetchBody,
    cache: "no-store",
  });
}

/**
 * Parse a Laravel JSON response and return a Next.js Response.
 * On 401/403, also clears the session cookie.
 */
export async function proxyResponse(laravelRes: Response): Promise<Response> {
  const json = await laravelRes.json().catch(() => ({}));
  const nextRes = Response.json(json, { status: laravelRes.status });

  if (laravelRes.status === 401 || laravelRes.status === 403) {
    // Force-clear the cookie on auth failure so the user is effectively logged out.
    const jar = await cookies();
    jar.delete(COOKIE_NAME);
  }

  return nextRes;
}

/**
 * Set the session cookie (httpOnly, SameSite=Lax, Secure in production).
 */
export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Clear the session cookie.
 */
export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
