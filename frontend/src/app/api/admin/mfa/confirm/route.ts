import { type NextRequest } from "next/server";
import { laravelFetch, proxyResponse } from "@/app/api/admin/_bff";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await laravelFetch({ path: "/mfa/confirm", method: "POST", body });
  return proxyResponse(res);
}
