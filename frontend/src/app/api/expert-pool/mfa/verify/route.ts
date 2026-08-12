import { type NextRequest } from "next/server";
import { laravelFetch, setSessionCookie } from "@/app/api/expert-pool/_bff";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const mfaToken = request.headers.get("X-MFA-Token") ?? undefined;

  const res = await laravelFetch({
    path: "/mfa/verify",
    method: "POST",
    body,
    bearerToken: mfaToken,
  });

  const json = await res.json().catch(() => ({}));

  if (res.ok && json.token) {
    await setSessionCookie(json.token);
    delete json.token;
    return Response.json(json, { status: 200 });
  }

  return Response.json(json, { status: res.status });
}
