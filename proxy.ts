import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/restaurants", "/owner", "/dashboard", "/admin/login"];
const AUTH_ROUTES = ["/login", "/signup"];

export default async function proxy(request: NextRequest) {
  const { supabase, user: supabaseUser, supabaseResponse } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Check fallback cookie
  const demoCookie = request.cookies.get("tbites_demo_user")?.value;
  let demoUser: { id: string; role: string } | null = null;
  if (demoCookie) {
    try {
      demoUser = JSON.parse(demoCookie);
    } catch {
      demoUser = null;
    }
  }

  const effectiveUser = supabaseUser || demoUser;
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith("/restaurants/") || pathname.startsWith("/dashboard")
  );

  if (isPublicRoute) {
    return supabaseResponse;
  }

  // Admin routes protection
  let role = demoUser?.role;
  if (!role && supabaseUser) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", supabaseUser.id)
      .single();
    role = profile?.role;
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/owner", request.url));
  }

  // Protected routes require authentication
  if (!effectiveUser) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
