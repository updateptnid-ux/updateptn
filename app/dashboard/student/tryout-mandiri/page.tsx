import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { MotionCard } from "@/components/ui/fade-in";
import MandiriTryoutFilter from "@/components/student/MandiriTryoutFilter";
import { GraduationCap, Building2 } from "lucide-react";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function TryoutMandiriPage() {
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

  // 2. Fetch Mandiri tryouts + subscription
  const [
    { data: tryoutsData },
    { data: subData }
  ] = await Promise.all([
    supabase
      .from("tryouts")
      .select("id, title, description, duration_minutes, total_questions, is_free, mandiri_category, allow_free_claim")
      .eq("tryout_type", "mandiri")
      .order("created_at", { ascending: false }),

    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .gt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(1)
  ]);

  const activeTryouts = tryoutsData && tryoutsData.length > 0 ? tryoutsData : [];
  const activeSubscription = subData?.[0] || null;

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-3 md:p-4 space-y-4 md:space-y-6">
        {/* Header */}
        <MotionCard className="rounded-lg md:rounded-xl">
          <div className="bg-blue-50 border-2 border-blue-200 p-5 md:p-8 rounded-lg md:rounded-xl">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-600 text-white text-[10px] md:text-xs font-bold">
                  <Building2 className="h-3 w-3 mr-1" />
                  Ujian Mandiri 2026
                </Badge>
              </div>
              <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                Try Out Mandiri PTN
              </h1>
              <div className="space-y-3">
                <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                  Simulasi ujian mandiri berbagai universitas ternama. Persiapkan dirimu untuk seleksi mandiri PTN favoritmu!
                </p>
                <div className="bg-white/80 rounded-xl p-4 space-y-2.5 border border-blue-200">
                  <p className="text-xs md:text-sm font-bold text-slate-900">📚 Apa itu Ujian Mandiri?</p>
                  <ul className="space-y-1.5 text-xs md:text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold shrink-0">•</span>
                      <span><strong>Jalur ketiga</strong> masuk PTN setelah SNBP dan SNBT</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold shrink-0">•</span>
                      <span>Setiap PTN punya <strong>format soal sendiri</strong> (beda kampus, beda soal)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold shrink-0">•</span>
                      <span>Biasanya ujian berlangsung <strong>Juli - Agustus</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold shrink-0">•</span>
                      <span>Contoh: Ujian Mandiri UI (SIMAK UI), UGM (UM UGM), ITB (UM ITB)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </MotionCard>

        {/* Try Outs List with interactive filter tabs */}
        {activeTryouts.length === 0 ? (
          <MotionCard className="rounded-lg md:rounded-xl">
            <div className="bg-white border border-slate-200 rounded-lg md:rounded-xl p-8 md:p-12 text-center space-y-3">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-2xl bg-blue-50 text-blue-400 flex items-center justify-center">
                  <GraduationCap className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Belum Ada Try Out Mandiri</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Try Out Mandiri sedang dipersiapkan. Nantikan jadwal terbaru dari UpdatePTN!
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
          <MandiriTryoutFilter
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
