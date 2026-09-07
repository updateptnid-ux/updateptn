import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

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

  // Admin route protection
  if (pathname.startsWith("/hq-core-updateptn")) {
    if (pathname === "/hq-core-updateptn/login") {
      if (user) {
        return NextResponse.redirect(new URL("/hq-core-updateptn", request.url));
      }
      return supabaseResponse;
    }

    // Check if admin (email whitelist OR database role)
    const ADMIN_EMAILS = ["updateptnid@gmail.com", "admin@updateptn.id"];
    let isAdmin = user && ADMIN_EMAILS.includes(user.email?.toLowerCase() || "");

    // If not in whitelist, check database role
    if (user && !isAdmin) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        
        if (profile?.role === "admin") {
          isAdmin = true;
        }
      } catch (err) {
        console.error("Middleware admin check error:", err);
      }
    }

    if (!user || !isAdmin) {
      return NextResponse.redirect(new URL("/hq-core-updateptn/login", request.url));
    }
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
