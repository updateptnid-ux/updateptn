import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { affiliateId, status } = await request.json();

    if (!affiliateId || !status) {
      return NextResponse.json(
        { success: false, error: "Missing affiliateId or status" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Check if admin (from profile role OR hardcoded admin emails)
    const ADMIN_EMAILS = ["updateptnid@gmail.com", "admin@updateptn.id"];
    const isAdmin = profile?.role === "admin" || ADMIN_EMAILS.includes(user.email?.toLowerCase() || "");

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // Use Service Role to bypass RLS
    const { createClient: createServiceClient } = await import("@supabase/supabase-js");
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Generate unique promo code & create voucher when approving
    let promoCode = null;
    if (status === "active") {
      // Call database function to generate unique code
      const { data: codeData, error: codeError } = await serviceSupabase
        .rpc("generate_affiliate_code");
      
      if (codeError) {
        console.error("Error generating promo code:", codeError);
        return NextResponse.json(
          { success: false, error: "Gagal generate kode promo" },
          { status: 500 }
        );
      }
      
      promoCode = codeData;
      console.log(`✅ Generated promo code: ${promoCode}`);

      // Create voucher for this affiliate
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1); // Valid 1 year

      const { error: voucherError } = await serviceSupabase
        .from("vouchers")
        .insert({
          code: promoCode,
          discount_type: "percentage",
          value: "10", // 10% discount
          category: "universal",
          usage_limit: 9999, // Unlimited usage
          usage_count: 0,
          status: "active",
          expires_at: expiresAt.toISOString(),
          affiliate_id: affiliateId, // Link to affiliate
        });

      if (voucherError) {
        console.error("Error creating voucher:", voucherError);
        return NextResponse.json(
          { success: false, error: "Gagal membuat voucher affiliate" },
          { status: 500 }
        );
      }

      console.log(`✅ Voucher created: ${promoCode} for affiliate ${affiliateId}`);
    }

    // Update affiliate status (and code if active)
    const updateData: any = {
      status,
      approved_at: status === "active" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    // Add affiliate_code if approving
    if (status === "active" && promoCode) {
      updateData.affiliate_code = promoCode;
    }

    const { error: updateError } = await serviceSupabase
      .from("affiliates")
      .update(updateData)
      .eq("id", affiliateId);

    if (updateError) {
      console.error("Update affiliate error:", updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      promoCode: promoCode || undefined  // Return the generated code
    });
    
  } catch (err: any) {
    console.error("API approve affiliate error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
