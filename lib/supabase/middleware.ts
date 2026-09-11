import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Auto-redirect if URL contains ?code= and is not already at /auth/callback
  if (request.nextUrl.searchParams.has("code") && !pathname.startsWith("/auth/callback")) {
    const callbackUrl = new URL("/auth/callback", request.url);
    callbackUrl.searchParams.set("code", request.nextUrl.searchParams.get("code")!);
    const nextParam = request.nextUrl.searchParams.get("next");
    if (nextParam) {
      callbackUrl.searchParams.set("next", nextParam);
    }
    return NextResponse.redirect(callbackUrl);
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Allow public auth routes and profile completion
  if (pathname === '/auth/success' || pathname === '/auth/callback' || pathname === '/complete-profile') {
    return supabaseResponse;
  }

  // Admin route protection - Only check if user is logged in
  // Role verification is done in layout.tsx with service role client
  if (pathname.startsWith("/hq-core-updateptn")) {
    if (pathname === "/hq-core-updateptn/login") {
      if (user) {
        return NextResponse.redirect(new URL("/hq-core-updateptn", request.url));
      }
      return supabaseResponse;
    }

    // Just check if user is logged in
    // Layout will verify admin role from database
    if (!user) {
      return NextResponse.redirect(new URL("/hq-core-updateptn/login", request.url));
    }

    // Let layout.tsx handle role verification
  }

  // Student & Protected Route Protection
  if (
    pathname.startsWith("/direktori-prodi") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/tryout")
  ) {
    if (!user) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Redirect if already logged in
  if (pathname === "/login" || pathname === "/register") {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard/student", request.url));
    }
  }

  return supabaseResponse;
}
