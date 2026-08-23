import { laravelFetch, proxyResponse } from "@/app/api/organisation/_bff";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await laravelFetch({ path: `/released-candidates/${id}` });
  return proxyResponse(res);
}
