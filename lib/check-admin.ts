import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Check if current user is admin
 * Only updateptnid@gmail.com has admin access
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

  // Check if user is admin
  const ADMIN_EMAILS = ["updateptnid@gmail.com"];

  if (!ADMIN_EMAILS.includes(user.email || "")) {
    // Not admin, redirect to student dashboard
    redirect("/dashboard/student");
  }

  return user;
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

    const ADMIN_EMAILS = ["updateptnid@gmail.com"];
    return ADMIN_EMAILS.includes(user.email || "");
  } catch {
    return false;
  }
}
