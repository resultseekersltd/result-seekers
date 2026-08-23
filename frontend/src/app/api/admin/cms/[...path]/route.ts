import { type NextRequest } from "next/server";
import { laravelFetch, proxyResponse } from "@/app/api/admin/_bff";

/**
 * Generic proxy for every plain-CRUD admin endpoint (CMS content types,
 * Expert Pool management, Audit Log) — these are pure passthroughs with no
 * side effects beyond attaching the session token, so one catch-all route
 * replaces what would otherwise be ~25 near-identical route files. Auth/
 * MFA (cookie side effects) and Media (multipart upload) are NOT routed
 * through here — they have their own dedicated handlers.
 */
async function handle(request: NextRequest, path: string[], method: string): Promise<Response> {
  const laravelPath = `/${path.join("/")}${request.nextUrl.search}`;
  const body = ["POST", "PATCH", "PUT"].includes(method)
    ? await request.json().catch(() => undefined)
    : undefined;

  const res = await laravelFetch({ path: laravelPath, method, body });
  return proxyResponse(res);
}

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  return handle(request, (await params).path, "GET");
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  return handle(request, (await params).path, "POST");
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  return handle(request, (await params).path, "PATCH");
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  return handle(request, (await params).path, "DELETE");
}
