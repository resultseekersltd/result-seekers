import { laravelFetch, proxyResponse } from "@/app/api/expert-pool/_bff";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await laravelFetch({ path: `/consents/${id}/withdraw`, method: "POST" });
  return proxyResponse(res);
}
