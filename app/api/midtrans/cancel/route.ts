import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const ADMIN_EMAILS = ["updateptnid@gmail.com", "admin@updateptn.id"];

function getPrivilegedClient(userClient: any) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey) {
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { persistSession: false } }
    );
  }
  return userClient;
}

/**
 * POST /api/midtrans/cancel
 * Cancel a pending Midtrans transaction
 * Supported for both the payment owner and admin users
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Verify authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Extract order_id
    const { order_id } = await request.json();

    if (!order_id) {
      return NextResponse.json({ error: "order_id is required" }, { status: 400 });
    }

    const privilegedDb = getPrivilegedClient(supabase);

    // 3. Verify payment exists
    const { data: payment, error: fetchError } = await privilegedDb
      .from("payments")
      .select("*")
      .eq("order_id", order_id)
      .single();

    if (fetchError || !payment) {
      return NextResponse.json({ error: "Pembayaran tidak ditemukan" }, { status: 404 });
    }

    // 4. Authorization check: payment owner OR admin
    const isOwner = payment.user_id === user.id;
    const isSuperAdminEmail = ADMIN_EMAILS.includes(user.email?.toLowerCase() || "");
    
    let isAdmin = isSuperAdminEmail;
    if (!isAdmin) {
      const { data: profile } = await privilegedDb
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.role === "admin") {
        isAdmin = true;
      }
    }

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Anda tidak memiliki akses untuk membatalkan transaksi ini" },
        { status: 403 }
      );
    }

    // 5. Only allow canceling pending transactions (if already cancelled/expired, return idempotent success)
    if (payment.status === "cancel" || payment.status === "cancelled") {
      return NextResponse.json({
        success: true,
        message: "Transaksi sudah dalam status dibatalkan",
        data: payment,
      });
    }

    if (payment.status !== "pending") {
      return NextResponse.json(
        { error: `Tidak dapat membatalkan transaksi dengan status ${payment.status}` },
        { status: 400 }
      );
    }

    // 6. Call Midtrans Cancel API
    let midtransCancelResult: any = null;
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (serverKey) {
      try {
        const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
        const midtransBaseUrl = isProduction
          ? "https://api.midtrans.com"
          : "https://api.sandbox.midtrans.com";

        const authHeader = Buffer.from(serverKey + ":").toString("base64");

        const cancelResponse = await fetch(
          `${midtransBaseUrl}/v2/${order_id}/cancel`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Basic ${authHeader}`,
            },
          }
        );

        midtransCancelResult = await cancelResponse.json();

        if (!cancelResponse.ok) {
          console.warn("Midtrans cancel API returned non-200:", midtransCancelResult);
          // If transaction is 404/412/expired at Midtrans, we proceed with updating DB to cancel
        }
      } catch (mErr: any) {
        console.warn("Midtrans cancel fetch error:", mErr.message);
        midtransCancelResult = { error: mErr.message };
      }
    }

    // 7. Update payment status in database using privileged client (bypasses RLS issues)
    const nowIso = new Date().toISOString();
    const updatedMetadata = {
      ...(payment.metadata || {}),
      cancelled_at: nowIso,
      cancelled_by: user.id,
      cancelled_by_email: user.email,
      midtrans_cancel_response: midtransCancelResult,
    };

    const statusCandidates = ["cancelled", "cancel", "failed"];
    let updatedPayment: any = null;
    let updateError: any = null;

    for (const statusVal of statusCandidates) {
      const { data, error } = await privilegedDb
        .from("payments")
        .update({
          status: statusVal,
          transaction_status: "cancel",
          metadata: updatedMetadata,
          updated_at: nowIso,
        })
        .eq("order_id", order_id)
        .select()
        .single();

      if (!error) {
        updatedPayment = data;
        updateError = null;
        break;
      }

      if (
        error.message?.includes("payments_status_check") ||
        error.code === "23514"
      ) {
        updateError = error;
        continue;
      } else {
        updateError = error;
        break;
      }
    }

    if (updateError || !updatedPayment) {
      console.error("Failed to update payment status in Supabase:", updateError);
      return NextResponse.json(
        { error: "Gagal memperbarui status transaksi di database: " + (updateError?.message || "Check constraint violation") },
        { status: 500 }
      );
    }

    // 8. If associated pending subscription exists, cancel it
    if (payment.metadata?.subscription_id) {
      try {
        await privilegedDb
          .from("subscriptions")
          .update({ status: "cancelled", updated_at: nowIso })
          .eq("id", payment.metadata.subscription_id)
          .eq("status", "pending");
      } catch (subErr) {
        console.warn("Subscription cancel error:", subErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Transaksi berhasil dibatalkan",
      data: updatedPayment || { order_id, status: "cancel" },
    });
  } catch (error: any) {
    console.error("Cancel transaction error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
