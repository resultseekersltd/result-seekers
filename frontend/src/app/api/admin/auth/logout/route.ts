import { laravelFetch, proxyResponse, clearSessionCookie } from "@/app/api/admin/_bff";

export async function POST() {
  const res = await laravelFetch({ path: "/logout", method: "POST" });
  await clearSessionCookie();
  return proxyResponse(res);
}
