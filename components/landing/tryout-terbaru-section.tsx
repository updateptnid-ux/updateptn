"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn, MotionCard, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import {
  Calendar,
  Clock,
  FileText,
  Users,
  CheckCircle2,
  ArrowRight,
  Zap,
  Lock,
  PlayCircle,
  ChevronRight,
} from "lucide-react";

interface TryoutItem {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  total_questions: number;
  scheduled_date: string;
  is_free: boolean;
  participants_count: number;
}

// Fallback data saat DB kosong / belum ada tryout
const FALLBACK_TRYOUTS: TryoutItem[] = [
  {
    id: "1",
    title: "Try Out UTBK SNBT 2026 – Seri I",
    description: "Simulasi penuh UTBK 2026 mencakup TPS (Penalaran Umum, Kemampuan Kuantitatif, Literasi) dengan sistem penilaian IRT.",
    duration_minutes: 195,
    total_questions: 155,
    scheduled_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    is_free: true,
    participants_count: 2840,
  },
  {
    id: "2",
    title: "Try Out UTBK SNBT 2026 – Seri II",
    description: "Paket Try Out lanjutan dengan soal-soal prediksi HOTS yang difokuskan pada Literasi Bahasa Indonesia dan Inggris.",
    duration_minutes: 195,
    total_questions: 155,
    scheduled_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    is_free: true,
    participants_count: 1520,
  },
  {
    id: "3",
    title: "TO Premium – Full Paket SNBT",
    description: "Try Out eksklusif dengan pembahasan video per soal, analisis skor IRT mendalam, dan sesi bedah soal live.",
    duration_minutes: 195,
    total_questions: 155,
    scheduled_date: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString(),
    is_free: false,
    participants_count: 980,
  },
];

export default function TryoutTerbaruSection() {
  const [tryouts, setTryouts] = useState<TryoutItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTryouts() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("tryouts")
          .select("*")
          .order("scheduled_date", { ascending: true })
          .limit(3);

        if (!error && data && data.length > 0) {
          setTryouts(data as TryoutItem[]);
        } else {
          // Gunakan fallback jika DB kosong
          setTryouts(FALLBACK_TRYOUTS);
        }
      } catch (err) {
        console.error("Error fetching tryouts:", err);
        setTryouts(FALLBACK_TRYOUTS);
      } finally {
        setLoading(false);
      }
    }

    fetchTryouts();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getDaysUntil = (dateStr: string) => {
    const now = new Date();
    const target = new Date(dateStr);
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "Sudah lewat";
    if (diff === 0) return "Hari ini!";
    if (diff === 1) return "Besok!";
    return `${diff} hari lagi`;
  };

  const isUrgent = (dateStr: string) => {
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff <= 3;
  };

  return (
    <section id="tryout-terbaru" className="py-20 bg-slate-50/70 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Section Header */}
        <FadeIn className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="outline" className="text-xs font-bold bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 inline-flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-blue-600" />
            <span>Try Out Terbaru</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Jadwal Try Out{" "}
            <span className="text-blue-600">UTBK SNBT 2026</span>
          </h2>
          <p className="text-slate-600 text-base">
            Ikuti simulasi Try Out IRT gratis dan ukur kesiapan UTBK kamu sebelum hari H.
          </p>
        </FadeIn>

        {/* Try Out Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 animate-pulse space-y-4 h-72"
              >
                <div className="h-4 bg-slate-200 rounded w-20" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <StaggerContainer
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            staggerDelay={0.08}
          >
            {tryouts.map((tryout) => {
              const urgent = isUrgent(tryout.scheduled_date);
              return (
                <StaggerItem key={tryout.id}>
                  <MotionCard className="h-full rounded-2xl">
                    <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col justify-between space-y-5 h-full hover:shadow-lg hover:border-blue-300 transition-all duration-300 group">

                      {/* Top: Badges */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {tryout.is_free ? (
                              <Badge className="bg-emerald-500 text-white font-bold text-xs px-2.5 py-0.5">
                                GRATIS
                              </Badge>
                            ) : (
                              <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs px-2.5 py-0.5 flex items-center gap-1">
                                <Lock className="h-2.5 w-2.5" />
                                PREMIUM
                              </Badge>
                            )}
                            {urgent && (
                              <Badge className="bg-red-100 text-red-600 font-bold text-xs px-2 py-0.5 animate-pulse border border-red-200">
                                {getDaysUntil(tryout.scheduled_date)}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Users className="h-3.5 w-3.5" />
                            <span>{(tryout.participants_count ?? 0).toLocaleString("id-ID")} siswa</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-extrabold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
                          {tryout.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {tryout.description}
                        </p>

                        {/* Meta Info */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                            <Calendar className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                            <span>{formatDate(tryout.scheduled_date)}</span>
                            {!urgent && (
                              <span className="ml-auto text-slate-400 font-normal">
                                {getDaysUntil(tryout.scheduled_date)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-blue-500" />
                              <span>{tryout.duration_minutes} Menit</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5 text-blue-500" />
                              <span>{tryout.total_questions} Soal</span>
                            </div>
                          </div>
                        </div>

                        {/* Checklist */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center gap-2 text-xs text-slate-700">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span>Sistem IRT (Item Response Theory)</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-700">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span>Pembahasan Lengkap Setelah Selesai</span>
                          </div>
                        </div>
                      </div>

                      {/* CTA Button — Arahkan ke /register */}
                      <Link href={`/register?redirect=/tryout/${tryout.id}`} className="w-full">
                        <Button
                          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:shadow-blue-500/20"
                        >
                          <PlayCircle className="h-4 w-4" />
                          <span>Daftar Sekarang</span>
                        </Button>
                      </Link>
                    </Card>
                  </MotionCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}

        {/* Bottom CTA Banner */}
        <FadeIn delay={0.3}>
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 shadow-xl shadow-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <h3 className="text-xl font-extrabold">Belum Punya Akun? Daftar Gratis!</h3>
              <p className="text-blue-100 text-sm max-w-lg">
                Buat akun sekarang dan langsung ikuti Try Out UTBK gratis, akses Bank Soal, Cek Peluang PTN, dan Live Class bersama tutor terbaik.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/login">
                <Button
                  variant="outline"
                  className="h-11 px-6 border-white/40 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 backdrop-blur-sm"
                >
                  Masuk Akun
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  className="h-11 px-6 bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl shadow-sm gap-2 transition-all"
                >
                  <span>Daftar Sekarang</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* See All Link */}
        <div className="text-center">
          <Link href="/register" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            <span>Lihat Semua Jadwal Try Out</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
