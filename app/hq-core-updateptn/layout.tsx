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

  // ADMIN EMAIL WHITELIST - Priority check
  const ADMIN_EMAILS = ["updateptnid@gmail.com", "admin@updateptn.id"];
  const isAdminEmail = ADMIN_EMAILS.includes(user.email?.toLowerCase() || "");

  if (isAdminEmail) {
    isAdmin = true;
  }

  // 2. Check profiles.role in database (if not admin email)
  if (!isAdmin) {
    try {
      // Try with service role first (more reliable for RLS)
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      console.log("🔍 Checking admin role for:", user.email);
      console.log("📧 Service role key exists:", !!serviceRoleKey);
      
      if (serviceRoleKey) {
        const serviceClient = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceRoleKey,
          { auth: { persistSession: false } }
        );

        const { data: profile, error } = await serviceClient
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .maybeSingle();

        console.log("👤 Profile data:", { role: profile?.role, full_name: profile?.full_name, error: error?.message });

        if (!error && profile) {
          if (profile.full_name) {
            adminName = profile.full_name;
          }
          if (profile.role === "admin") {
            isAdmin = true;
            console.log("✅ Admin access granted via database role");
          }
        } else if (error) {
          console.error("❌ Profile query error:", error);
        }
      } else {
        // Fallback: use regular supabase client (might be affected by RLS)
        console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY not found, using regular client");
        
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .maybeSingle();

        console.log("👤 Profile data (regular client):", { role: profile?.role, error: error?.message });

        if (!error && profile) {
          if (profile.full_name) {
            adminName = profile.full_name;
          }
          if (profile.role === "admin") {
            isAdmin = true;
            console.log("✅ Admin access granted via database role (regular client)");
          }
        }
      }
    } catch (err) {
      console.error("❌ AdminLayout profile check error:", err);
      // Don't block access on error - let other checks decide
    }
  } else {
    console.log("✅ Admin access granted via email whitelist");
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
