import { type NextRequest } from "next/server";
import { env } from "@/lib/env";

/**
 * Email verification — forwards the signed URL parameters to Laravel.
 * The ExpertVerifyEmail notification links to /expert-pool/verify-email?...
 * The page component calls this BFF endpoint which calls Laravel's signed route.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const id = params.get("id");
  const hash = params.get("hash");
  const expires = params.get("expires");
  const signature = params.get("signature");

  if (!id || !hash || !expires || !signature) {
    return Response.json({ message: "Missing verification parameters." }, { status: 422 });
  }

  const laravelUrl =
    `${env.apiUrl}/expert-pool/email/verify/${id}/${hash}` +
    `?expires=${expires}&signature=${signature}`;

  const res = await fetch(laravelUrl, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));
  return Response.json(json, { status: res.status });
}
