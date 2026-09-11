import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = ["updateptnid@gmail.com", "admin@updateptn.id"];

/**
 * Helper to get an admin-privileged Supabase client using SUPABASE_SERVICE_ROLE_KEY
 * or fallback to user session client.
 */
function getAdminSupabase(userClient: any) {
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
 * Verify whether the authenticated user is an authorized admin
 */
async function verifyAdmin(supabase: any) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { authorized: false, user: null, error: "Unauthorized" };
  }

  const userEmail = user.email?.toLowerCase() || "";
  const isSuperAdminEmail = ADMIN_EMAILS.includes(userEmail);

  if (isSuperAdminEmail) {
    return { authorized: true, user, error: null };
  }

  // Check role in profiles table
  const adminDb = getAdminSupabase(supabase);
  const { data: profile } = await adminDb
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") {
    return { authorized: true, user, error: null };
  }

  return { authorized: false, user, error: "Forbidden: Admin access required" };
}

/**
 * GET /hq-core-updateptn/api/payments
 * Admin-only: Fetch all payment transactions with student profile details
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { authorized, error: authError } = await verifyAdmin(supabase);

    if (!authorized) {
      return NextResponse.json({ error: authError }, { status: 403 });
    }

    const adminDb = getAdminSupabase(supabase);

    // 1. Fetch payments
    const { data: paymentsData, error: paymentsError } = await adminDb
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (paymentsError) {
      console.error("Admin Payments GET error:", paymentsError);
      return NextResponse.json(
        { error: "Gagal mengambil data pembayaran: " + paymentsError.message },
        { status: 500 }
      );
    }

    const payments = paymentsData || [];

    // 2. Fetch profiles for user enrichment
    const userIds = [
      ...new Set(payments.map((p: any) => p.user_id).filter(Boolean)),
    ];

    const profileMap = new Map<string, { email?: string; full_name?: string }>();

    if (userIds.length > 0) {
      const { data: profiles } = await adminDb
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);

      if (profiles) {
        profiles.forEach((prof: any) => {
          profileMap.set(prof.id, prof);
        });
      }
    }

    // 3. Enrich payments with profile data
    const enrichedPayments = payments.map((p: any) => {
      const userProfile = profileMap.get(p.user_id);
      return {
        ...p,
        user_email: userProfile?.email || "N/A",
        user_name: userProfile?.full_name || "Unknown User",
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedPayments,
      count: enrichedPayments.length,
    });
  } catch (err: any) {
    console.error("Admin Payments GET exception:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /hq-core-updateptn/api/payments
 * Admin-only: Cancel or permanently delete a transaction
 * Body: { order_id: string, action?: 'cancel' | 'delete' }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { authorized, user, error: authError } = await verifyAdmin(supabase);

    if (!authorized || !user) {
      return NextResponse.json({ error: authError }, { status: 403 });
    }

    const body = await request.json();
    const { order_id, action = "cancel" } = body;

    if (!order_id) {
      return NextResponse.json(
        { error: "Parameter order_id wajib disertakan" },
        { status: 400 }
      );
    }

    const adminDb = getAdminSupabase(supabase);

    // 1. Fetch payment record
    const { data: payment, error: fetchError } = await adminDb
      .from("payments")
      .select("*")
      .eq("order_id", order_id)
      .single();

    if (fetchError || !payment) {
      return NextResponse.json(
        { error: "Transaksi dengan order_id tersebut tidak ditemukan" },
        { status: 404 }
      );
    }

    // 2. Action: DELETE (Permanent removal)
    if (action === "delete") {
      // Clean up foreign keys / associated records
      try {
        await adminDb.from("commissions").delete().eq("order_id", order_id);
      } catch (err) {
        console.warn("No commission to delete or ignored:", err);
      }

      if (payment.metadata?.subscription_id) {
        try {
          await adminDb
            .from("subscriptions")
            .delete()
            .eq("id", payment.metadata.subscription_id)
            .eq("status", "pending");
        } catch (err) {
          console.warn("No subscription to delete or ignored:", err);
        }
      }

      const { error: deleteError } = await adminDb
        .from("payments")
        .delete()
        .eq("order_id", order_id);

      if (deleteError) {
        console.error("Delete payment error:", deleteError);
        return NextResponse.json(
          { error: "Gagal menghapus pembayaran dari database: " + deleteError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: "delete",
        message: `Transaksi ${order_id} berhasil dihapus permanen`,
      });
    }

    // 3. Action: CANCEL (Update status to 'cancel')
    let midtransStatusInfo: any = null;

    // Call Midtrans Cancel API if configured
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

        const cancelData = await cancelResponse.json();
        midtransStatusInfo = cancelData;
        console.log("Midtrans cancel API response for", order_id, ":", cancelData);
      } catch (midtransErr: any) {
        console.warn(
          "Midtrans cancel network error (proceeding with DB update):",
          midtransErr.message
        );
        midtransStatusInfo = { error: midtransErr.message };
      }
    }

    // Update payment record in Supabase database
    const nowIso = new Date().toISOString();
    const updatedMetadata = {
      ...(payment.metadata || {}),
      cancelled_at: nowIso,
      cancelled_by: user.id,
      cancelled_by_email: user.email,
      midtrans_cancel_result: midtransStatusInfo,
    };

    // Adaptive status candidate list:
    // 1. 'cancelled' (Application standard & common constraint)
    // 2. 'cancel' (Midtrans standard)
    // 3. 'failed' (Fallback if DB only allows pending, success, failed)
    const statusCandidates = ["cancelled", "cancel", "failed"];
    let updatedPayment: any = null;
    let updateError: any = null;

    for (const statusVal of statusCandidates) {
      const { data, error } = await adminDb
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

      // If check constraint violation (code 23514 or message contains payments_status_check), try next candidate
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
      console.error("Update payment to cancel error:", updateError);
      return NextResponse.json(
        { error: "Gagal memperbarui status transaksi di database: " + (updateError?.message || "Check constraint violation") },
        { status: 500 }
      );
    }

    // Cancel any associated pending subscription
    if (payment.metadata?.subscription_id) {
      try {
        await adminDb
          .from("subscriptions")
          .update({ status: "cancelled", updated_at: nowIso })
          .eq("id", payment.metadata.subscription_id)
          .eq("status", "pending");
      } catch (subErr) {
        console.warn("Failed updating associated subscription status:", subErr);
      }
    }

    return NextResponse.json({
      success: true,
      action: "cancel",
      message: `Transaksi ${order_id} berhasil dibatalkan`,
      data: updatedPayment,
    });
  } catch (err: any) {
    console.error("Admin Payments POST exception:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
