import { type NextRequest } from "next/server";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${env.apiUrl}/expert-pool/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const json = await res.json().catch(() => ({}));
    return Response.json(json, { status: res.status });
  } catch (error) {
    console.error("Backend registration endpoint unreachable:", error);
    return Response.json(
      { message: "The Expert Pool backend database is currently offline or unreachable. Please connect your live backend API URL." },
      { status: 503 }
    );
  }
}
