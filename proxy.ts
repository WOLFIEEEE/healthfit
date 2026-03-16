import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const protectedPrefixes = ["/dashboard", "/onboarding", "/admin"];

function isProtected(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  if (!user && isProtected(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!user) {
    return response;
  }

  const onboardingCompleted = Boolean(user.user_metadata?.onboardingCompleted);
  const role = user.app_metadata?.role ?? "member";

  if (
    pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/dashboard/billing") &&
    !onboardingCompleted
  ) {
    const onboardingUrl = request.nextUrl.clone();
    onboardingUrl.pathname = "/onboarding";
    return NextResponse.redirect(onboardingUrl);
  }

  if (pathname.startsWith("/onboarding") && onboardingCompleted) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard/overview";
    return NextResponse.redirect(dashboardUrl);
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard/overview";
    return NextResponse.redirect(dashboardUrl);
  }

  if (pathname === "/login") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = onboardingCompleted
      ? "/dashboard/overview"
      : "/onboarding";
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
