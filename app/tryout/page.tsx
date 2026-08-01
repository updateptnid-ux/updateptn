"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StaggerContainer, StaggerItem, MotionCard } from "@/components/ui/fade-in";
import {
  Calendar,
  Clock,
  FileText,
  PlayCircle,
  Users,
  CheckCircle2,
  ArrowRight,
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

export default function JadwalTryOutPage() {
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
          .limit(10);

        if (!error && data) {
          setTryouts(data as TryoutItem[]);
        } else {
          // Fallback demo data
          setTryouts([
            {
              id: "1",
              title: "Try Out Nasional UTBK SNBT - Seri 01",
              description: "Simulasi lengkap TPS & Literasi sesuai kisi-kisi terbaru SNPMB 2026",
              duration_minutes: 120,
              total_questions: 155,
              scheduled_date: "2026-08-05",
              is_free: true,
              participants_count: 12450,
            },
            {
              id: "2",
              title: "Try Out Khusus Saintek - Batch 3",
              description: "Fokus TPS & Penalaran Matematika untuk jurusan saintek",
              duration_minutes: 90,
              total_questions: 100,
              scheduled_date: "2026-08-08",
              is_free: false,
              participants_count: 8920,
            },
            {
              id: "3",
              title: "Try Out Khusus Soshum - Batch 3",
              description: "Fokus TPS & Literasi Bahasa untuk jurusan soshum",
              duration_minutes: 90,
              total_questions: 100,
              scheduled_date: "2026-08-10",
              is_free: false,
              participants_count: 7150,
            },
          ]);
        }
      } catch (err) {
        console.error("Error fetching tryouts:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTryouts();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="text-xs font-bold bg-blue-50 text-blue-600 border-blue-200 px-4 py-1">
            Jadwal Try Out UTBK
          </Badge>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Try Out <span className="text-blue-500">UTBK SNBT 2026</span>
          </h1>
          <p className="text-slate-600 text-base max-w-2xl mx-auto">
            Ikuti simulasi Try Out berbasis IRT untuk mengukur kesiapan UTBK kamu. Gratis untuk semua siswa!
          </p>
        </div>

        {/* Try Out List */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-slate-500">Memuat jadwal try out...</p>
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.08}>
            {tryouts.map((tryout) => (
              <StaggerItem key={tryout.id}>
                <MotionCard className="h-full rounded-2xl">
                  <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col justify-between space-y-4 h-full hover:shadow-lg hover:border-blue-300 transition-all">
                    {/* Header */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        {tryout.is_free ? (
                          <Badge className="bg-blue-400 text-white font-bold text-xs">GRATIS</Badge>
                        ) : (
                          <Badge className="bg-blue-500 text-white font-bold text-xs">PREMIUM</Badge>
                        )}
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Users className="h-3.5 w-3.5" />
                          <span>{tryout.participants_count.toLocaleString()}</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                        {tryout.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {tryout.description}
                      </p>

                      {/* Meta Info */}
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span>{formatDate(tryout.scheduled_date)}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span>{tryout.duration_minutes} Menit</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span>{tryout.total_questions} Soal</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 pt-2">
                        <div className="flex items-center gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Sistem IRT (Item Response Theory)</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Pembahasan Lengkap</span>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <Link href={`/login?redirect=/tryout/${tryout.id}`} className="w-full">
                      <Button className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl gap-2 shadow-sm transition-all">
                        <PlayCircle className="h-4 w-4" />
                        <span>Daftar Sekarang</span>
                      </Button>
                    </Link>
                  </Card>
                </MotionCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* CTA Banner */}
        <Card className="bg-blue-500 text-white p-8 rounded-2xl border-0 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold">Belum Punya Akun?</h3>
              <p className="text-blue-50 text-sm max-w-2xl">
                Daftar sekarang dan akses semua Try Out gratis + fitur Cek Peluang PTN, Live Class, dan Bank Soal lengkap.
              </p>
            </div>
            <Link href="/register">
              <Button className="bg-white text-blue-500 hover:bg-blue-50 font-bold rounded-xl px-8 h-12 shadow-sm shrink-0 gap-2">
                <span>Daftar Gratis</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
