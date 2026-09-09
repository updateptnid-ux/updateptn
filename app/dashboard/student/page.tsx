import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StaggerContainer, StaggerItem, MotionCard } from "@/components/ui/fade-in";
import { getUnivLogoUrl, getUnivInitials } from "@/lib/univ-logo";
import { isPremiumTier } from "@/lib/subscription-helpers";
import ImprovementChart from "@/components/student/ImprovementChart";
import {
  GraduationCap,
  FileText,
  Target,
  TrendingUp,
  Award,
  CreditCard,
  Clock,
} from "lucide-react";

// Force dynamic rendering and disable caching
// TODO: Move to ISR dengan revalidate setelah testing selesai
// export const revalidate = 60; // Cache 60 seconds
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function StudentDashboardPage() {
  const supabase = await createClient();

  // 1. Fetch user session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // If there's an error fetching user or no user found
  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return (
      <div className="max-w-6xl mx-auto space-y-8 p-6">
        <div className="p-6 text-center bg-white rounded-lg shadow">
          <p className="text-slate-600 mb-4">Sesi tidak valid. Silakan login kembali.</p>
          <a href="/login" className="text-blue-600 hover:underline font-semibold">
            Kembali ke Login
          </a>
        </div>
      </div>
    );
  }

  // 2. Parallel data fetching untuk performa optimal
  const [
    { data: resultsData },
    { data: subData },
    { data: pendingPayments },
    { data: profileData }
  ] = await Promise.all([
    supabase
      .from("results")
      .select("*, tryouts(title)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .gt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(1),
    
    supabase
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false }),
    
    supabase
      .from("profiles")
      .select("asal_sekolah, target_ptn, target_prodi, target_ptn_2, target_prodi_2")
      .eq("id", user.id)
      .single()
  ]);

  // 3. Process results
  const userResultsCount = resultsData?.length || 0;
  const lastResult = resultsData?.[0] || null;
  const activeSubscription = subData?.[0] || null;
  const hasPendingPayments = (pendingPayments?.length || 0) > 0;
  const pendingPaymentCount = pendingPayments?.length || 0;

  // Use profile data as source of truth, fallback to user_metadata
  const asalSekolah = profileData?.asal_sekolah || (user?.user_metadata?.asal_sekolah as string | undefined);
  const targetUniv = profileData?.target_ptn || (user?.user_metadata?.target_univ as string | undefined) || (user?.user_metadata?.target_ptn as string | undefined);
  const targetProdi = profileData?.target_prodi || (user?.user_metadata?.target_prodi as string | undefined);
  const targetUniv2 = profileData?.target_ptn_2 || (user?.user_metadata?.target_univ_2 as string | undefined) || (user?.user_metadata?.target_ptn_2 as string | undefined);
  const targetProdi2 = profileData?.target_prodi_2 || (user?.user_metadata?.target_prodi_2 as string | undefined);
  
  // Build display labels for both targets
  const targetLabel =
    targetProdi && targetUniv
      ? `${targetProdi} — ${targetUniv.replace("UNIVERSITAS ", "").replace("INSTITUT ", "")}`
      : targetUniv || targetProdi || null;
  
  const targetLabel2 =
    targetProdi2 && targetUniv2
      ? `${targetProdi2} — ${targetUniv2.replace("UNIVERSITAS ", "").replace("INSTITUT ", "")}`
      : targetUniv2 || targetProdi2 || null;

  return (
    <div className="w-full min-h-full bg-slate-50 overflow-y-auto overscroll-contain">
      <div className="max-w-4xl mx-auto p-3 md:p-4 space-y-3 md:space-y-4 pb-20">
        {/* Header Banner - Compact */}
        <MotionCard className="rounded-lg md:rounded-xl">
          <div className="flex flex-col gap-3 bg-white p-3 md:p-4 rounded-lg md:rounded-xl border border-slate-200">
            <div className="space-y-1">
              <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 font-semibold w-fit">
                Portal UTBK
              </Badge>
              <h1 className="text-base md:text-xl font-bold text-slate-900">
                Halo, {user?.user_metadata?.full_name || "Siswa"}! 👋
              </h1>
              <p className="text-xs md:text-sm text-slate-500">
                Pantau skor dan ikuti Try Out UTBK
              </p>
              {asalSekolah && (
                <p className="text-[10px] md:text-xs text-slate-400 flex items-center gap-1">
                  <span>🏫</span>
                  <span>{asalSekolah}</span>
                </p>
              )}
            </div>

            {/* Cek Peluang Buttons - Show based on subscription */}
            {activeSubscription && isPremiumTier(activeSubscription.tier) ? (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/dashboard/student/cek-peluang" className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg h-9 md:h-10 gap-2 text-xs md:text-sm touch-manipulation">
                    <Target className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span>Cek Peluang SNBT</span>
                  </Button>
                </Link>
                <Link href="/dashboard/student/cek-peluang?type=snbp" className="w-full">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg h-9 md:h-10 gap-2 text-xs md:text-sm touch-manipulation">
                    <Target className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span>Cek Peluang SNBP</span>
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/pricing?feature=cek-peluang" className="w-full">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg h-10 md:h-11 gap-2 text-xs md:text-sm touch-manipulation">
                  <Target className="h-4 w-4" />
                  <span>🔒 Unlock Cek Peluang SNBT & SNBP</span>
                </Button>
              </Link>
            )}
          </div>
        </MotionCard>

        {/* Stat Cards - Compact Grid */}
        <StaggerContainer className="grid grid-cols-3 gap-2 md:gap-3" staggerDelay={0.08}>
          {/* Stat 1 - Compact */}
          <StaggerItem>
            <MotionCard className="h-full rounded-lg md:rounded-xl">
              <Card className="bg-white border border-slate-200 p-2.5 md:p-4 rounded-lg md:rounded-xl space-y-1 md:space-y-2 h-full">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-400">Total TO</span>
                  <div className="h-6 w-6 md:h-8 md:w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="h-3 w-3 md:h-4 md:w-4" />
                  </div>
                </div>
                <p className="text-xl md:text-2xl font-bold text-slate-900">{userResultsCount}</p>
                <p className="text-[9px] md:text-[10px] text-slate-500 font-medium">Diikuti</p>
              </Card>
            </MotionCard>
          </StaggerItem>

          {/* Stat 2 - Compact */}
          <StaggerItem>
            <MotionCard className="h-full rounded-lg md:rounded-xl">
              <Card className="bg-white border border-slate-200 p-2.5 md:p-4 rounded-lg md:rounded-xl space-y-1 md:space-y-2 h-full">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-400">Skor</span>
                  <div className="h-6 w-6 md:h-8 md:w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Award className="h-3 w-3 md:h-4 md:w-4" />
                  </div>
                </div>
                <p className="text-xl md:text-2xl font-bold text-slate-900">
                  {lastResult ? Math.round(Number(lastResult.score)) : "—"}
                </p>
                <p className="text-[9px] md:text-[10px] text-slate-500 font-medium">
                  {lastResult ? "IRT" : "Belum ada"}
                </p>
              </Card>
            </MotionCard>
          </StaggerItem>

          {/* Stat 3 - Target (Dual Display) */}
          <StaggerItem>
            <MotionCard className="h-full rounded-lg md:rounded-xl">
              <Card className="bg-white border border-slate-200 p-2.5 md:p-4 rounded-lg md:rounded-xl space-y-1.5 md:space-y-2 h-full">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-400">Target</span>
                  {targetUniv ? (
                    <Avatar className="h-6 w-6 md:h-8 md:w-8 rounded-lg border border-slate-200 shrink-0">
                      <AvatarImage
                        src={getUnivLogoUrl(targetUniv) ?? undefined}
                        alt={targetUniv}
                        className="object-contain p-0.5"
                      />
                      <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-[10px] rounded-lg">
                        {getUnivInitials(targetUniv)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-6 w-6 md:h-8 md:w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <GraduationCap className="h-3 w-3 md:h-4 md:w-4" />
                    </div>
                  )}
                </div>

                {/* Target Utama */}
                {targetLabel ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 rounded">
                        <Target className="h-2.5 w-2.5 text-blue-600" />
                        <span className="text-[8px] md:text-[9px] font-extrabold text-blue-600 uppercase tracking-wide">Utama</span>
                      </div>
                    </div>
                    <p className="text-[10px] md:text-xs font-bold text-slate-900 leading-tight line-clamp-2">{targetLabel}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-[10px] md:text-xs font-semibold text-slate-400 italic">Belum diset</p>
                    <Link href="/profile" className="text-[9px] md:text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-0.5">
                      <TrendingUp className="h-2.5 w-2.5" />
                      <span>Set Target →</span>
                    </Link>
                  </div>
                )}

                {/* Target Cadangan - Only show if exists */}
                {targetLabel2 && (
                  <div className="pt-1.5 border-t border-slate-200 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 rounded">
                        <Target className="h-2.5 w-2.5 text-amber-600" />
                        <span className="text-[8px] md:text-[9px] font-extrabold text-amber-600 uppercase tracking-wide">Cadangan</span>
                      </div>
                    </div>
                    <p className="text-[10px] md:text-xs font-bold text-slate-700 leading-tight line-clamp-2">{targetLabel2}</p>
                  </div>
                )}
              </Card>
            </MotionCard>
          </StaggerItem>
        </StaggerContainer>

        {/* Pending Payment Alert */}
        {hasPendingPayments && (
          <MotionCard className="rounded-lg md:rounded-xl">
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 p-3 md:p-4 rounded-lg">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-bold text-amber-900">
                      {pendingPaymentCount} Pembayaran Pending
                    </p>
                    <p className="text-[10px] md:text-xs text-amber-700">
                      Lanjutkan pembayaran Anda sekarang
                    </p>
                  </div>
                </div>
                <Link href="/dashboard/student/payments">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white h-8 md:h-9 text-[10px] md:text-xs">
                    Lihat
                  </Button>
                </Link>
              </div>
            </Card>
          </MotionCard>
        )}

        {/* Active Subscription Info */}
        {activeSubscription && (
          <MotionCard className="rounded-lg md:rounded-xl">
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 p-3 md:p-4 rounded-lg">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-green-600 text-white flex items-center justify-center shrink-0">
                    {activeSubscription.tier === 'gold' ? '👑' : '⭐'}
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-bold text-green-900 capitalize">
                      Paket {activeSubscription.tier}
                    </p>
                    <p className="text-[10px] md:text-xs text-green-700">
                      Aktif hingga {new Date(activeSubscription.expires_at).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-600 text-white border-0 text-[10px] md:text-xs font-bold">
                  AKTIF
                </Badge>
              </div>
            </Card>
          </MotionCard>
        )}

        {/* Payment History Link - Always show */}
        {!hasPendingPayments && (
          <MotionCard className="rounded-lg md:rounded-xl">
            <Link href="/dashboard/student/payments">
              <Card className="bg-white border border-slate-200 p-3 md:p-4 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <CreditCard className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-bold text-slate-900">
                        Riwayat Pembayaran
                      </p>
                      <p className="text-[10px] md:text-xs text-slate-600">
                        Lihat transaksi dan invoice
                      </p>
                    </div>
                  </div>
                  <div className="text-slate-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Card>
            </Link>
          </MotionCard>
        )}

        {/* Improvement Chart */}
        <MotionCard className="rounded-lg md:rounded-xl">
          <ImprovementChart userId={user.id} />
        </MotionCard>
      </div>
    </div>
  );
}
