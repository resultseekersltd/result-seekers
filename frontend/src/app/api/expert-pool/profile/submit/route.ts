import { laravelFetch, proxyResponse } from "@/app/api/expert-pool/_bff";

export async function POST() {
  const res = await laravelFetch({ path: "/profile/submit", method: "POST" });
  return proxyResponse(res);
}
