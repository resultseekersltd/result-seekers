import { type NextRequest } from "next/server";
import { getSessionToken } from "@/app/api/expert-pool/_bff";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return Response.json({ message: "Unauthenticated." }, { status: 401 });

  const formData = await request.formData();

  const res = await fetch(`${env.apiUrl}/expert-pool/cv`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: formData,
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));
  return Response.json(json, { status: res.status });
}

export async function DELETE() {
  const token = await getSessionToken();
  if (!token) return Response.json({ message: "Unauthenticated." }, { status: 401 });

  const res = await fetch(`${env.apiUrl}/expert-pool/cv`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));
  return Response.json(json, { status: res.status });
}
