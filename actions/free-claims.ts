"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateFreeClaimAction(claimId: string, status: "approved" | "rejected") {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Tidak terautentikasi. Silakan login kembali." };
    }

    const { error } = await supabase
      .from("free_access_requests")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", claimId);

    if (error) {
      console.error("Error updating free access request:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Unexpected error in updateFreeClaimAction:", err);
    return { success: false, error: err.message || "Gagal memperbarui status klaim" };
  }
}
