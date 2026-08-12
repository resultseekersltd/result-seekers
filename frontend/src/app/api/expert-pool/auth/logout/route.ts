import { laravelFetch, proxyResponse, clearSessionCookie } from "@/app/api/expert-pool/_bff";

export async function POST() {
  const res = await laravelFetch({ path: "/logout", method: "POST" });
  const nextRes = await proxyResponse(res);
  // Always clear the cookie, even if Laravel returns an error.
  await clearSessionCookie();
  return nextRes;
}
