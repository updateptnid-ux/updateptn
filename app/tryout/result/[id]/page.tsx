import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
  Target,
  Sparkles,
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
  const tryoutTitle = resultRecord?.tryouts?.title || "Try Out SNBT 2026 - Episode 1";

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
          </Button>
        </Link>
      </header>

      {/* Main Result Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-8 my-6">
        {/* Banner Victory Header */}
        <div className="text-center space-y-3">
          <Badge variant="outline" className={`px-4 py-1.5 rounded-full text-xs font-semibold ${performanceBadge.color}`}>
            <Sparkles className="h-3.5 w-3.5 mr-1.5 animate-pulse" />
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
            </div>
          </div>
        </Card>

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
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
