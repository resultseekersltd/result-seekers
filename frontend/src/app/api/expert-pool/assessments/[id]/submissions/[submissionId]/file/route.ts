import { getSessionToken } from "@/app/api/expert-pool/_bff";
import { env } from "@/lib/env";

/** Streams the binary assessment submission file through — distinct from the generic JSON proxy, which can't handle a file response. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string; submissionId: string }> }) {
  const { id, submissionId } = await params;
  const token = await getSessionToken();
  if (!token) return Response.json({ message: "Unauthenticated." }, { status: 401 });

  const res = await fetch(`${env.apiUrl}/expert-pool/assessments/${id}/submissions/${submissionId}/file`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "*/*" },
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
