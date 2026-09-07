import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/midtrans/cancel
 * Cancel a pending Midtrans transaction
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get order_id from request body
    const { order_id } = await request.json();

    if (!order_id) {
      return NextResponse.json({ error: "order_id is required" }, { status: 400 });
    }

    // Verify payment exists
    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("*")
      .eq("order_id", order_id)
      .single();

    if (fetchError || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Only allow canceling pending transactions
    if (payment.status !== "pending") {
      return NextResponse.json(
        { error: `Cannot cancel ${payment.status} transaction` },
        { status: 400 }
      );
    }

    // Call Midtrans Cancel API
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      return NextResponse.json(
        { error: "Midtrans server key not configured" },
        { status: 500 }
      );
    }

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

    if (!cancelResponse.ok) {
      console.error("Midtrans cancel error:", cancelData);
      return NextResponse.json(
        {
          error: cancelData.status_message || "Failed to cancel transaction at Midtrans",
          details: cancelData,
        },
        { status: cancelResponse.status }
      );
    }

    // Update payment status in database
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status: "cancel",
        transaction_status: "cancel",
        metadata: {
          ...payment.metadata,
          cancelled_at: new Date().toISOString(),
          cancelled_by: user.id,
          midtrans_cancel_response: cancelData,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", order_id);

    if (updateError) {
      console.error("Failed to update payment status:", updateError);
      return NextResponse.json(
        { error: "Transaction cancelled at Midtrans but failed to update database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Transaction cancelled successfully",
      data: cancelData,
    });
  } catch (error) {
    console.error("Cancel transaction error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
