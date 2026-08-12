import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME } from "@/app/api/expert-pool/_bff";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(COOKIE_NAME)?.value;

  const isProtected = pathname.startsWith("/expert-pool/dashboard");
  const isGuestOnly =
    pathname === "/expert-pool/login" || pathname === "/expert-pool/register";

  if (isProtected && !sessionToken) {
    const loginUrl = new URL("/expert-pool/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isGuestOnly && sessionToken) {
    return NextResponse.redirect(new URL("/expert-pool/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/expert-pool/:path*"],
};
