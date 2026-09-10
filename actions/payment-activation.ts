"use server";

import { createClient as createAdminSupabase } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createAdminSupabase(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Otomatis aktivasi paket dan pencatatan pembayaran (auto-approve)
 * Dipanggil seketika saat user menyelesaikan transaksi pembelian paket apa pun.
 */
export async function activateSuccessfulPaymentAction(orderId: string) {
  if (!orderId) {
    return { success: false, error: "Order ID tidak valid" };
  }

  try {
    const admin = getAdminClient();
    const nowIso = new Date().toISOString();

    // 1. Cari data payment berdasarkan order_id
    const { data: payment, error: paymentFetchError } = await admin
      .from("payments")
      .select("*")
      .eq("order_id", orderId)
      .maybeSingle();

    if (paymentFetchError) {
      console.error("Error fetching payment for activation:", paymentFetchError);
    }

    // 2. Update payment ke status success / settlement
    if (payment) {
      await admin
        .from("payments")
        .update({
          status: "success",
          transaction_status: "settlement",
          updated_at: nowIso,
        })
        .eq("order_id", orderId);
    }

    // 3. Ambil data metadata (subscription_id, tier, duration, user_id, user_email)
    const metadata = (payment?.metadata as any) || {};
    const subscriptionId = metadata.subscription_id;
    const tier = metadata.tier || "Premium";
    const userId = payment?.user_id || metadata.user_id;
    const userEmail = metadata.user_email;

    // 4. Update status subscription menjadi 'active' (Auto-Approve)
    let activatedSubId = subscriptionId;

    if (subscriptionId) {
      await admin
        .from("subscriptions")
        .update({
          status: "active",
          updated_at: nowIso,
        })
        .eq("id", subscriptionId);
    } else if (userEmail) {
      // Cari subscription pending/terbaru dari user ini
      const { data: sub } = await admin
        .from("subscriptions")
        .select("id")
        .eq("user_email", userEmail)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sub) {
        activatedSubId = sub.id;
        await admin
          .from("subscriptions")
          .update({
            status: "active",
            updated_at: nowIso,
          })
          .eq("id", sub.id);
      }
    }

    // 5. Update user profile ke is_premium: true & status active
    if (userId) {
      await admin
        .from("profiles")
        .update({
          is_premium: true,
          subscription_status: "active",
          subscription_tier: tier,
          updated_at: nowIso,
        })
        .eq("id", userId);
    }

    // 6. Jika ada komisi afiliasi, otomatis approve
    if (payment?.id) {
      await admin
        .from("commissions")
        .update({
          status: "approved",
          approved_at: nowIso,
        })
        .eq("payment_id", payment.id)
        .eq("status", "pending");
    }

    console.log(`✅ [activateSuccessfulPaymentAction] Auto-approve sukses untuk order: ${orderId}`);
    return {
      success: true,
      message: "Paket berhasil diaktifkan secara otomatis",
      orderId,
      subscriptionId: activatedSubId,
    };
  } catch (error: any) {
    console.error("❌ [activateSuccessfulPaymentAction] Gagal:", error);
    return { success: false, error: error.message || "Gagal mengaktifkan paket" };
  }
}
