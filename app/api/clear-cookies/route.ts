import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const response = NextResponse.redirect(new URL("/login", request.url));

  // Clear all Supabase auth cookies
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = cookieHeader.split(";");

  cookies.forEach((c) => {
    const cookieName = c.split("=")[0].trim();
    if (cookieName.startsWith("sb-") || cookieName.includes("auth") || cookieName.includes("supabase")) {
      response.cookies.set(cookieName, "", { maxAge: 0, path: "/" });
    }
  });

  return response;
}
