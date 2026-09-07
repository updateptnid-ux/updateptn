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

  // 2. If not super admin, check database role
  if (!isAdmin) {
    try {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      console.log("\n=== ADMIN CHECK DEBUG ===");
      console.log("🔍 Checking admin role for:", user.email);
      console.log("👤 User ID:", user.id);
      console.log("📧 Service role key exists:", !!serviceRoleKey);
      console.log("🌍 Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
      
      if (!serviceRoleKey) {
        console.error("❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables!");
        console.error("⚠️  Add it to .env.local to enable database-driven admin access");
      } else {
        const serviceClient = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceRoleKey,
          { auth: { persistSession: false } }
        );

        console.log("🔄 Querying profiles table...");

        const { data: profile, error } = await serviceClient
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .maybeSingle();

        console.log("📊 Query result:");
        console.log("   - Profile found:", !!profile);
        console.log("   - Role:", profile?.role || "null");
        console.log("   - Full name:", profile?.full_name || "null");
        console.log("   - Error:", error?.message || "none");

        if (!error && profile) {
          if (profile.full_name) {
            adminName = profile.full_name;
          }
          
          if (profile.role === "admin") {
            isAdmin = true;
            console.log("✅ Admin access granted via database role");
          } else {
            console.log("❌ Role is not admin, got:", profile.role);
          }
        } else if (error) {
          console.error("❌ Database error:", error);
        } else if (!profile) {
          console.log("⚠️  Profile not found for user:", user.email);
        }
      }
      console.log("=== END DEBUG ===\n");
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
