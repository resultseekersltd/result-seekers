import { laravelFetch, proxyResponse, clearSessionCookie } from "@/app/api/organisation/_bff";

export async function POST() {
  const res = await laravelFetch({ path: "/logout", method: "POST" });
  const nextRes = await proxyResponse(res);
  await clearSessionCookie();
  return nextRes;
}
