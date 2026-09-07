import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { affiliateId } = await request.json();

    if (!affiliateId) {
      return NextResponse.json(
        { success: false, error: "Missing affiliateId" },
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

    // Delete affiliate (CASCADE akan otomatis hapus commissions, withdrawals, referrals)
    const { error: deleteError } = await serviceSupabase
      .from("affiliates")
      .delete()
      .eq("id", affiliateId);

    if (deleteError) {
      console.error("Delete affiliate error:", deleteError);
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "Affiliate dan semua data terkait berhasil dihapus"
    });
    
  } catch (err: any) {
    console.error("API delete affiliate error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
