import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

const UUID_PATTERN =
  /^\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

const PROTECTED_PREFIXES = ["/create-dynasty"];

function isProtectedRoute(pathname: string): boolean {
  if (PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }
  if (UUID_PATTERN.test(pathname)) {
    return true;
  }
  return false;
}

const AUTH_ROUTES = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  try {
    const { user, supabaseResponse } = await updateSession(request);
    const { pathname } = request.nextUrl;

    if (!user && isProtectedRoute(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (user && AUTH_ROUTES.includes(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch {
    // If Supabase client fails (e.g. missing/invalid credentials),
    // let the request through rather than crashing
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/create-dynasty/:path*",
    "/:uuid([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/:path*",
  ],
};
