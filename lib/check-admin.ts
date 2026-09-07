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

  // Check database role using service role client
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY not configured");
    redirect("/dashboard/student");
  }

  const serviceClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { persistSession: false } }
  );

  const { data: profile } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") {
    return user;
  }

  // Not admin, redirect to student dashboard
  redirect("/dashboard/student");
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

    // Check database role (client-side can't use service role, so use regular client)
    // This will work if RLS policy allows users to read their own role
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
