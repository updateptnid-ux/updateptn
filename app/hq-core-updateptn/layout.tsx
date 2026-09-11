import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import AdminSidebarLayout from "@/components/admin/AdminSidebarLayout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Bypass admin sidebar layout for dedicated HQ Admin Login page
  if (pathname === "/hq-core-updateptn/login") {
    return <>{children}</>;
  }

  const supabase = await createClient();

  // 1. Verify user session via Supabase Server Client
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/hq-core-updateptn/login");
  }

  let isAdmin = false;
  let adminName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Super Admin";

  // ✅ HYBRID ADMIN CHECK: Hardcoded emails (super admin) + Database role
  
  // 1. Check hardcoded super admin emails first (only system admins)
  const SUPER_ADMIN_EMAILS = ["updateptnid@gmail.com", "admin@updateptn.id"];
  const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(user.email?.toLowerCase() || "");

  if (isSuperAdmin) {
    isAdmin = true;
    console.log("✅ Super Admin access granted via hardcoded email:", user.email);
  }

  // 2. Check JWT metadata role
  if (!isAdmin && (user.app_metadata?.role === "admin" || user.user_metadata?.role === "admin")) {
    isAdmin = true;
    console.log("✅ Admin access granted via token metadata role");
  }

  // 3. Query real-time database role
  if (!isAdmin) {
    try {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      let profile: { role?: string; full_name?: string } | null = null;
      let serviceClient: any = null;

      if (serviceRoleKey) {
        serviceClient = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceRoleKey,
          { auth: { persistSession: false } }
        );

        const { data, error } = await serviceClient
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (!error && data) {
          profile = data;
        }
      }

      // Fallback to server supabase client if service client was not available or didn't return data
      if (!profile) {
        const { data } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (data) {
          profile = data;
        }
      }

      if (profile) {
        if (profile.full_name) {
          adminName = profile.full_name;
        }

        if (profile.role === "admin") {
          isAdmin = true;
          console.log("✅ Admin access granted via database role");

          // Proactively sync to auth user metadata if service client is available
          if (serviceClient && user.app_metadata?.role !== "admin") {
            serviceClient.auth.admin
              .updateUserById(user.id, {
                app_metadata: { role: "admin" },
                user_metadata: { role: "admin" },
              })
              .catch((e: any) => console.error("AdminLayout background sync error:", e));
          }
        } else {
          console.log("❌ Role is not admin in database, got:", profile.role);
        }
      }
    } catch (err) {
      console.error("❌ AdminLayout profile check error:", err);
    }
  }

  // If unauthorized, redirect to /hq-core-updateptn/login
  if (!isAdmin) {
    console.log("🚫 Access denied for:", user.email, "- Not admin");
    redirect("/hq-core-updateptn/login");
  }

  console.log("✅ Admin access granted:", user.email);

  const adminUser = {
    name: adminName,
    email: user.email || "admin@updateptn.id",
  };

  return <AdminSidebarLayout user={adminUser}>{children}</AdminSidebarLayout>;
}
