import { type NextRequest } from "next/server";
import { laravelFetch, proxyResponse } from "@/app/api/admin/_bff";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await laravelFetch({ path: `/media/${id}`, method: "DELETE" });
  return proxyResponse(res);
}
