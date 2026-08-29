import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

const FREE_LIMIT = 2;

// Admin client yang bypass RLS sepenuhnya
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// GET /api/prediction-count — ambil sisa kuota user yang sedang login
export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = getAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .select("prediction_count, subscription_status, subscription_tier, role")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const count = data?.prediction_count ?? 0;
    const isSubscribed = data?.subscription_status === "active";
    const isAdmin =
      ["updateptnid@gmail.com", "admin@updateptn.id"].includes(user.email?.toLowerCase() || "") ||
      data?.role === "admin";

    return NextResponse.json({
      count,
      remaining: isSubscribed || isAdmin ? 999 : Math.max(0, FREE_LIMIT - count),
      isSubscribed: isSubscribed || isAdmin,
      tier: data?.subscription_tier || "Basic",
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/prediction-count — increment counter (dipanggil dari server action)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = getAdminClient();

    // Baca count terbaru dulu
    const { data: profile } = await admin
      .from("profiles")
      .select("prediction_count, subscription_status, role")
      .eq("id", user.id)
      .maybeSingle();

    const count = profile?.prediction_count ?? 0;
    const isSubscribed = profile?.subscription_status === "active";
    const isAdmin =
      ["updateptnid@gmail.com", "admin@updateptn.id"].includes(user.email?.toLowerCase() || "") ||
      profile?.role === "admin";

    // Jangan increment kalau subscribed/admin
    if (isSubscribed || isAdmin) {
      return NextResponse.json({ success: true, count, remaining: 999 });
    }

    // Increment pakai admin client (bypass RLS)
    const { error: updateError } = await admin
      .from("profiles")
      .update({ prediction_count: count + 1 })
      .eq("id", user.id);

    if (updateError) {
      console.error("[prediction-count POST] update error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const newCount = count + 1;
    return NextResponse.json({
      success: true,
      count: newCount,
      remaining: Math.max(0, FREE_LIMIT - newCount),
    });
  } catch (err) {
    console.error("[prediction-count POST] catch:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
