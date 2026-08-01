import { createServerClient } from "@supabase/ssr";
<<<<<<< HEAD
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Pass current pathname via request header for Server Layouts
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
=======
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
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
<<<<<<< HEAD
            request: {
              headers: requestHeaders,
            },
=======
            request,
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

<<<<<<< HEAD
  // Extract user session from Supabase
=======
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
  const {
    data: { user },
  } = await supabase.auth.getUser();

<<<<<<< HEAD
=======
  const pathname = request.nextUrl.pathname;

>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
  // ========================================================
  // 1. OBSCURE ADMIN ROUTE PROTECTION (/hq-core-updateptn/*)
  // ========================================================
  if (pathname.startsWith("/hq-core-updateptn")) {
<<<<<<< HEAD
    const isAdminLoginRoute = pathname === "/hq-core-updateptn/login";

    let isAdmin = false;
    if (user) {
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

      // Fallback: Check user metadata or admin email
      if (!isAdmin) {
        const userMetaRole =
          user.user_metadata?.role ||
          user.app_metadata?.role ||
          (user.email === "admin@updateptn.id" ? "admin" : null);

        if (userMetaRole === "admin") {
          isAdmin = true;
        }
      }
    }

    // Case A: User visiting /hq-core-updateptn/login
    if (isAdminLoginRoute) {
      if (user && isAdmin) {
        // If already logged in as admin, redirect to /hq-core-updateptn
        const url = request.nextUrl.clone();
        url.pathname = "/hq-core-updateptn";
        return NextResponse.redirect(url);
      }
      // Unauthenticated or non-admin users are allowed to view the admin login page
      return supabaseResponse;
    }

    // Case B: User visiting any other /hq-core-updateptn/* route
    if (!user || !isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/hq-core-updateptn/login";
      if (!user) {
        url.searchParams.set("redirect", pathname);
      }
=======
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/student";
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
      return NextResponse.redirect(url);
    }
  }

  // ========================================================
<<<<<<< HEAD
  // 2. STRICT PROTECTION FOR INTERNAL ROUTES
=======
  // 2. STRICT ZERO-TRUST PROTECTION FOR INTERNAL ROUTES
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
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
