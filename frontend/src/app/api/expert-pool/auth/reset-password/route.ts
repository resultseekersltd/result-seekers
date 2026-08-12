import { type NextRequest } from "next/server";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const res = await fetch(`${env.apiUrl}/expert-pool/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));
  return Response.json(json, { status: res.status });
}
