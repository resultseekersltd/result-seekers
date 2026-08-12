import { type NextRequest } from "next/server";
import { laravelFetch, proxyResponse } from "@/app/api/expert-pool/_bff";

export async function GET() {
  const res = await laravelFetch({ path: "/profile" });
  return proxyResponse(res);
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const res = await laravelFetch({ path: "/profile", method: "PATCH", body });
  return proxyResponse(res);
}
