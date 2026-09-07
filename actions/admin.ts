"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Check if current user is admin
export async function checkIsAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;

  // Check hardcoded super admins first
  const SUPER_ADMIN_EMAILS = ["updateptnid@gmail.com", "admin@updateptn.id"];
  if (SUPER_ADMIN_EMAILS.includes(user.email?.toLowerCase() || "")) {
    return true;
  }

  // Check database role using service role client (can bypass RLS)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY not configured");
    return false;
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
  
  return profile?.role === "admin";
}

// Get all admins
export async function getAllAdmins() {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();
  
  const { data: admins, error } = await supabase
    .from("profiles")
    .select("id, full_name, created_at")
    .eq("role", "admin")
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  // Get emails from auth.users
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return { error: "Service role key not configured" };
  }

  const serviceClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { persistSession: false } }
  );

  const adminIds = admins?.map((a) => a.id) || [];
  const { data: authUsers } = await serviceClient.auth.admin.listUsers();
  
  const adminsWithEmail = admins?.map((admin) => {
    const authUser = authUsers?.users.find((u) => u.id === admin.id);
    return {
      ...admin,
      email: authUser?.email || "N/A",
    };
  });

  return { data: adminsWithEmail };
}

// Add admin by email
export async function addAdminByEmail(email: string) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    return { error: "Unauthorized" };
  }

  if (!email || !email.includes("@")) {
    return { error: "Email tidak valid" };
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return { error: "Service role key not configured" };
  }

  const serviceClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { persistSession: false } }
  );

  // Find user by email
  const { data: authUsers } = await serviceClient.auth.admin.listUsers();
  const targetUser = authUsers?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (!targetUser) {
    return { error: "User dengan email tersebut tidak ditemukan" };
  }

  // Check if already admin
  const { data: existingProfile } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("id", targetUser.id)
    .maybeSingle();

  if (existingProfile?.role === "admin") {
    return { error: "User sudah menjadi admin" };
  }

  // Update role to admin
  const { error: updateError } = await serviceClient
    .from("profiles")
    .update({ role: "admin", updated_at: new Date().toISOString() })
    .eq("id", targetUser.id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/hq-core-updateptn/admins");
  return { success: true, message: `${email} berhasil ditambahkan sebagai admin` };
}

// Remove admin by user ID
export async function removeAdmin(userId: string) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Prevent self-removal
  if (user?.id === userId) {
    return { error: "Tidak dapat menghapus admin sendiri" };
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return { error: "Service role key not configured" };
  }

  const serviceClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { persistSession: false } }
  );

  // Update role back to student
  const { error: updateError } = await serviceClient
    .from("profiles")
    .update({ role: "student", updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/hq-core-updateptn/admins");
  return { success: true };
}
