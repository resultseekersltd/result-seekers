import { laravelFetch, proxyResponse } from "@/app/api/organisation/_bff";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await laravelFetch({ path: `/placements/${id}/confirm`, method: "POST" });
  return proxyResponse(res);
}
