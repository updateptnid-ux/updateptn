import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ========================================================
  // 1. OBSCURE ADMIN ROUTE PROTECTION (/hq-core-updateptn/*)
  // ========================================================
  if (pathname.startsWith("/hq-core-updateptn")) {
    // If unauthenticated, redirect to login with return URL
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Query user profile role from Supabase DB
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Forcibly redirect non-admin users to Student Dashboard
    if (!profile || profile.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/student";
      return NextResponse.redirect(url);
    }
  }

  // NOTE: We intentionally DO NOT intercept /admin here so attempts
  // to visit /admin naturally trigger Next.js 404 Not Found!

  // ========================================================
  // 2. STUDENT DASHBOARD ROUTE PROTECTION - /dashboard/*
  // ========================================================
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // ========================================================
  // 3. AUTH PAGES REDIRECT IF ALREADY LOGGED IN
  // ========================================================
  if (pathname === "/login" || pathname === "/register") {
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/student";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
