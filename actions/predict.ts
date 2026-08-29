"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";
import { FREE_TIERS } from "@/lib/subscription-helpers";

const FREE_PREDICTION_LIMIT = 2;
const ADMIN_EMAILS = ["updateptnid@gmail.com", "admin@updateptn.id"];

// Admin client — bypass RLS sepenuhnya
function getAdmin() {
  return createAdminSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function calculateProbabilityAction(payload: {
  score: number;
  universityName: string;
  prodiId: string | number;
}) {
  const { score, universityName: inputUnivName, prodiId } = payload;

  // 1. Auth check
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return {
      success: false,
      error: "Unauthorized",
      message: "Kamu harus login terlebih dahulu untuk menggunakan fitur Cek Peluang PTN.",
    };
  }

  const admin = getAdmin();
  const now = new Date().toISOString();

  // 2. Cek subscription aktif dari tabel subscriptions
  const { data: subscription } = await admin
    .from("subscriptions")
    .select("tier, status, expires_at")
    .eq("user_id", user.id)
    .eq("status", "active")
    .gt("expires_at", now)
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const isSubscribed =
    !!subscription &&
    subscription.status === "active" &&
    !FREE_TIERS.includes(subscription.tier) &&
    new Date(subscription.expires_at) > new Date();

  const tier = subscription?.tier || "Basic";

  // 3. Cek apakah admin
  const { data: profile } = await admin
    .from("profiles")
    .select("prediction_count, role")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin =
    ADMIN_EMAILS.includes(user.email?.toLowerCase() || "") ||
    profile?.role === "admin";

  const currentCount: number = profile?.prediction_count ?? 0;

  // 4. Block kalau kuota habis
  if (!isSubscribed && !isAdmin && currentCount >= FREE_PREDICTION_LIMIT) {
    return {
      success: false,
      error: "QuotaExceeded",
      message: `Kamu sudah menggunakan ${FREE_PREDICTION_LIMIT}x prediksi gratis. Upgrade ke Paket SNBT untuk analisis unlimited!`,
      remainingPredictions: 0,
      needsUpgrade: true,
    };
  }

  // 5. Query prodi dari DB
  let passingGrade = 700;
  let majorName = "Program Studi PTN";
  let universityName = inputUnivName || "Universitas Indonesia";

  const { data: prodiRecord } = await supabase
    .from("prodi_reference")
    .select("*")
    .eq("id", prodiId)
    .single();

  if (prodiRecord) {
    passingGrade = Number(prodiRecord.passing_grade_est) || 700;
    majorName = `${prodiRecord.jenjang ? `${prodiRecord.jenjang} ` : ""}${prodiRecord.prodi}`;
    universityName = prodiRecord.univ;
  }

  // 6. Hitung prediksi
  const diff = score - passingGrade;
  let percentage = 75;
  let status: "AMAN" | "BERSAING" | "RENTAN" = "BERSAING";
  let recommendation = "";

  if (diff >= 20) {
    status = "AMAN";
    percentage = Math.min(98, Math.round(85 + (diff - 20) * 0.4));
    recommendation = `Skor kamu (${score}) berada +${diff.toFixed(1)} poin di atas estimasi ketetatan (${passingGrade}). Peluang kelulusan kamu di ${majorName} - ${universityName} SANGAT TINGGI (Pilihan Sangat Aman)!`;
  } else if (diff >= 0) {
    status = "BERSAING";
    percentage = Math.round(60 + (diff / 20) * 24);
    recommendation = `Skor kamu (${score}) melampaui estimasi passing grade (${passingGrade}) sebesar +${diff.toFixed(1)} poin. Kamu berada di zona kompetisi aktif. Tingkatkan 15-20 poin di Try Out berikutnya agar makin mantap!`;
  } else {
    status = "RENTAN";
    percentage = Math.max(25, Math.round(60 + diff * 1.2));
    const gap = Math.abs(diff).toFixed(1);
    recommendation = `Skor kamu (${score}) masih berjarak ${gap} poin di bawah estimasi ketetatan (${passingGrade}). Disarankan untuk meningkatkan latihan subtes lemah atau mempertimbangkan jurusan ini di Pilihan 2.`;
  }

  // 7. Increment counter via admin client (pasti bypass RLS)
  if (!isSubscribed && !isAdmin) {
    const { error: updateErr } = await admin
      .from("profiles")
      .update({ prediction_count: currentCount + 1 })
      .eq("id", user.id);

    if (updateErr) {
      console.error("[predict] GAGAL increment prediction_count:", updateErr);
    } else {
      console.log(`[predict] prediction_count user ${user.id}: ${currentCount} → ${currentCount + 1}`);
    }
  }

  const newCount = isSubscribed || isAdmin ? currentCount : currentCount + 1;
  const remainingPredictions = isSubscribed || isAdmin
    ? 999
    : Math.max(0, FREE_PREDICTION_LIMIT - newCount);

  return {
    success: true,
    score,
    passingGrade,
    diff,
    percentage,
    status,
    majorName,
    universityName,
    recommendation,
    remainingPredictions,
    isSubscribed: isSubscribed || isAdmin,
    tier: isAdmin ? "Admin" : tier,
  };
}
