"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Home,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  Award,
  Loader2,
  RotateCcw,
  Lock,
  BrainCircuit,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  Filter,
  Clock,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function TryoutResultPage() {
  const params = useParams();
  const resultId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [tryoutId, setTryoutId] = useState<string>("");
  const [targetPtn, setTargetPtn] = useState("UNIVERSITAS INDONESIA");
  const [targetProdi, setTargetProdi] = useState("S1 Ilmu Komputer");
  const [targetPg, setTargetPg] = useState<number>(710);
  const [targetsList, setTargetsList] = useState<{ univ: string; prodi: string; passing_grade_est: number }[]>([]);
  const [questionAnalytics, setQuestionAnalytics] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<"all" | "wrong" | "skipped" | "slowest">("all");
  const [showQuestionAnalysis, setShowQuestionAnalysis] = useState(false);
  const [showSubtestDetails, setShowSubtestDetails] = useState(true);

  useEffect(() => {
    // Read saved targets from localStorage
    const savedTargetsStr = localStorage.getItem("tryout_targets");
    if (savedTargetsStr) {
      try {
        const parsed = JSON.parse(savedTargetsStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTargetsList(parsed.filter((t) => t && t.prodi));
        }
      } catch (e) {
        console.warn("Failed to parse tryout_targets:", e);
      }
    }

    const savedPtn = localStorage.getItem("tryout_target_ptn");
    const savedProdi = localStorage.getItem("tryout_target_prodi");
    const savedPg = localStorage.getItem("tryout_target_pg");

    if (savedPtn) setTargetPtn(savedPtn);
    if (savedProdi) setTargetProdi(savedProdi);
    if (savedPg) setTargetPg(Number(savedPg));

    async function loadResult() {
      try {
        setLoading(true);
        const supabase = createClient();

        // Fetch user tier + marketing bypass
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check profile for marketing / free_access / admin bypass
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, is_marketing, free_access")
            .eq("id", user.id)
            .maybeSingle();

          const isMarketingOrAdmin = Boolean(
            profile?.is_marketing || profile?.free_access || profile?.role === "admin"
          );

          if (isMarketingOrAdmin) {
            setIsPremium(true);
          } else {
            const { data: subsData } = await supabase
              .from("subscriptions")
              .select("tier")
              .eq("user_id", user.id)
              .single();
            setIsPremium(subsData?.tier === "Premium" || subsData?.tier === "Platinum");
          }
        }

        // 1. Try DB fetch first
        const { data } = await supabase
          .from("results")
          .select("*, tryouts(title, id, tryout_type, mandiri_category)")
          .eq("id", resultId)
          .single();

        if (data) {
          setResult(data);
          if (data.tryout_id) setTryoutId(data.tryout_id);
          
          // Load question analytics if available
          if (data.question_analytics && Array.isArray(data.question_analytics)) {
            setQuestionAnalytics(data.question_analytics);
          }
        } else {
          // Fallback mock result for demo / offline
          setResult({
            score: 725,
            total_correct: 11,
            total_questions: 15,
            tryouts: { title: "Try Out SNBT 2026 - Master IRT" },
          });
        }
      } catch (err) {
        console.error("Error fetching result:", err);
        setResult({
          score: 725,
          total_correct: 11,
          total_questions: 15,
          tryouts: { title: "Try Out SNBT 2026 - Master IRT" },
        });
      } finally {
        setLoading(false);
      }
    }

    if (resultId) loadResult();
  }, [resultId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3 font-sans">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Mengkalkulasi Pembobotan IRT & Analisis Peluang...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <Card className="max-w-md w-full p-8 text-center space-y-4 bg-white rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600">Hasil tidak ditemukan.</p>
          <Link href="/dashboard/student">
            <Button className="w-full bg-blue-600 text-white rounded-xl">Kembali ke Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // --- Score computation ---
  const score = Number(result.score) || 0;
  const totalCorrect = result.total_correct || 0;
  const totalQuestions = result.total_questions || 1;
  const isMandiri = result.tryouts?.tryout_type === "mandiri" || result.tryout_type === "mandiri";
  const mandiriCat = result.tryouts?.mandiri_category || "";
  const tryoutTitle = result.tryouts?.title || (isMandiri ? `Try Out Mandiri ${mandiriCat}` : "Try Out SNBT");
  const accuracyPct = Math.round((totalCorrect / Math.max(totalQuestions, 1)) * 100);

  // --- Performance badge ---
  let performanceBadge = {
    label: "Sangat Memuaskan – Peluang PTN Tinggi",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  if (score < 500) {
    performanceBadge = { label: "Perlu Peningkatan – Tingkatkan Latihan", color: "bg-rose-50 text-rose-700 border-rose-200" };
  } else if (score < 650) {
    performanceBadge = { label: "Cukup Baik – Peluang Sedang", color: "bg-blue-50 text-blue-700 border-blue-200" };
  }

  // --- Target Jurusan Analysis ---
  const diff = score - targetPg;

  let chancePercent: number;
  let chanceStatus: string;
  let chanceBadgeStyle: string;
  let chanceIcon = <TrendingUp className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />;
  let recommendationText = "";

  if (diff >= 20) {
    chancePercent = Math.min(98, Math.round(85 + (diff - 20) * 0.4));
    chanceStatus = "SANGAT AMAN";
    chanceBadgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
    chanceIcon = <TrendingUp className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />;
    recommendationText = `Skor kamu (${score}) unggul +${diff} poin di atas estimasi keketatan untuk ${targetProdi} di ${targetPtn}. Pilihan ini sangat aman dijadikan Pilihan 1. Pertahankan konsistensi ini!`;
  } else if (diff >= 0) {
    chancePercent = Math.round(60 + (diff / 20) * 24);
    chanceStatus = "BERSAING";
    chanceBadgeStyle = "bg-blue-50 text-blue-700 border-blue-200";
    chanceIcon = <TrendingUp className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />;
    recommendationText = `Skor kamu (${score}) sudah melampaui estimasi passing grade (${targetPg}) sebesar +${diff} poin. Kamu berada di zona kompetitif — pertahankan dan tingkatkan latihan subtes terlemahmu!`;
  } else {
    chancePercent = Math.max(20, Math.round(60 + diff * 1.2));
    chanceStatus = "PERLU DITINGKATKAN";
    chanceBadgeStyle = "bg-blue-50 text-blue-700 border-blue-200";
    chanceIcon = <TrendingDown className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />;
    recommendationText = `Skor kamu (${score}) masih berjarak ${Math.abs(diff)} poin di bawah estimasi passing grade (${targetPg}) untuk ${targetProdi}. Fokus latihan intensif di subtes Kuantitatif & Penalaran Matematika untuk menutup gap ini.`;
  }

  const progressBarColor =
    diff >= 20 ? "text-emerald-600" : diff >= 0 ? "text-blue-600" : "text-blue-500";

  // --- Subtest Breakdown & AI Logic ---
  const subtestScores = result.subtest_scores || {};
  const subtestNames = Object.keys(subtestScores);
  let worstSubtestName = "";
  let worstSubtestPct = 100;
  let hasSubtestData = subtestNames.length > 0;

  if (hasSubtestData) {
    subtestNames.forEach(sub => {
      const { correct, total } = subtestScores[sub];
      const pct = (correct / Math.max(total, 1)) * 100;
      if (pct < worstSubtestPct) {
        worstSubtestPct = pct;
        worstSubtestName = sub;
      }
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 h-16 flex items-center justify-between shadow-xs sticky top-0 z-10">
        <Link href="/dashboard/student" className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="UpdatePTN" width={36} height={36} className="h-9 w-auto" />
          <span className="font-extrabold text-lg text-slate-900">
            Update<span className="text-blue-600">PTN</span>
          </span>
        </Link>
        <Link href="/dashboard/student">
          <Button variant="outline" size="sm" className="rounded-xl gap-2 font-semibold border-slate-200">
            <Home className="h-4 w-4" />
            Dashboard
          </Button>
        </Link>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-8 space-y-6 my-4">
        {/* Victory Header */}
        <div className="text-center space-y-2.5">
          <Badge variant="outline" className={`px-4 py-1 rounded-full text-xs font-bold ${performanceBadge.color}`}>
            <Award className="h-3.5 w-3.5 mr-1.5" />
            {performanceBadge.label}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {isMandiri ? `Hasil Evaluasi ${mandiriCat || "Try Out Mandiri"}` : "Hasil Evaluasi Try Out IRT"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            {tryoutTitle} • Sistem Pembobotan Standar Resmi
          </p>
        </div>

        {/* Hero Score Card */}
        <Card className="bg-white border border-slate-200 shadow-md rounded-3xl p-6 sm:p-8 text-center space-y-6 relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isMandiri ? `Total Skor ${mandiriCat || "Ujian Mandiri"} Kamu` : "Total Skor IRT UTBK Kamu"}
            </span>
            <div className="text-5xl sm:text-6xl font-black text-blue-600 tracking-tight">
              {score}
              <span className="text-base text-slate-400 font-semibold ml-1">/ 1000</span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Benar</span>
              <span className="text-lg font-extrabold text-emerald-600">{totalCorrect} / {totalQuestions}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Akurasi</span>
              <span className="text-lg font-extrabold text-blue-600">{accuracyPct}%</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Target PTN</span>
              <span className="text-xs font-extrabold text-slate-800 truncate block mt-1">{targetPtn.split(" ")[0]}</span>
            </div>
          </div>
        </Card>

        {/* Rasionalisasi 4 Target Prodi & Kecenderungan Skor Card */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Analisis Peluang 4 Prodi Pilihan
                </span>
                <h3 className="text-base font-extrabold text-slate-900">Kecenderungan Skor & Rasionalisasi IRT</h3>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-bold">
              Target Try Out
            </Badge>
          </div>

          {/* Calculate tendencies for each choice */}
          {(() => {
            const displayList = targetsList.length > 0 ? targetsList : [
              { univ: targetPtn, prodi: targetProdi, passing_grade_est: targetPg }
            ];

            const evaluated = displayList.map((item, idx) => {
              const itemPg = Number(item.passing_grade_est || 650);
              const itemDiff = score - itemPg;
              let itemPct = 50;
              let itemStatus = "BERSAING";
              let itemBadgeClass = "bg-blue-50 text-blue-700 border-blue-200";

              if (itemDiff >= 20) {
                itemPct = Math.min(98, Math.round(85 + (itemDiff - 20) * 0.4));
                itemStatus = "SANGAT AMAN";
                itemBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
              } else if (itemDiff >= 0) {
                itemPct = Math.round(60 + (itemDiff / 20) * 24);
                itemStatus = "BERSAING";
                itemBadgeClass = "bg-blue-50 text-blue-700 border-blue-200";
              } else {
                itemPct = Math.max(15, Math.round(60 + itemDiff * 1.2));
                itemStatus = "PERLU PENINGKATAN";
                itemBadgeClass = "bg-rose-50 text-rose-700 border-rose-200";
              }

              return {
                ...item,
                slotNum: idx + 1,
                pg: itemPg,
                diff: itemDiff,
                chancePct: itemPct,
                status: itemStatus,
                badgeClass: itemBadgeClass,
              };
            });

            // Find top leaning prodi:
            // - Jika ada yang chancePct >= 60 → ambil yang tertinggi (memang aman)
            // - Jika semua masih di bawah PG → ambil yang gap-nya paling kecil (|diff| terkecil)
            const hasPositive = evaluated.some((e) => e.diff >= 0);
            const topLeaning = hasPositive
              ? [...evaluated].sort((a, b) => b.chancePct - a.chancePct)[0]
              : [...evaluated].sort((a, b) => Math.abs(a.diff) - Math.abs(b.diff))[0];

            // Order check warning for SNBT rule
            const orderWarnings: string[] = [];
            for (let i = 0; i < evaluated.length - 1; i++) {
              if (evaluated[i + 1].pg > evaluated[i].pg) {
                orderWarnings.push(
                  `Pilihan ${evaluated[i + 1].slotNum} (${evaluated[i + 1].prodi} — PG ${evaluated[i + 1].pg}) Memiliki Passing Grade LEBIH TINGGI daripada Pilihan ${evaluated[i].slotNum} (${evaluated[i].prodi} — PG ${evaluated[i].pg}).`
                );
              }
            }

            return (
              <div className="space-y-6">
                {/* Highlight Leaning / Gap Banner */}
                {topLeaning && (
                  <div className="p-5 rounded-2xl bg-blue-800 text-white shadow-lg flex items-start gap-4 border border-blue-700 relative overflow-hidden">
                    <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10 mt-0.5">
                      {topLeaning.chancePct >= 60 ? (
                        <Sparkles className="h-5 w-5 text-blue-200" />
                      ) : (
                        <BrainCircuit className="h-5 w-5 text-blue-300" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-300 block">
                        {topLeaning.chancePct >= 60 ? "Kecenderungan Skor Kamu (Analisis IRT)" : "Analisis Jarak Skor & Target IRT"}
                      </span>
                      {topLeaning.chancePct >= 60 ? (
                        <>
                          <p className="text-xs font-medium text-blue-100">
                            Skor IRT kamu (<strong className="text-white font-bold">{score}</strong>) paling condong aman & berpeluang diterima pada:
                          </p>
                          <p className="text-sm font-black text-white pt-0.5">
                            Pilihan {topLeaning.slotNum}: {topLeaning.prodi} — {topLeaning.univ} (Peluang {topLeaning.chancePct}%)
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-medium text-blue-100 leading-relaxed">
                            Skor IRT kamu (<strong className="text-white font-bold">{score}</strong>) saat ini masih di bawah estimasi passing grade seluruh prodi pilihan. Pilihan dengan gap terdekat:
                          </p>
                          <p className="text-sm font-black text-white pt-0.5">
                            Pilihan {topLeaning.slotNum}: {topLeaning.prodi} — {topLeaning.univ}{" "}
                            <span className="text-xs font-extrabold text-blue-200 bg-blue-400/20 px-2 py-0.5 rounded-md border border-blue-400/30 ml-1">
                              Selisih {topLeaning.diff} poin • Peluang {topLeaning.chancePct}%
                            </span>
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* 4 Choices Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {evaluated.map((choice) => {
                    const isLeaningTarget = topLeaning && topLeaning.slotNum === choice.slotNum;
                    const barColor = choice.diff >= 20 ? "bg-emerald-500" : choice.diff >= 0 ? "bg-blue-500" : "bg-rose-500";

                    return (
                      <div
                        key={choice.slotNum}
                        className={`rounded-2xl p-4 border transition-all space-y-3 relative ${
                          isLeaningTarget
                            ? choice.chancePct >= 60
                              ? "bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-xs"
                              : "bg-blue-50/40 border-blue-200 ring-2 ring-blue-400/20 shadow-xs"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-900 text-white">
                              Pilihan {choice.slotNum}
                            </span>
                            {isLeaningTarget && (
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                choice.chancePct >= 60 ? "text-blue-700 bg-blue-100" : "text-blue-600 bg-blue-50"
                              }`}>
                                <Sparkles className="h-3 w-3 text-blue-500" />
                                {choice.chancePct >= 60 ? "Condong Ke Sini" : "Gap Terdekat"}
                              </span>
                            )}
                          </div>
                          <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 ${choice.badgeClass}`}>
                            {choice.status}
                          </Badge>
                        </div>

                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 leading-snug truncate">{choice.prodi}</h4>
                          <p className="text-[11px] text-slate-500 font-medium truncate">{choice.univ}</p>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-slate-400">Peluang Lolos</span>
                            <span className="text-slate-900">{choice.chancePct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className={`${barColor} h-2 rounded-full transition-all`} style={{ width: `${choice.chancePct}%` }} />
                          </div>
                        </div>

                        {/* PG comparison stats */}
                        <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[10px] bg-slate-50 rounded-xl p-2 border border-slate-100">
                          <div>
                            <span className="text-slate-400 block font-medium">Skor Kamu</span>
                            <span className="font-extrabold text-slate-900 text-xs">{score}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Passing Grade</span>
                            <span className="font-extrabold text-slate-900 text-xs">{choice.pg}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Selisih</span>
                            <span className={`font-extrabold text-xs ${choice.diff >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                              {choice.diff >= 0 ? `+${choice.diff}` : choice.diff}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Warnings if any */}
                {orderWarnings.length > 0 && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                      <span>Catatan Evaluasi Urutan Pilihan SNBT:</span>
                    </div>
                    <ul className="space-y-1 pl-5 list-disc text-xs font-semibold">
                      {orderWarnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                    <p className="text-[11px] text-rose-700 pt-1">
                      Disarankan mengubah urutan pilihan sehingga prodi ber-passing grade terketat/tertinggi diletakkan pada Pilihan 1.
                    </p>
                  </div>
                )}

                {/* Reset / Change Target */}
                <div className="flex items-center justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem("tryout_targets");
                      localStorage.removeItem("tryout_target_ptn");
                      localStorage.removeItem("tryout_target_prodi");
                      localStorage.removeItem("tryout_target_pg");
                    }}
                  >
                    <Link
                      href="/tryout"
                      className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                    >
                      Ubah 4 Target Prodi & Ikuti Try Out lagi
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </button>
                </div>
              </div>
            );
          })()}
        </Card>

        {/* Subtest Breakdown Card */}
        {hasSubtestData && (
          <Card className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 sm:p-8 space-y-5">
            <button
              onClick={() => setShowSubtestDetails(!showSubtestDetails)}
              className="w-full flex items-center justify-between hover:bg-slate-50 -m-2 p-2 rounded-xl transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Rincian Skor Per Subtes</h3>
                  <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                    Performa tiap area tes (Klik untuk {showSubtestDetails ? "sembunyikan" : "tampilkan"})
                  </p>
                </div>
              </div>
              {showSubtestDetails ? (
                <ChevronUp className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              )}
            </button>

            {showSubtestDetails && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                {subtestNames.map(sub => {
                  const s = subtestScores[sub];
                  const pct = (s.correct / Math.max(s.total, 1)) * 100;
                  let colorClass = "bg-blue-500";
                  if (pct >= 80) colorClass = "bg-emerald-500";
                  else if (pct < 50) colorClass = "bg-blue-300";
                  else if (pct < 70) colorClass = "bg-blue-400";

                  return (
                    <div key={sub} className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-slate-700">{sub}</span>
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-slate-900">{s.irt_score || s.weighted || 0}</span>
                          <span className="text-[10px] text-slate-500 ml-1">{isMandiri ? "Skor" : "IRT"}</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className={`${colorClass} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-0.5">
                        <span>Benar: <strong className="text-emerald-600 font-bold">{s.correct}</strong> / {s.total}</span>
                        {s.wrong !== undefined && s.empty !== undefined && (
                          <span>Salah: <strong className="text-rose-600 font-bold">{s.wrong}</strong> | Kosong: <strong className="text-amber-600 font-bold">{s.empty}</strong></span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* AI Prediction Card */}
        {hasSubtestData && (
          <Card className="bg-blue-700 shadow-lg rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border-0">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start gap-4 relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
                <BrainCircuit className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-blue-100">Smart Analysis AI</h3>
                </div>
                <h4 className="text-lg font-extrabold leading-tight">Fokus Belajar Selanjutnya</h4>
                <p className="text-sm text-blue-100/90 leading-relaxed pt-1">
                  Berdasarkan pemodelan respons butir soal (IRT) yang kamu kerjakan, kelemahan utamamu saat ini ada pada materi <strong className="text-white underline decoration-amber-400 decoration-2 underline-offset-2">{worstSubtestName}</strong>. 
                  Jika kamu ingin mengejar ketertinggalan passing grade di {targetProdi} {targetPtn}, sangat disarankan untuk memperbanyak latihan pada subtes ini sebelum mencoba Try Out berikutnya.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Premium Question Analysis Filter */}
        {isPremium && questionAnalytics.length > 0 && (
          <Card className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 sm:p-8 space-y-5">
            {/* Header with Expand/Collapse */}
            <button
              onClick={() => setShowQuestionAnalysis(!showQuestionAnalysis)}
              className="w-full flex items-center justify-between hover:bg-slate-50 -m-2 p-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-800 border border-blue-700 flex items-center justify-center">
                  <Filter className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">Analisis Detail Per Soal</h3>
                    <Badge variant="outline" className="bg-blue-900 text-white border-blue-800 text-[10px] font-bold">
                      Premium
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                    Filter soal berdasarkan performa & time management
                  </p>
                </div>
              </div>
              {showQuestionAnalysis ? (
                <ChevronUp className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              )}
            </button>

            {showQuestionAnalysis && (
              <div className="space-y-5 pt-2">
                {/* Filter Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`p-3 rounded-xl border-2 transition-all text-xs font-bold flex flex-col items-center gap-1.5 ${
                      filterType === "all"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span>Semua Soal</span>
                    <span className="text-[10px] text-slate-500">({questionAnalytics.length})</span>
                  </button>

                  <button
                    onClick={() => setFilterType("wrong")}
                    className={`p-3 rounded-xl border-2 transition-all text-xs font-bold flex flex-col items-center gap-1.5 ${
                      filterType === "wrong"
                        ? "border-rose-500 bg-rose-50 text-rose-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <XCircle className="h-5 w-5" />
                    <span>Jawaban Salah</span>
                    <span className="text-[10px] text-slate-500">
                      ({questionAnalytics.filter((q) => !q.skipped && !q.is_correct).length})
                    </span>
                  </button>

                  <button
                    onClick={() => setFilterType("skipped")}
                    className={`p-3 rounded-xl border-2 transition-all text-xs font-bold flex flex-col items-center gap-1.5 ${
                      filterType === "skipped"
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <AlertOctagon className="h-5 w-5" />
                    <span>Soal Dilewati</span>
                    <span className="text-[10px] text-slate-500">
                      ({questionAnalytics.filter((q) => q.skipped).length})
                    </span>
                  </button>

                  <button
                    onClick={() => setFilterType("slowest")}
                    className={`p-3 rounded-xl border-2 transition-all text-xs font-bold flex flex-col items-center gap-1.5 ${
                      filterType === "slowest"
                        ? "border-blue-800 bg-blue-900 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <Clock className="h-5 w-5" />
                    <span>Terlama Dikerjakan</span>
                    <span className="text-[10px] text-slate-500">(Top 10)</span>
                  </button>
                </div>

                {/* Filtered Questions List */}
                <div className="space-y-3">
                  {(() => {
                    let filtered = [...questionAnalytics];

                    if (filterType === "wrong") {
                      filtered = filtered.filter((q) => !q.skipped && !q.is_correct);
                    } else if (filterType === "skipped") {
                      filtered = filtered.filter((q) => q.skipped);
                    } else if (filterType === "slowest") {
                      filtered = filtered
                        .filter((q) => q.time_spent_seconds > 0)
                        .sort((a, b) => b.time_spent_seconds - a.time_spent_seconds)
                        .slice(0, 10);
                    }

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-8 text-slate-400">
                          <p className="text-sm font-semibold">Tidak ada soal dalam kategori ini</p>
                        </div>
                      );
                    }

                    return (
                      <>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-600">
                            Menampilkan {filtered.length} soal
                          </span>
                          {filterType === "slowest" && (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                              Evaluasi Time Management
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {filtered.map((q, idx) => {
                            const minutes = Math.floor(q.time_spent_seconds / 60);
                            const seconds = q.time_spent_seconds % 60;
                            const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

                            let statusBadge = null;
                            if (q.skipped) {
                              statusBadge = (
                                <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] font-bold">
                                  <AlertOctagon className="h-3 w-3 mr-1" />
                                  Dilewati
                                </Badge>
                              );
                            } else if (q.is_correct) {
                              statusBadge = (
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Benar
                                </Badge>
                              );
                            } else {
                              statusBadge = (
                                <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-[10px] font-bold">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Salah
                                </Badge>
                              );
                            }

                            return (
                              <div
                                key={q.question_id || idx}
                                className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all"
                              >
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-bold text-slate-900">
                                        Soal #{idx + 1}
                                      </span>
                                      <span className="text-[10px] text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md font-medium">
                                        {q.subtest}
                                      </span>
                                    </div>
                                  </div>
                                  {statusBadge}
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-xs">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-slate-400" />
                                    <div>
                                      <span className="text-[10px] text-slate-500 block">Waktu Pengerjaan</span>
                                      <span className="font-bold text-slate-900">{timeDisplay}</span>
                                    </div>
                                  </div>

                                  {!q.skipped && (
                                    <div className="flex items-center gap-2">
                                      <div className="h-6 w-6 rounded-md bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                        {q.user_answer || "-"}
                                      </div>
                                      <div>
                                        <span className="text-[10px] text-slate-500 block">Jawaban Kamu</span>
                                        <span className={`font-bold text-xs ${q.is_correct ? "text-emerald-600" : "text-rose-600"}`}>
                                          {q.is_correct ? "Benar" : `Seharusnya: ${q.correct_answer}`}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Time Management Warning for slowest */}
                                {filterType === "slowest" && q.time_spent_seconds > 180 && (
                                  <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
                                      Soal ini memakan waktu lebih dari 3 menit. Pertimbangkan untuk skip soal sulit dan kembali lagi di akhir untuk mengoptimalkan waktu.
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Time Management Summary for "slowest" filter */}
                {filterType === "slowest" && (
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                        <BrainCircuit className="h-5 w-5 text-blue-700" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-blue-900">Tips Time Management SNBT</h4>
                        <p className="text-[11px] text-blue-800 leading-relaxed">
                          Dalam ujian SNBT, setiap subtes memiliki durasi terbatas. Soal yang memakan waktu &gt;3 menit sebaiknya di-skip dulu dan dikerjakan di akhir waktu. Prioritaskan soal yang bisa diselesaikan dengan cepat untuk maksimalkan skor.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Non-Premium Teaser */}
        {!isPremium && (
          <Card className="bg-blue-800 border-0 shadow-lg rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start gap-4 relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-blue-100">Fitur Premium</h3>
                </div>
                <h4 className="text-lg font-extrabold leading-tight">Analisis Detail Per Soal</h4>
                <p className="text-sm text-blue-100/90 leading-relaxed pt-1">
                  Upgrade ke Premium untuk mendapatkan analisis mendalam per soal: filter soal yang dijawab salah, soal yang dilewati, dan soal terlama dikerjakan. Evaluasi time management dan strategi pengerjaan kamu!
                </p>
                <Link href="/pricing" className="inline-block mt-3">
                  <Button className="bg-white text-blue-800 hover:bg-blue-50 font-bold rounded-xl h-10 px-6 shadow-md">
                    <Target className="h-4 w-4 mr-2" />
                    Upgrade ke Premium
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* Primary: always show - Lihat Hasil / back to dashboard */}
          <Link href="/dashboard/student" className="block">
            <Button size="lg" className="w-full h-12 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 shadow-md">
              <Home className="h-5 w-5" />
              Kembali ke Dashboard
            </Button>
          </Link>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Kerjakan Ulang — Premium only */}
            {isPremium ? (
              <Link href={tryoutId ? `/tryout/${tryoutId}` : "/tryout"} className="flex-1">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-12 font-semibold rounded-xl border-blue-300 text-blue-700 hover:bg-blue-50 gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Kerjakan Ulang
                </Button>
              </Link>
            ) : (
              <div className="relative flex-1">
                <Button
                  size="lg"
                  variant="outline"
                  disabled
                  className="w-full h-12 font-semibold rounded-xl border-slate-200 text-slate-400 gap-2 cursor-not-allowed"
                >
                  <Lock className="h-4 w-4" />
                  Kerjakan Ulang
                </Button>
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Premium</span>
              </div>
            )}

            {/* Cek Peluang PTN */}
            <Link href="/dashboard/student/cek-peluang" className="flex-1">
              <Button size="lg" variant="outline" className="w-full h-12 font-semibold rounded-xl border-slate-300 hover:bg-slate-100 gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Cek Peluang PTN Lain
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
