import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import AdminSidebarLayout from "@/components/admin/AdminSidebarLayout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Verify user session via Supabase Server Client
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/hq-core-updateptn");
  }

  let isAdmin = false;
  let adminName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Super Admin";

  // 2. Secondary check: Query profiles.role on the server
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const dbClient = serviceRoleKey
      ? createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceRoleKey,
          { auth: { persistSession: false } }
        )
      : supabase;

    const { data: profile, error } = await dbClient
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (!error && profile) {
      if (profile.full_name) {
        adminName = profile.full_name;
      }
      if (profile.role === "admin") {
        isAdmin = true;
      }
    }
  } catch (err) {
    console.error("AdminLayout profile authorization error:", err);
  }

  // Fallback: Check metadata or admin email
  if (!isAdmin) {
    const userMetaRole =
      user.user_metadata?.role ||
      user.app_metadata?.role ||
      (user.email === "admin@updateptn.id" ? "admin" : null);

    if (userMetaRole === "admin") {
      isAdmin = true;
    }
  }

  // If unauthorized, redirect to /dashboard/student
  if (!isAdmin) {
    redirect("/dashboard/student");
  }

  const adminUser = {
    name: adminName,
    email: user.email || "admin@updateptn.id",
  };

  return <AdminSidebarLayout user={adminUser}>{children}</AdminSidebarLayout>;
}
