import { type NextRequest } from "next/server";
import { laravelFetch, proxyResponse } from "@/app/api/expert-pool/_bff";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const res = await laravelFetch({ path: `/assessments/${id}/submit`, method: "POST", formData });
    return proxyResponse(res);
  }

  const body = await request.json();
  const res = await laravelFetch({ path: `/assessments/${id}/submit`, method: "POST", body });
  return proxyResponse(res);
}
