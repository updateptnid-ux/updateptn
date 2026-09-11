import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const next = requestUrl.searchParams.get("next");

  // Determine origin safely (considering proxy headers if deployed behind load balancers)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : requestUrl.origin;

  // Handle OAuth provider error
  if (error) {
    console.error("❌ OAuth error in callback:", error, errorDescription);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error)}&message=${encodeURIComponent(
        errorDescription || "Authentication failed"
      )}`
    );
  }

  // Exchange code for session
  if (code) {
    try {
      let response = NextResponse.next();

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
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      });

      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("❌ exchangeCodeForSession error:", exchangeError.message);
        return NextResponse.redirect(
          `${origin}/login?error=auth_failed&message=${encodeURIComponent(
            exchangeError.message
          )}`
        );
      }

      if (!data.session || !data.user) {
        console.error("❌ Session or user missing after exchange");
        return NextResponse.redirect(`${origin}/login?error=no_session`);
      }

      console.log("✅ OAuth session created for user:", data.user.email);

      // Check profile completion (full_name and provinsi)
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, provinsi")
        .eq("id", data.user.id)
        .single();

      let redirectPath = next || "/dashboard/student";
      if (!profile?.full_name || !profile?.provinsi) {
        redirectPath = "/complete-profile";
      }

      // Create final redirect response and copy all session cookies set by Supabase
      const finalResponse = NextResponse.redirect(`${origin}${redirectPath}`);
      response.cookies.getAll().forEach((cookie) => {
        finalResponse.cookies.set(cookie.name, cookie.value);
      });

      return finalResponse;
    } catch (err: any) {
      console.error("❌ Unexpected error in auth callback route:", err);
      return NextResponse.redirect(
        `${origin}/login?error=unexpected&message=${encodeURIComponent(
          err?.message || "Unknown error"
        )}`
      );
    }
  }

  // Fallback if no code is present
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
