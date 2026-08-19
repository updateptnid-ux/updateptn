import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * GET /api/clear-session
 * Hapus semua cookie Supabase yang menyebabkan HTTP 431 (Request Header Too Large)
 * Akses: localhost:3000/api/clear-session lalu refresh halaman
 */
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));

  // Hapus semua cookie yang namanya mengandung "supabase" atau "sb-"
  const allCookies = request.cookies.getAll();
  for (const cookie of allCookies) {
    if (
      cookie.name.includes("supabase") ||
      cookie.name.startsWith("sb-") ||
      cookie.name.includes("-auth-token")
    ) {
      response.cookies.set(cookie.name, "", {
        maxAge: 0,
        path: "/",
      });
    }
  }

  return response;
}
