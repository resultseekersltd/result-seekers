import { laravelFetch, proxyResponse } from "@/app/api/expert-pool/_bff";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await laravelFetch({ path: `/opportunities/${id}` });
  return proxyResponse(res);
}
