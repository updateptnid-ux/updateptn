import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
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

  // Extract user session from Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ========================================================
  // 1. OBSCURE ADMIN ROUTE PROTECTION (/hq-core-updateptn/*)
  // ========================================================
  if (pathname.startsWith("/hq-core-updateptn")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    let isAdmin = false;

    try {
      // Bypass RLS using Service Role Key if present in environment
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const dbClient = serviceRoleKey
        ? createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey,
            { auth: { persistSession: false } }
          )
        : supabase;

      // Query profiles table for the user's role
      const { data: profile, error } = await dbClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!error && profile && profile.role === "admin") {
        isAdmin = true;
      }
    } catch (err) {
      console.error("Middleware DB profile fetch error:", err);
    }

    // Fallback: Check user metadata if DB check didn't yield admin
    if (!isAdmin) {
      const userMetaRole =
        user.user_metadata?.role ||
        user.app_metadata?.role ||
        (user.email === "admin@updateptn.id" ? "admin" : null);

      if (userMetaRole === "admin") {
        isAdmin = true;
      }
    }

    // If unauthorized, immediately redirect to /dashboard/student
    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/student";
      return NextResponse.redirect(url);
    }
  }

  // ========================================================
  // 2. STRICT PROTECTION FOR INTERNAL ROUTES
  // Protect: /direktori-prodi, /dashboard, /tryout
  // ========================================================
  if (
    pathname.startsWith("/direktori-prodi") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/tryout")
  ) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
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
