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

  // ✅ DATABASE-ONLY ADMIN CHECK - No hardcoded emails
  // Check profiles.role in database with service role (bypass RLS)
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log("🔍 Checking admin role for:", user.email);
    console.log("📧 Service role key exists:", !!serviceRoleKey);
    
    if (!serviceRoleKey) {
      console.error("❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables!");
      console.error("⚠️  Add it to .env.local to enable admin access");
      // Without service role key, cannot check role - deny access
      redirect("/hq-core-updateptn/login");
    }

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

    console.log("👤 Profile data:", { 
      userId: user.id,
      email: user.email,
      role: profile?.role, 
      full_name: profile?.full_name, 
      error: error?.message 
    });

    if (error) {
      console.error("❌ Database error:", error);
      redirect("/hq-core-updateptn/login");
    }

    if (!profile) {
      console.error("❌ Profile not found for user:", user.email);
      redirect("/hq-core-updateptn/login");
    }

    if (profile.full_name) {
      adminName = profile.full_name;
    }

    if (profile.role === "admin") {
      isAdmin = true;
      console.log("✅ Admin access granted via database role");
    } else {
      console.log("🚫 Access denied - User role:", profile.role);
    }
  } catch (err) {
    console.error("❌ AdminLayout profile check error:", err);
    redirect("/hq-core-updateptn/login");
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
