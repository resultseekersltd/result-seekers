import { type NextRequest } from "next/server";
import { laravelFetch, proxyResponse } from "@/app/api/organisation/_bff";

export async function GET(request: NextRequest) {
  const qs = request.nextUrl.search;
  const res = await laravelFetch({ path: `/talent-requests${qs}` });
  return proxyResponse(res);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await laravelFetch({ path: "/talent-requests", method: "POST", body });
  return proxyResponse(res);
}
