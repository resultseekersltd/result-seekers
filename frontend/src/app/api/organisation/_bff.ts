/**
 * Shared helpers for Organisation BFF Route Handlers — exact mirror of
 * src/app/api/expert-pool/_bff.ts and src/app/api/admin/_bff.ts.
 *
 * Architecture:
 *   Browser → Next.js Route Handler → Laravel API
 *
 * The Sanctum bearer token is stored in a secure httpOnly cookie set by
 * these helpers. The browser never sees the raw token value.
 */

import { cookies } from "next/headers";
import { env } from "@/lib/env";

export const COOKIE_NAME = "org_session";
export const LARAVEL_BASE = `${env.apiUrl}/organisation`;

export interface BffProxyOptions {
  path: string;
  method?: string;
  body?: unknown;
  /** Use this token instead of the cookie (e.g. MFA exchange). */
  bearerToken?: string;
  formData?: FormData;
  contentType?: string;
}

export async function getSessionToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value ?? null;
}

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

export async function proxyResponse(laravelRes: Response): Promise<Response> {
  const json = await laravelRes.json().catch(() => ({}));
  const nextRes = Response.json(json, { status: laravelRes.status });

  if (laravelRes.status === 401 || laravelRes.status === 403) {
    const jar = await cookies();
    jar.delete(COOKIE_NAME);
  }

  return nextRes;
}

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

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
