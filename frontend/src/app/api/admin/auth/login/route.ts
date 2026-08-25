import { type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { setSessionCookie } from "@/app/api/admin/_bff";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${env.apiUrl}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const json = await res.json().catch(() => ({}));

    // A full token is issued either on a normal MFA-verified login (not
    // possible directly from this endpoint) or on a first-ever login before
    // MFA setup — both cases carry `token` without `mfa_required`.
    if (res.ok && json.token && !json.mfa_required) {
      await setSessionCookie(json.token);
      delete json.token;
      return Response.json(json, { status: 200 });
    }

    return Response.json(json, { status: res.status });
  } catch (error) {
    console.error("Backend admin login endpoint unreachable:", error);
    return Response.json(
      { message: "The admin backend is currently offline or unreachable." },
      { status: 503 },
    );
  }
}
