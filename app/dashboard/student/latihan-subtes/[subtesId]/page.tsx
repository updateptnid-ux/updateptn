"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StaggerContainer, StaggerItem, MotionCard } from "@/components/ui/fade-in";
import {
  Brain,
  Calculator,
  BookOpen,
  Globe,
  LineChart,
  ChevronLeft,
  PlayCircle,
  CheckCircle2,
  Clock,
  FileText,
  Target,
} from "lucide-react";

// Mapping subtes ke data
const subtesData: Record<string, any> = {
  "penalaran-umum": {
    title: "Penalaran Umum",
    icon: Brain,
    color: "blue",
    modules: [
      {
        id: 1,
        title: "Konsep Dasar IRT & Strategi Pengerjaan",
        description: "Pahami sistem IRT dan cara memaksimalkan skor dengan strategi tepat.",
        duration: "45 menit",
        totalQuestions: 40,
        isCompleted: false,
        difficulty: "Mudah",
      },
      {
        id: 2,
        title: "Pola Barisan & Deret Logika",
        description: "Latihan soal bertingkat tentang pola angka dan deret geometri.",
        duration: "60 menit",
        totalQuestions: 50,
        isCompleted: false,
        difficulty: "Sedang",
      },
      {
        id: 3,
        title: "Analogi Verbal & Silogisme",
        description: "Teknik cepat menjawab soal analogi kata dan penarikan kesimpulan.",
        duration: "50 menit",
        totalQuestions: 45,
        isCompleted: true,
        difficulty: "Sedang",
      },
    ],
  },
  "pengetahuan-kuantitatif": {
    title: "Pengetahuan Kuantitatif",
    icon: Calculator,
    color: "purple",
    modules: [
      {
        id: 1,
        title: "Trik Cepat Aljabar UTBK 2026",
        description: "Kumpulan soal simulasi terbaru berbasis kisi-kisi SNPMB 2026.",
        duration: "55 menit",
        totalQuestions: 48,
        isCompleted: false,
        difficulty: "Mudah",
      },
      {
        id: 2,
        title: "Geometri & Trigonometri Dasar",
        description: "Master konsep sudut, luas, dan volume dengan rumus praktis.",
        duration: "65 menit",
        totalQuestions: 50,
        isCompleted: false,
        difficulty: "Sulit",
      },
    ],
  },
  "literasi-indonesia": {
    title: "Literasi B. Indonesia",
    icon: BookOpen,
    color: "emerald",
    modules: [
      {
        id: 1,
        title: "Bedah Teks Literasi: Mencari Ide Pokok",
        description: "Kumpulan soal simulasi terbaru berbasis kisi-kisi SNPMB 2026.",
        duration: "40 menit",
        totalQuestions: 35,
        isCompleted: false,
        difficulty: "Mudah",
      },
    ],
  },
  "literasi-inggris": {
    title: "Literasi B. Inggris",
    icon: Globe,
    color: "amber",
    modules: [
      {
        id: 1,
        title: "Mastering English Vocabulary for UTBK",
        description: "Perbendaharaan kata penting dan konteks penggunaannya dalam soal SNBT.",
        duration: "50 menit",
        totalQuestions: 40,
        isCompleted: false,
        difficulty: "Sedang",
      },
    ],
  },
  "penalaran-matematika": {
    title: "Penalaran Matematika",
    icon: LineChart,
    color: "indigo",
    modules: [
      {
        id: 1,
        title: "Logika Proposisi & Penalaran Kesimpulan",
        description: "Kumpulan soal simulasi terbaru berbasis kisi-kisi SNPMB 2026.",
        duration: "45 menit",
        totalQuestions: 42,
        isCompleted: false,
        difficulty: "Sedang",
      },
    ],
  },
};

export default function SubtesDetailPage() {
  const params = useParams();
  const subtesId = params.subtesId as string;
  const data = subtesData[subtesId];

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto py-20 text-center">
        <p className="text-slate-500">Subtes tidak ditemukan.</p>
        <Link href="/dashboard/student/latihan-subtes">
          <Button className="mt-4">Kembali ke Daftar Subtes</Button>
        </Link>
      </div>
    );
  }

  const IconComponent = data.icon;
  const completedCount = data.modules.filter((m: any) => m.isCompleted).length;
  const progressPercentage = (completedCount / data.modules.length) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Breadcrumb & Back Button */}
      <div>
        <Link
          href="/dashboard/student/latihan-subtes"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Kembali ke Daftar Subtes</span>
        </Link>
      </div>

      {/* Header Card */}
      <MotionCard className="rounded-2xl">
        <Card className={`bg-gradient-to-r from-${data.color}-600 to-${data.color}-700 text-white p-8 rounded-2xl border-0 shadow-xl`}>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className={`h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0`}>
              <IconComponent className="h-8 w-8" />
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold">{data.title}</h1>
                <Badge className="bg-white/20 text-white border-0 font-bold text-xs">
                  {data.modules.length} Modul
                </Badge>
              </div>
              <p className="text-blue-100 text-sm">
                Kumpulan soal simulasi terbaru berbasis kisi-kisi SNPMB 2026
              </p>

              {/* Progress Bar */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Progress Penyelesaian</span>
                  <span>{completedCount}/{data.modules.length} Modul</span>
                </div>
                <Progress value={progressPercentage} className="h-2 bg-white/20" />
              </div>
            </div>
          </div>
        </Card>
      </MotionCard>

      {/* Modules List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Daftar Modul Latihan</h2>

        <StaggerContainer className="space-y-4" staggerDelay={0.08}>
          {data.modules.map((module: any, idx: number) => (
            <StaggerItem key={module.id}>
              <MotionCard className="rounded-2xl">
                <Card className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-xs rounded-2xl p-6 hover:shadow-lg hover:border-blue-300 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left Content */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`h-12 w-12 rounded-xl bg-${data.color}-50 text-${data.color}-600 font-extrabold text-lg flex items-center justify-center shrink-0`}>
                        {idx + 1}
                      </div>

                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-extrabold text-slate-900">{module.title}</h3>
                          {module.isCompleted && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-bold text-[10px]">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              SELESAI
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-slate-600">{module.description}</p>

                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 pt-1">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span>{module.duration}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span>{module.totalQuestions} Soal</span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold ${
                              module.difficulty === "Mudah"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : module.difficulty === "Sedang"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {module.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Right CTA */}
                    <Button
                      className={`${
                        module.isCompleted
                          ? "bg-slate-600 hover:bg-slate-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      } text-white font-bold rounded-xl gap-2 shadow-sm shrink-0`}
                    >
                      <PlayCircle className="h-4 w-4" />
                      <span>{module.isCompleted ? "Ulangi" : "Mulai"}</span>
                    </Button>
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
