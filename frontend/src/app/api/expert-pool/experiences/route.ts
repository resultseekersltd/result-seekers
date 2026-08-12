import { type NextRequest } from "next/server";
import { laravelFetch, proxyResponse } from "@/app/api/expert-pool/_bff";

export async function GET() {
  const res = await laravelFetch({ path: "/experiences" });
  return proxyResponse(res);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await laravelFetch({ path: "/experiences", method: "POST", body });
  return proxyResponse(res);
}
