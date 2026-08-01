<<<<<<< HEAD
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
=======
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap,
  Trophy,
  CheckCircle2,
  XCircle,
  Home,
<<<<<<< HEAD
  ArrowRight,
  TrendingUp,
  Target,
  BarChart3,
  Award,
} from "lucide-react";

export default async function TryoutResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const resultId = resolvedParams.id;

  const supabase = await createClient();

  // Fetch Result Record from Supabase Database
  const { data: resultRecord } = await supabase
    .from("results")
    .select("*, tryouts(title)")
    .eq("id", resultId)
    .single();

  // Fetch user profile for target PTN info
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const targetPtn = user?.user_metadata?.target_ptn || "Universitas Indonesia";
  const tryoutTitle = resultRecord?.tryouts?.title || "Try Out SNBT - Episode 1";

  // Score details
  const score = resultRecord?.score || 745;
  const totalCorrect = resultRecord?.total_correct || 8;
  const totalQuestions = resultRecord?.total_questions || 10;
  const accuracyPercentage = Math.round((totalCorrect / Math.max(totalQuestions, 1)) * 100);

  // Performance Rating Badge
  let performanceBadge = {
    label: "Sangat Memuaskan (Peluang PTN Tinggi)",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  };
  if (score < 500) {
    performanceBadge = {
      label: "Perlu Peningkatan Sesi Latihan",
      color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    };
  } else if (score < 650) {
    performanceBadge = {
      label: "Cukup Baik (Peluang Sedang)",
      color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    };
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans hero-glow">
      {/* Top Bar Header */}
      <header className="bg-card border-b border-border px-4 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/dashboard/student" className="flex items-center gap-2.5">
          <Image
            src="/logo.svg"
            alt="UpdatePTN Logo"
            width={36}
            height={36}
            className="h-9 w-auto object-contain"
          />
          <span className="font-extrabold text-lg tracking-tight">
            Update<span className="text-primary">PTN</span>
          </span>
        </Link>

        <Link href="/dashboard/student">
          <Button variant="outline" size="sm" className="rounded-xl gap-2 font-semibold">
            <Home className="h-4 w-4" />
            <span>Kembali ke Dashboard</span>
=======
  Target,
  BarChart3,
  Award,
  TrendingUp,
  TrendingDown,
  Loader2,
  BookOpen,
  ArrowRight,
} from "lucide-react";

interface ResultRecord {
  id: string;
  score: number;
  total_correct: number;
  total_questions: number;
  irt_score?: number;
  tryouts?: { title: string } | null;
}

export default function TryoutResultPage() {
  const params = useParams();
  const resultId = params?.id as string;

  const [result, setResult] = useState<ResultRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Target jurusan from localStorage (set during tryout picker)
  const [targetPtn, setTargetPtn] = useState("UNIVERSITAS INDONESIA");
  const [targetProdi, setTargetProdi] = useState("S1 Ilmu Komputer");
  const [targetPg, setTargetPg] = useState(710);

  // Read localStorage on mount
  useEffect(() => {
    const ptn = localStorage.getItem("tryout_target_ptn");
    const prodi = localStorage.getItem("tryout_target_prodi");
    const pg = localStorage.getItem("tryout_target_pg");
    if (ptn) setTargetPtn(ptn);
    if (prodi) setTargetProdi(prodi);
    if (pg) setTargetPg(Number(pg));
  }, []);

  // Fetch result from Supabase
  useEffect(() => {
    async function fetchResult() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("results")
          .select("*, tryouts(title)")
          .eq("id", resultId)
          .single();

        if (error || !data) {
          setNotFound(true);
        } else {
          setResult(data as ResultRecord);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    if (resultId) fetchResult();
  }, [resultId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Memuat Hasil Try Out...</p>
        </div>
      </div>
    );
  }

  if (notFound || !result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-lg">
          <div className="h-16 w-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-rose-500" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">Hasil Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500 mb-6">Pastikan kamu sudah menyelesaikan Try Out terlebih dahulu.</p>
          <Link href="/dashboard/student">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>
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
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 h-16 flex items-center justify-between shadow-sm sticky top-0 z-10">
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
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
          </Button>
        </Link>
      </header>

<<<<<<< HEAD
      {/* Main Result Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-8 my-6">
        {/* Banner Victory Header */}
        <div className="text-center space-y-3">
          <Badge variant="outline" className={`px-4 py-1.5 rounded-full text-xs font-semibold ${performanceBadge.color}`}>
            <Award className="h-3.5 w-3.5 mr-1.5" />
            {performanceBadge.label}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Hasil Penilaian Try Out IRT
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Selamat! Kamu telah menyelesaikan <strong className="text-foreground">{tryoutTitle}</strong>. Berikut adalah ringkasan performa dan pembobotan skor IRT-mu.
          </p>
        </div>

        {/* Primary Score Hero Card */}
        <Card className="border-primary/40 shadow-2xl rounded-3xl overflow-hidden bg-card/95 backdrop-blur text-center relative p-6 sm:p-10 space-y-6">
          <div className="absolute top-0 right-0 bg-primary/10 w-40 h-40 rounded-bl-full pointer-events-none"></div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Skor Akhir IRT UTBK
            </span>
            <div className="text-5xl sm:text-7xl font-black text-primary tracking-tight">
              {score}
              <span className="text-lg text-muted-foreground font-medium ml-2">/ 1000</span>
            </div>
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Akurasi Jawaban Benar</span>
              <span className="text-emerald-600 font-bold">{accuracyPercentage}%</span>
            </div>
            <Progress value={accuracyPercentage} className="h-3 bg-muted rounded-full" />
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/80">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <div className="flex justify-center mb-1">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-xs text-muted-foreground block font-medium">Benar</span>
              <span className="text-xl font-extrabold text-emerald-600">{totalCorrect} Soal</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
              <div className="flex justify-center mb-1">
                <XCircle className="h-5 w-5 text-rose-500" />
              </div>
              <span className="text-xs text-muted-foreground block font-medium">Salah / Kosong</span>
              <span className="text-xl font-extrabold text-rose-600">{totalQuestions - totalCorrect} Soal</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
              <div className="flex justify-center mb-1">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
              </div>
              <span className="text-xs text-muted-foreground block font-medium">Total Soal</span>
              <span className="text-xl font-extrabold text-indigo-600">{totalQuestions} Soal</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center">
              <div className="flex justify-center mb-1">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-xs text-muted-foreground block font-medium">Target PTN</span>
              <span className="text-sm font-extrabold text-purple-600 truncate block mt-0.5">{targetPtn}</span>
=======
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-8 space-y-6 my-6">
        {/* Title area */}
        <div className="text-center space-y-3">
          <Badge variant="outline" className={`px-4 py-1.5 rounded-full text-xs font-bold ${performanceBadge.color}`}>
            <Award className="h-3.5 w-3.5 mr-1.5" />
            {performanceBadge.label}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Hasil Try Out</h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Kamu telah menyelesaikan <strong className="text-slate-900">{tryoutTitle}</strong>.
          </p>
        </div>

        {/* Score Card */}
        <Card className="border border-blue-200 rounded-3xl bg-white p-6 sm:p-10 space-y-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/60 rounded-bl-full pointer-events-none" />

          <div className="text-center space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Skor Akhir IRT UTBK</p>
            <div className="text-6xl sm:text-8xl font-black text-blue-600 tracking-tight">
              {score}
              <span className="text-xl text-slate-400 font-medium ml-2">/ 1000</span>
            </div>
          </div>

          <div className="max-w-sm mx-auto space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500">Akurasi Jawaban</span>
              <span className="text-emerald-600 font-bold">{accuracyPct}%</span>
            </div>
            <Progress value={accuracyPct} className="h-3 bg-slate-100 rounded-full" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
              <span className="text-[11px] text-slate-500 block">Benar</span>
              <span className="text-xl font-black text-emerald-600">{totalCorrect}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-center">
              <XCircle className="h-5 w-5 text-rose-500 mx-auto mb-1" />
              <span className="text-[11px] text-slate-500 block">Salah</span>
              <span className="text-xl font-black text-rose-600">{totalQuestions - totalCorrect}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
              <BarChart3 className="h-5 w-5 text-indigo-600 mx-auto mb-1" />
              <span className="text-[11px] text-slate-500 block">Total Soal</span>
              <span className="text-xl font-black text-indigo-600">{totalQuestions}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100 text-center">
              <Trophy className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <span className="text-[11px] text-slate-500 block">Rank (IRT)</span>
              <span className="text-xl font-black text-purple-600">
                {score >= 750 ? "S" : score >= 700 ? "A" : score >= 650 ? "B" : score >= 600 ? "C" : "D"}
              </span>
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
            </div>
          </div>
        </Card>

<<<<<<< HEAD
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/dashboard/student" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto h-12 px-8 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl gap-2">
              <Home className="h-5 w-5" />
              <span>Kembali ke Dashboard</span>
            </Button>
          </Link>

          <Link href="/dashboard/student#peluang" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 font-semibold rounded-xl border-border hover:bg-accent gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Cek Rasionalisasi PTN</span>
=======
        {/* =============================================== */}
        {/* 🎯 ANALISIS TARGET JURUSAN                      */}
        {/* =============================================== */}
        <Card className="border border-slate-200 rounded-3xl bg-white p-6 sm:p-8 space-y-5 shadow-md">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-1">
              <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Analisis Peluang Target Jurusan</h3>
                <p className="text-[11px] text-slate-500">Berdasarkan jurusan yang kamu pilih sebelum Try Out</p>
              </div>
            </div>
            <Badge variant="outline" className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${chanceBadgeStyle}`}>
              {chanceStatus}
            </Badge>
          </div>

          {/* Target Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Target PTN</p>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="font-extrabold text-sm text-slate-900 leading-tight">{targetPtn}</span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Target Program Studi</p>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600 shrink-0" />
                <span className="font-extrabold text-sm text-slate-900 leading-tight">{targetProdi}</span>
              </div>
            </div>
          </div>

          {/* Probability Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-600">Estimasi Peluang Kelulusan</span>
              <span className={`text-4xl font-black ${progressBarColor}`}>{chancePercent}%</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  diff >= 20 ? "bg-emerald-500" : diff >= 0 ? "bg-blue-500" : "bg-amber-500"
                }`}
                style={{ width: `${chancePercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Score Comparison */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <p className="text-[10px] text-slate-500 font-medium mb-1">Skor Kamu</p>
              <p className="text-2xl font-black text-blue-600">{score}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] text-slate-500 font-medium mb-1">Est. Passing Grade</p>
              <p className="text-2xl font-black text-slate-800">{targetPg}</p>
            </div>
            <div className={`p-4 rounded-2xl border ${diff >= 0 ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"}`}>
              <p className="text-[10px] text-slate-500 font-medium mb-1">Selisih</p>
              <p className={`text-2xl font-black ${diff >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {diff >= 0 ? `+${diff}` : diff}
              </p>
            </div>
          </div>

          {/* Recommendation */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-blue-100 flex gap-3">
            {chanceIcon}
            <div>
              <p className="text-xs font-extrabold text-slate-900 mb-1">💡 Rekomendasi Strategis</p>
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
>>>>>>> 856ccaee71bcd89c4d1542980f34c3986cd70e3e
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
