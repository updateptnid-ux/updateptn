import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StaggerContainer, StaggerItem, MotionCard } from "@/components/ui/fade-in";
import { getUnivLogoUrl, getUnivInitials } from "@/lib/univ-logo";
import {
  GraduationCap,
  Clock,
  FileText,
  CheckCircle2,
  PlayCircle,
  BarChart3,
  Target,
  Zap,
  TrendingUp,
  Award,
} from "lucide-react";

export default async function StudentDashboardPage() {
  const supabase = await createClient();

  // 1. Fetch user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Fetch Tryouts from DB
  const { data: tryoutsData } = await supabase
    .from("tryouts")
    .select("*")
    .order("created_at", { ascending: false });

  // 3. Fetch past results for user
  let userResultsCount = 0;
  let lastResult = null;

  if (user) {
    const { data: resultsData } = await supabase
      .from("results")
      .select("*, tryouts(title)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (resultsData && resultsData.length > 0) {
      userResultsCount = resultsData.length;
      lastResult = resultsData[0];
    }
  }

  // Fallback demo tryouts if DB empty
  const activeTryouts =
    tryoutsData && tryoutsData.length > 0
      ? tryoutsData
      : [
          {
            id: "11111111-1111-1111-1111-111111111111",
            title: "Try Out Nasional UTBK SNBT - Seri 01",
            duration_minutes: 120,
            total_questions: 155,
            created_at: new Date().toISOString(),
          },
          {
            id: "11111111-1111-1111-1111-111111111112",
            title: "Simulasi TPS & Literasi Bahasa UTBK - Seri 02",
            duration_minutes: 90,
            total_questions: 100,
            created_at: new Date().toISOString(),
          },
        ];

  const asalSekolah = user?.user_metadata?.asal_sekolah as string | undefined;
  const targetUniv = user?.user_metadata?.target_univ as string | undefined;
  const targetProdi = user?.user_metadata?.target_prodi as string | undefined;
  // Build a display label for the target
  const targetLabel =
    targetProdi && targetUniv
      ? `${targetProdi} — ${targetUniv.replace("UNIVERSITAS ", "").replace("INSTITUT ", "")}`
      : targetUniv || targetProdi || null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <MotionCard className="rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:shadow-blue-500/5 transition-all">
          <div className="space-y-1.5">
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 font-semibold mb-1">
              Portal Pejuang UTBK
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Selamat Datang, {user?.user_metadata?.full_name || "Siswa UpdatePTN"}! 👋
            </h1>
            <p className="text-slate-500 text-sm">
              Pantau perkembangan skor IRT dan ikuti simulasi Try Out UTBK terbaru.
            </p>
            {asalSekolah && (
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1 pt-0.5">
                <span>🏫</span>
                <span>{asalSekolah}</span>
              </p>
            )}
          </div>

          <Link href="/dashboard/student/cek-peluang">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2 shadow-sm shrink-0 hover:scale-105 active:scale-95 transition-all">
              <Target className="h-4 w-4" />
              <span>Cek Peluang PTN</span>
            </Button>
          </Link>
        </div>
      </MotionCard>

      {/* Minimalist Stat Cards Waterfall Grid */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-6" staggerDelay={0.08}>
        {/* Stat 1 */}
        <StaggerItem>
          <MotionCard className="h-full rounded-2xl">
            <Card className="bg-white/90 backdrop-blur-md border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-2 h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total TO Diikuti</span>
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{userResultsCount}</p>
              <p className="text-xs text-slate-500 font-medium">Selesai diuji sistem IRT</p>
            </Card>
          </MotionCard>
        </StaggerItem>

        {/* Stat 2 */}
        <StaggerItem>
          <MotionCard className="h-full rounded-2xl">
            <Card className="bg-white/90 backdrop-blur-md border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-2 h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Skor Terakhir</span>
                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">
                {lastResult ? Math.round(Number(lastResult.score)) : "720"}
              </p>
              <p className="text-xs text-slate-500 font-medium">Skor Pembobotan IRT</p>
            </Card>
          </MotionCard>
        </StaggerItem>

        {/* Stat 3 */}
        <StaggerItem>
          <MotionCard className="h-full rounded-2xl">
            <Card className="bg-white/90 backdrop-blur-md border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-2 h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Utama</span>
                {targetUniv ? (
                  <Avatar className="h-9 w-9 rounded-xl border border-slate-200">
                    <AvatarImage
                      src={getUnivLogoUrl(targetUniv) ?? undefined}
                      alt={targetUniv}
                      className="object-contain p-0.5"
                    />
                    <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl">
                      {getUnivInitials(targetUniv)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                )}
              </div>
              {targetLabel ? (
                <>
                  <p className="text-base font-extrabold text-slate-900 leading-snug line-clamp-2">{targetLabel}</p>
                  <p className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                    <Target className="h-3.5 w-3.5" />
                    <span>Prodi Impian Kamu</span>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-400 italic">Belum diset</p>
                  <Link href="/direktori-prodi" className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Cari Prodi Impian →</span>
                  </Link>
                </>
              )}
            </Card>
          </MotionCard>
        </StaggerItem>
      </StaggerContainer>

      {/* Available Try Outs Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Daftar Try Out Aktif</h2>
            <p className="text-xs text-slate-500">Pilih paket Try Out untuk mulai simulasi ujian bertimer</p>
          </div>
          <Badge variant="outline" className="text-xs border-slate-200 text-slate-600">
            <span>Standar Resmi BPPP</span>
          </Badge>
        </div>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6" staggerDelay={0.1}>
          {activeTryouts.map((to) => (
            <StaggerItem key={to.id}>
              <MotionCard className="h-full rounded-2xl">
                <Card className="bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs rounded-2xl p-6 flex flex-col justify-between h-full">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-600 text-white font-bold text-xs">TERBARU</Badge>
                      <span className="text-xs text-slate-400 font-medium">Sistem IRT</span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-extrabold text-slate-900 leading-snug">{to.title}</h3>
                      <p className="text-xs text-slate-500">
                        Mencakup Tes Potensi Skolastik (TPS) & Literasi Bahasa Indonesia/Inggris.
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>{to.duration_minutes} Menit</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span>{to.total_questions || 155} Soal</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 mt-4">
                    <Link href={`/tryout/${to.id}`} className="w-full">
                      <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2 shadow-sm transition-all hover:scale-[1.01]">
                        <PlayCircle className="h-4 w-4" />
                        <span>Mulai Ujian Sekarang</span>
                      </Button>
                    </Link>
                  </div>
                </Card>
              </MotionCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </div>
  );
}

