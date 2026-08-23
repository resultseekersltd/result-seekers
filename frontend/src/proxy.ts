import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME as EXPERT_COOKIE_NAME } from "@/app/api/expert-pool/_bff";
import { COOKIE_NAME as ADMIN_COOKIE_NAME } from "@/app/api/admin/_bff";
import { COOKIE_NAME as ORGANISATION_COOKIE_NAME } from "@/app/api/organisation/_bff";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const expertSessionToken = request.cookies.get(EXPERT_COOKIE_NAME)?.value;
  const adminSessionToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const organisationSessionToken = request.cookies.get(ORGANISATION_COOKIE_NAME)?.value;

  const isExpertProtected = pathname.startsWith("/expert-pool/dashboard");
  const isExpertGuestOnly =
    pathname === "/expert-pool/login" || pathname === "/expert-pool/register";

  if (isExpertProtected && !expertSessionToken) {
    const loginUrl = new URL("/expert-pool/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isExpertGuestOnly && expertSessionToken) {
    return NextResponse.redirect(new URL("/expert-pool/dashboard", request.url));
  }

  const isAdminProtected = pathname.startsWith("/admin/dashboard");
  const isAdminGuestOnly = pathname === "/admin/login";

  if (isAdminProtected && !adminSessionToken) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminGuestOnly && adminSessionToken) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  const isOrganisationProtected = pathname.startsWith("/organisation/dashboard");
  const isOrganisationGuestOnly =
    pathname === "/organisation/login" || pathname === "/organisation/register";

  if (isOrganisationProtected && !organisationSessionToken) {
    const loginUrl = new URL("/organisation/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isOrganisationGuestOnly && organisationSessionToken) {
    return NextResponse.redirect(new URL("/organisation/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/expert-pool/:path*", "/admin/:path*", "/organisation/:path*"],
};
