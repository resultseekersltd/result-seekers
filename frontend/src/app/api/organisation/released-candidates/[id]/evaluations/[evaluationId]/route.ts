import { type NextRequest } from "next/server";
import { laravelFetch, proxyResponse } from "@/app/api/organisation/_bff";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; evaluationId: string }> }) {
  const { id, evaluationId } = await params;
  const body = await request.json();
  const res = await laravelFetch({ path: `/released-candidates/${id}/evaluations/${evaluationId}`, method: "PATCH", body });
  return proxyResponse(res);
}
