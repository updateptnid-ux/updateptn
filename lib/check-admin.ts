import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

/**
 * Check if current user is admin
 * Checks both hardcoded super admins and database role
 */
export async function checkAdminAccess() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not logged in, redirect to login
  if (!user) {
    redirect("/login?redirect=/hq-core-updateptn");
  }

  // Check hardcoded super admins first
  const SUPER_ADMIN_EMAILS = ["updateptnid@gmail.com", "admin@updateptn.id"];
  if (SUPER_ADMIN_EMAILS.includes(user.email?.toLowerCase() || "")) {
    return user;
  }

  // Check JWT metadata role
  if (user.app_metadata?.role === "admin" || user.user_metadata?.role === "admin") {
    return user;
  }

  // Check database role
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let profile: { role?: string } | null = null;

  if (serviceRoleKey) {
    try {
      const serviceClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { persistSession: false } }
      );

      const { data } = await serviceClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (data) profile = data;
    } catch (e) {
      console.error("Service client check error:", e);
    }
  }

  // Fallback to authenticated server client
  if (!profile) {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (data) profile = data;
    } catch (e) {
      console.error("Server supabase client check error:", e);
    }
  }

  if (profile?.role === "admin") {
    return user;
  }

  // Not admin, redirect to admin login with unauthorized notice
  redirect("/hq-core-updateptn/login?error=unauthorized");
}

/**
 * Client-side check for admin role
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    // Check hardcoded super admins
    const SUPER_ADMIN_EMAILS = ["updateptnid@gmail.com", "admin@updateptn.id"];
    if (SUPER_ADMIN_EMAILS.includes(user.email?.toLowerCase() || "")) {
      return true;
    }

    // Check JWT metadata
    if (user.app_metadata?.role === "admin" || user.user_metadata?.role === "admin") {
      return true;
    }

    // Check database role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    return profile?.role === "admin";
  } catch {
    return false;
  }
}
