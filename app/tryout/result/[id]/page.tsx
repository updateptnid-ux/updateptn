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
  GraduationCap,
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
} from "lucide-react";

export default function TryoutResultPage() {
  const params = useParams();
  const resultId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [targetPtn, setTargetPtn] = useState("UNIVERSITAS INDONESIA");
  const [targetProdi, setTargetProdi] = useState("S1 Ilmu Komputer");
  const [targetPg, setTargetPg] = useState<number>(710);

  useEffect(() => {
    // Read saved target from localStorage
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

        // 1. Try DB fetch first
        const { data } = await supabase
          .from("results")
          .select("*, tryouts(title)")
          .eq("id", resultId)
          .single();

        if (data) {
          setResult(data);
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
  const tryoutTitle = result.tryouts?.title || "Try Out SNBT";
  const accuracyPct = Math.round((totalCorrect / Math.max(totalQuestions, 1)) * 100);

  // --- Performance badge ---
  let performanceBadge = {
    label: "Sangat Memuaskan – Peluang PTN Tinggi",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  if (score < 500) {
    performanceBadge = { label: "Perlu Peningkatan – Tingkatkan Latihan", color: "bg-rose-50 text-rose-700 border-rose-200" };
  } else if (score < 650) {
    performanceBadge = { label: "Cukup Baik – Peluang Sedang", color: "bg-amber-50 text-amber-700 border-amber-200" };
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
    recommendationText = `Skor IRT kamu (${score}) unggul +${diff} poin di atas estimasi keketatan untuk ${targetProdi} di ${targetPtn}. Pilihan ini sangat aman dijadikan Pilihan 1 SNBT. Pertahankan konsistensi ini!`;
  } else if (diff >= 0) {
    chancePercent = Math.round(60 + (diff / 20) * 24);
    chanceStatus = "BERSAING";
    chanceBadgeStyle = "bg-blue-50 text-blue-700 border-blue-200";
    chanceIcon = <TrendingUp className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />;
    recommendationText = `Skor kamu (${score}) sudah melampaui estimasi passing grade (${targetPg}) sebesar +${diff} poin. Kamu berada di zona kompetitif — pertahankan dan tingkatkan latihan subtes terlemahmu!`;
  } else {
    chancePercent = Math.max(20, Math.round(60 + diff * 1.2));
    chanceStatus = "PERLU DITINGKATKAN";
    chanceBadgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
    chanceIcon = <TrendingDown className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />;
    recommendationText = `Skor kamu (${score}) masih berjarak ${Math.abs(diff)} poin di bawah estimasi passing grade (${targetPg}) untuk ${targetProdi}. Fokus latihan intensif di subtes Kuantitatif & Penalaran Matematika untuk menutup gap ini.`;
  }

  const progressBarColor =
    diff >= 20 ? "text-emerald-600" : diff >= 0 ? "text-blue-600" : "text-amber-600";

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
            Hasil Evaluasi Try Out IRT
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            {tryoutTitle} • Sistem Pembobotan Item Response Theory (IRT)
          </p>
        </div>

        {/* Hero Score Card */}
        <Card className="bg-white border border-slate-200 shadow-md rounded-3xl p-6 sm:p-8 text-center space-y-6 relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Skor IRT UTBK Kamu
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

        {/* Rasionalisasi PTN Target Card */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Analisis Rasionalisasi Target</span>
                <h3 className="text-base font-bold text-slate-900">{targetProdi}</h3>
                <p className="text-xs text-slate-500 font-medium">{targetPtn}</p>
              </div>
            </div>
            <Badge variant="outline" className={`px-3 py-1 rounded-full text-xs font-bold ${chanceBadgeStyle}`}>
              {chanceStatus}
            </Badge>
          </div>

          {/* Probability Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline text-xs font-bold">
              <span className="text-slate-500">Estimasi Peluang Lolos SNBT</span>
              <span className={`text-xl font-black ${progressBarColor}`}>{chancePercent}%</span>
            </div>
            <Progress value={chancePercent} className="h-3 bg-slate-100 rounded-full" />
          </div>

          {/* Target Score vs Actual Breakdown */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs">
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Skor Kamu</span>
              <span className="text-sm font-extrabold text-slate-900">{score}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Passing Grade</span>
              <span className="text-sm font-extrabold text-slate-900">{targetPg}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Selisih</span>
              <span className={`text-sm font-extrabold ${diff >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {diff >= 0 ? `+${diff}` : diff}
              </span>
            </div>
          </div>

          {/* Recommendation Box */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
            {chanceIcon}
            <div>
              <p className="text-xs font-bold text-slate-900 mb-0.5">Rekomendasi Strategi:</p>
              <p className="text-xs text-slate-600 leading-relaxed">{recommendationText}</p>
            </div>
          </div>

          {/* Change Target Link */}
          <div className="flex items-center justify-center pt-1">
            <button
              onClick={() => {
                localStorage.removeItem("tryout_target_ptn");
                localStorage.removeItem("tryout_target_prodi");
                localStorage.removeItem("tryout_target_pg");
              }}
            >
              <Link
                href="/tryout"
                className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
              >
                Ganti target jurusan & ikuti TO lagi
                <ArrowRight className="h-3 w-3" />
              </Link>
            </button>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/dashboard/student" className="flex-1">
            <Button size="lg" className="w-full h-12 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 shadow-md">
              <Home className="h-5 w-5" />
              Kembali ke Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/student/cek-peluang" className="flex-1">
            <Button size="lg" variant="outline" className="w-full h-12 font-semibold rounded-xl border-slate-300 hover:bg-slate-100 gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Cek Peluang PTN Lain
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
