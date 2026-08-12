import { type NextRequest } from "next/server";
import { laravelFetch, proxyResponse } from "@/app/api/expert-pool/_bff";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const res = await laravelFetch({ path: `/experiences/${id}`, method: "PATCH", body });
  return proxyResponse(res);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await laravelFetch({ path: `/experiences/${id}`, method: "DELETE" });
  return proxyResponse(res);
}
