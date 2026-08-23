import { type NextRequest } from "next/server";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${env.apiUrl}/organisation/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const json = await res.json().catch(() => ({}));
    return Response.json(json, { status: res.status });
  } catch (error) {
    console.error("Backend organisation registration endpoint unreachable:", error);
    return Response.json(
      { message: "The Result Seekers backend is currently offline or unreachable." },
      { status: 503 }
    );
  }
}
