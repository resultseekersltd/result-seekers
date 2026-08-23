import { laravelFetch, proxyResponse } from "@/app/api/organisation/_bff";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await laravelFetch({ path: `/users/${id}`, method: "DELETE" });
  return proxyResponse(res);
}
