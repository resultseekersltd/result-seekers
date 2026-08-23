import { type NextRequest } from "next/server";
import { getSessionToken, laravelFetch, proxyResponse } from "@/app/api/admin/_bff";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  const res = await laravelFetch({ path: `/media${request.nextUrl.search}` });
  return proxyResponse(res);
}

export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return Response.json({ message: "Unauthenticated." }, { status: 401 });

  const formData = await request.formData();

  const res = await fetch(`${env.apiUrl}/admin/media`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    body: formData,
    cache: "no-store",
  });

  return proxyResponse(res);
}
