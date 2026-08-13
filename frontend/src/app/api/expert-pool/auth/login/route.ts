import { type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { setSessionCookie } from "@/app/api/expert-pool/_bff";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${env.apiUrl}/expert-pool/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const json = await res.json().catch(() => ({}));

    if (res.ok && json.token && !json.mfa_required) {
      await setSessionCookie(json.token);
      delete json.token;
      return Response.json(json, { status: 200 });
    }

    return Response.json(json, { status: res.status });
  } catch (error) {
    console.error("Backend login endpoint unreachable:", error);
    return Response.json(
      { message: "The Expert Pool backend database is currently offline or unreachable. Please connect your live backend API URL." },
      { status: 503 }
    );
  }
}
