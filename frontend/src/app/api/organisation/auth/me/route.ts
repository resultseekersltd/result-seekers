import { laravelFetch, proxyResponse } from "@/app/api/organisation/_bff";

export async function GET() {
  const res = await laravelFetch({ path: "/me" });
  return proxyResponse(res);
}
