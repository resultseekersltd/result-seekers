import { laravelFetch, proxyResponse } from "@/app/api/admin/_bff";

export async function GET() {
  const res = await laravelFetch({ path: "/mfa/setup" });
  return proxyResponse(res);
}
