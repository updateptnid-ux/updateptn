import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { MotionCard } from "@/components/ui/fade-in";
import StudentTryoutList from "@/components/StudentTryoutList";
import { FileText, Sparkles } from "lucide-react";

import { AkbarCountdownTimer } from "@/components/student/AkbarCountdownTimer";
import { TryoutSnbtTools } from "@/components/student/TryoutSnbtTools";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function TryoutSnbtPage() {
  const supabase = await createClient();

  // 1. Fetch user session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-6 text-center bg-white rounded-lg shadow">
          <p className="text-slate-600 mb-4">Sesi tidak valid. Silakan login kembali.</p>
          <a href="/login" className="text-blue-600 hover:underline font-semibold">
            Kembali ke Login
          </a>
        </div>
      </div>
    );
  }

  // 2. Fetch SNBT tryouts + subscription + marketing flag
  const [
    { data: tryoutsData },
    { data: subData },
    { data: profileData }
  ] = await Promise.all([
    supabase
      .from("tryouts")
      .select("id, title, description, duration_minutes, total_questions, is_free, allow_free_claim")
      .eq("tryout_type", "snbt")
      .order("title", { ascending: true }),

    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .gt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(1),

    supabase
      .from("profiles")
      .select("role, is_marketing, free_access")
      .eq("id", user.id)
      .maybeSingle()
  ]);

  const isMarketing = Boolean(profileData?.is_marketing || profileData?.free_access);
  const activeSubscription = isMarketing
    ? { id: "marketing-vip", status: "active", tier: "Platinum", expires_at: "2099-12-31T23:59:59.000Z" }
    : (subData?.[0] || null);

  const rawTryouts = tryoutsData && tryoutsData.length > 0 ? tryoutsData : [];
  const activeTryouts = [...rawTryouts].sort((a, b) => {
    const numA = parseInt(a.title.replace(/\D/g, "") || "0", 10);
    const numB = parseInt(b.title.replace(/\D/g, "") || "0", 10);
    if (numA !== numB) return numA - numB;
    return a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: "base" });
  });

  return (
    <div className="w-full min-h-full bg-slate-50 overflow-y-auto overscroll-contain">
      <div className="max-w-4xl mx-auto p-3 md:p-4 space-y-4 md:space-y-6 pb-20">
        {/* Header */}
        <MotionCard className="rounded-lg md:rounded-xl">
          <div className="bg-blue-50 border-2 border-blue-200 p-5 md:p-8 rounded-lg md:rounded-xl">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-600 text-white text-[10px] md:text-xs font-bold">
                  <Sparkles className="h-3 w-3 mr-1" />
                  UTBK-SNBT 2027
                </Badge>
              </div>
              <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                Try Out SNBT
              </h1>
              <p className="text-sm md:text-base text-slate-600 max-w-xl leading-relaxed">
                Simulasi Try Out berbasis IRT sesuai standar resmi UTBK-SNBT. Latih kemampuanmu
                dengan soal TPS & Literasi berkualitas tinggi.
              </p>
            </div>
          </div>
        </MotionCard>

        {/* Akbar Countdown Timer */}
        <AkbarCountdownTimer targetDate="2026-10-15T08:00:00+07:00" title="Try Out Akbar UTBK-SNBT 2027 Nasional" />

        {/* Tools Try Out SNBT Breakdown */}
        <TryoutSnbtTools />
        {activeTryouts.length === 0 ? (
          <MotionCard className="rounded-lg md:rounded-xl">
            <div className="bg-white border border-slate-200 rounded-lg md:rounded-xl p-8 md:p-12 text-center space-y-3">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-2xl bg-blue-50 text-blue-400 flex items-center justify-center">
                  <FileText className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Belum Ada Try Out SNBT</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Try Out SNBT sedang dipersiapkan. Nantikan jadwal terbaru dari UpdatePTN!
              </p>
              <Link
                href="/dashboard/student"
                className="inline-block text-sm text-blue-600 font-semibold hover:underline mt-2"
              >
                ← Kembali ke Dashboard
              </Link>
            </div>
          </MotionCard>
        ) : (
          <StudentTryoutList
            tryouts={activeTryouts}
            userId={user.id}
            userName={user.user_metadata?.full_name || ""}
            userEmail={user.email || ""}
            initialSubscription={activeSubscription}
          />
        )}
      </div>
    </div>
  );
}
