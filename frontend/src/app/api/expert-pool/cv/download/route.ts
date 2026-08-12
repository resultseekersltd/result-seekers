import { getSessionToken } from "@/app/api/expert-pool/_bff";
import { env } from "@/lib/env";

export async function GET() {
  const token = await getSessionToken();
  if (!token) return Response.json({ message: "Unauthenticated." }, { status: 401 });

  const res = await fetch(`${env.apiUrl}/expert-pool/cv/download`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "*/*",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    return Response.json(json, { status: res.status });
  }

  const blob = await res.blob();
  const headers = new Headers();
  const contentType = res.headers.get("content-type");
  const contentDisposition = res.headers.get("content-disposition");

  if (contentType) headers.set("Content-Type", contentType);
  if (contentDisposition) headers.set("Content-Disposition", contentDisposition);

  return new Response(blob, { status: 200, headers });
}
