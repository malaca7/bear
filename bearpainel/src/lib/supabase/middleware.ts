import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const pathname = request.nextUrl.pathname;

  // Retrieve our mock session cookie
  const mockCookie = request.cookies.get("bear_mock_session");
  let user: any = null;

  if (mockCookie?.value) {
    try {
      user = JSON.parse(decodeURIComponent(mockCookie.value));
    } catch {
      user = null;
    }
  }

  // Protect admin and client routes
  if (!user && (pathname.startsWith("/admin") || pathname.startsWith("/client"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Protect admin routes from clients
  if (user && pathname.startsWith("/admin") && user.role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/client/dashboard";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from login/register pages
  if (user && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();
    url.pathname = user.role === "admin" ? "/admin/dashboard" : "/client/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}
