import { type NextRequest } from "next/server";
import { laravelFetch, proxyResponse } from "@/app/api/organisation/_bff";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const res = await laravelFetch({ path: `/released-candidates/${id}/comments`, method: "POST", body });
  return proxyResponse(res);
}
