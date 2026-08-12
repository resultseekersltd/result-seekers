import { laravelFetch, proxyResponse } from "@/app/api/expert-pool/_bff";

export async function GET() {
  const res = await laravelFetch({ path: "/disciplines" });
  return proxyResponse(res);
}
