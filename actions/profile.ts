"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi tidak valid. Silakan login ulang." };
  }

  const fullName = formData.get("fullName") as string;
  const asalSekolah = formData.get("asalSekolah") as string;
  const targetUniv = formData.get("targetUniv") as string;
  const targetProdi = formData.get("targetProdi") as string;
  const bio = formData.get("bio") as string;
  const provinsi = formData.get("provinsi") as string;

  if (!fullName?.trim()) {
    return { error: "Nama lengkap tidak boleh kosong." };
  }

  const avatarUrl = formData.get("avatarUrl") as string;

  // 1. Update auth metadata
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      ...user.user_metadata,
      full_name: fullName.trim(),
      asal_sekolah: asalSekolah?.trim() || "",
      target_univ: targetUniv?.trim() || "",
      target_prodi: targetProdi?.trim() || "",
      bio: bio?.trim() || "",
      provinsi: provinsi?.trim() || "",
      avatar_url: avatarUrl?.trim() || "",
      // keep legacy
      target_ptn: targetUniv?.trim() || "",
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  // 2. Update profiles table directly agar leaderboard langsung realtime
  await supabase.from("profiles").upsert({
    id: user.id,
    full_name: fullName.trim(),
    asal_sekolah: asalSekolah?.trim() || "",
    target_ptn: targetUniv?.trim() || "",
    target_prodi: targetProdi?.trim() || "",
    bio: bio?.trim() || "",
    provinsi: provinsi?.trim() || "",
  }, { onConflict: "id" });

  revalidatePath("/profile");
  revalidatePath("/dashboard/student");
  revalidatePath("/leaderboard");
  return { success: true };
}


export async function changePasswordAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi tidak valid. Silakan login ulang." };
  }

  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!newPassword || newPassword.length < 6) {
    return { error: "Kata sandi baru minimal 6 karakter." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Konfirmasi kata sandi tidak cocok." };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function sendPasswordResetAction(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email wajib diisi." };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/profile/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function deleteAccountAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi tidak valid. Silakan login ulang." };
  }

  const confirmText = formData.get("confirmText") as string;

  // Require confirmation text
  if (confirmText !== "HAPUS AKUN SAYA") {
    return { error: "Konfirmasi tidak sesuai. Ketik 'HAPUS AKUN SAYA' dengan benar." };
  }

  try {
    // Use service role to delete user data (bypass RLS)
    const { createClient: createServiceClient } = await import("@supabase/supabase-js");
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // 1. Delete related data first (cascade delete might not work for all)
    // Delete results
    await serviceClient.from("results").delete().eq("user_id", user.id);
    
    // Delete subscriptions
    await serviceClient.from("subscriptions").delete().eq("user_id", user.id);
    
    // Delete payments
    await serviceClient.from("payments").delete().eq("user_id", user.id);
    
    // Delete free_claims
    await serviceClient.from("free_claims").delete().eq("user_id", user.id);
    
    // Delete affiliate data if exists
    await serviceClient.from("affiliate_referrals").delete().eq("referred_user_id", user.id);
    await serviceClient.from("affiliate_clicks").delete().eq("user_id", user.id);
    
    // Delete profile
    await serviceClient.from("profiles").delete().eq("id", user.id);

    // 2. Delete auth user (this will cascade to auth.identities)
    const { error: deleteError } = await serviceClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error("Error deleting user from auth:", deleteError);
      return { error: "Gagal menghapus akun. Silakan hubungi admin." };
    }

    // 3. Sign out current session
    await supabase.auth.signOut();

    return { success: true };
  } catch (err: any) {
    console.error("Error in deleteAccountAction:", err);
    return { error: "Terjadi kesalahan saat menghapus akun. Silakan coba lagi." };
  }
}
