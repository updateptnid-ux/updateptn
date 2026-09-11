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

  // Helper for cookie-preserving redirect
  const redirectWithCookies = (url: URL | string) => {
    const targetUrl = typeof url === "string" ? new URL(url, request.url) : url;
    const res = NextResponse.redirect(targetUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      res.cookies.set(cookie.name, cookie.value, cookie);
    });
    return res;
  };

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Allow public auth routes and profile completion
  if (pathname === '/auth/success' || pathname === '/auth/callback' || pathname === '/complete-profile') {
    return supabaseResponse;
  }

  // Redirect if already logged in
  if (pathname === "/login" || pathname === "/register") {
    if (user) {
      return redirectWithCookies("/dashboard/student");
    }
    return supabaseResponse;
  }

  // If user is logged in, query role & marketing status
  let userRole = "student";
  let isMarketing = false;

  if (user) {
    // 1. Read role from auth metadata first (fast path / fallback)
    const metaRole = (user.app_metadata?.role || user.user_metadata?.role || "") as string;
    if (metaRole) {
      userRole = metaRole.toLowerCase();
    }

    // 2. Fetch fresh real-time role from database
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_marketing, free_access")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.role) {
        userRole = profile.role.toLowerCase();
      }
      isMarketing = Boolean(profile?.is_marketing || profile?.free_access);
    } catch (profileErr) {
      console.error("Middleware profiles query error:", profileErr);
    }
  }

  const SUPER_ADMIN_EMAILS = ["updateptnid@gmail.com", "admin@updateptn.id"];
  const isSuperAdmin = Boolean(user?.email && SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase()));
  const isAdmin = isSuperAdmin || userRole === "admin";
  const isKolOrBa = userRole === "kol" || userRole === "ba";

  // 1. Admin route protection (/hq-core-updateptn)
  if (pathname.startsWith("/hq-core-updateptn")) {
    if (pathname === "/hq-core-updateptn/login") {
      if (isAdmin) {
        return redirectWithCookies("/hq-core-updateptn");
      }
      return supabaseResponse;
    }

    // Must be logged in
    if (!user) {
      return redirectWithCookies("/hq-core-updateptn/login");
    }

    // Must have admin role
    if (!isAdmin) {
      return redirectWithCookies("/hq-core-updateptn/login?error=unauthorized");
    }

    // Let layout.tsx handle deeper admin layout verification
  }

  // 2. Mentor route protection (/mentor)
  if (pathname.startsWith("/mentor")) {
    if (!user) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return redirectWithCookies(url);
    }

    // KOL & BA blocked from internal mentor portal
    if (isKolOrBa) {
      return redirectWithCookies("/dashboard/student?error=restricted_role");
    }
  }

  // 3. Strict Restrictions for KOL & BA:
  // Akun role KOL atau BA HANYA bisa mengakses halaman fasilitas/tools platform.
  // DIBLOKIR KETAT dari transaksi / pembayaran serta admin & internal.
  if (isKolOrBa) {
    const isTransactionRoute =
      pathname.startsWith("/pricing") ||
      pathname.startsWith("/payment") ||
      pathname.startsWith("/dashboard/student/beli-paket") ||
      pathname.startsWith("/dashboard/student/payments");

    const isInternalRoute =
      pathname.startsWith("/dashboard/affiliate") ||
      pathname.startsWith("/hq-core-updateptn") ||
      pathname.startsWith("/mentor");

    if (isTransactionRoute || isInternalRoute) {
      const redirectUrl = new URL("/dashboard/student", request.url);
      redirectUrl.searchParams.set("error", "restricted_role");
      redirectUrl.searchParams.set(
        "msg",
        "Akun KOL/BA memiliki akses langsung ke fasilitas tools dan dibatasi dari transaksi pembayaran."
      );
      return redirectWithCookies(redirectUrl);
    }
  }

  // 4. Student & Protected Route Protection
  if (
    pathname.startsWith("/direktori-prodi") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/tryout")
  ) {
    if (!user) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return redirectWithCookies(url);
    }
  }

  return supabaseResponse;
}
