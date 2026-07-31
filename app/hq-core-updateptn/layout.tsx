import { createClient } from "@/lib/supabase/server";
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

  // 2. Strict Role Check: profile.role MUST be 'admin'
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard/student");
  }

  const adminUser = {
    name: profile.full_name || user.email?.split("@")[0] || "Super Admin",
    email: user.email || "admin@updateptn.id",
  };

  return (
    <AdminSidebarLayout user={adminUser}>
      {children}
    </AdminSidebarLayout>
  );
}
