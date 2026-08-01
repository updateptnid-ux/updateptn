"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StaggerContainer, StaggerItem, MotionCard } from "@/components/ui/fade-in";
import {
  Brain,
  Calculator,
  BookOpen,
  Globe,
  LineChart,
  Lock,
  PlayCircle,
  Target,
  CheckCircle2,
} from "lucide-react";

// Data struktur latihan per subtes
const subtesCategories = [
  {
    id: "penalaran-umum",
    title: "Penalaran Umum",
    description: "Kumpulan soal simulasi terbaru berbasis kisi-kisi SNPMB 2026.",
    icon: Brain,
    color: "blue",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200",
    isPremium: false,
    totalSoal: 350,
  },
  {
    id: "pengetahuan-kuantitatif",
    title: "Pengetahuan Kuantitatif",
    description: "Kumpulan soal simulasi terbaru berbasis kisi-kisi SNPMB 2026.",
    icon: Calculator,
    color: "purple",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    borderColor: "border-purple-200",
    isPremium: true,
    totalSoal: 420,
  },
  {
    id: "literasi-indonesia",
    title: "Literasi B. Indonesia",
    description: "Kumpulan soal simulasi terbaru berbasis kisi-kisi SNPMB 2026.",
    icon: BookOpen,
    color: "emerald",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600",
    borderColor: "border-emerald-200",
    isPremium: true,
    totalSoal: 380,
  },
  {
    id: "literasi-inggris",
    title: "Literasi B. Inggris",
    description: "Kumpulan soal simulasi terbaru berbasis kisi-kisi SNPMB 2026.",
    icon: Globe,
    color: "amber",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-600",
    borderColor: "border-amber-200",
    isPremium: true,
    totalSoal: 360,
  },
  {
    id: "penalaran-matematika",
    title: "Penalaran Matematika",
    description: "Kumpulan soal simulasi terbaru berbasis kisi-kisi SNPMB 2026.",
    icon: LineChart,
    color: "indigo",
    bgColor: "bg-indigo-50",
    iconColor: "text-indigo-600",
    borderColor: "border-indigo-200",
    isPremium: false,
    totalSoal: 400,
  },
];

export default function LatihanSubtesPage() {
  const [activeFilter, setActiveFilter] = useState<"semua" | "gratis" | "premium">("semua");

  const filteredCategories = subtesCategories.filter((cat) => {
    if (activeFilter === "semua") return true;
    if (activeFilter === "gratis") return !cat.isPremium;
    if (activeFilter === "premium") return cat.isPremium;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div>
          <Badge variant="outline" className="text-xs font-bold bg-blue-50 text-blue-700 border-blue-200 mb-3">
            Bank Soal Terstruktur
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Latihan <span className="text-blue-600">Per Subtes</span>
          </h1>
          <p className="text-slate-600 text-base mt-2 max-w-2xl">
            Asah kemampuanmu di setiap subtes untuk meningkatkan peluang keloloson secara signifikan.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => setActiveFilter("semua")}
            className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${
              activeFilter === "semua"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveFilter("gratis")}
            className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${
              activeFilter === "gratis"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
            }`}
          >
            Gratis
          </button>
          <button
            onClick={() => setActiveFilter("premium")}
            className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${
              activeFilter === "premium"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
            }`}
          >
            Premium
          </button>
        </div>
      </div>

      {/* Subtes Cards Grid */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.08}>
        {filteredCategories.map((category) => {
          const IconComponent = category.icon;

          return (
            <StaggerItem key={category.id}>
              <MotionCard className="h-full rounded-2xl">
                <Card
                  className={`bg-white/90 backdrop-blur-md border ${category.borderColor} shadow-xs rounded-2xl p-6 flex flex-col justify-between space-y-6 h-full hover:shadow-xl hover:scale-[1.02] transition-all`}
                >
                  {/* Header dengan Icon */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`h-12 w-12 rounded-xl ${category.bgColor} ${category.iconColor} flex items-center justify-center`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      {category.isPremium && (
                        <Badge className="bg-blue-400 text-white font-bold text-[10px] px-2 py-0.5">
                          PREMIUM
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-extrabold text-slate-900 leading-snug">{category.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{category.description}</p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>{category.totalSoal}+ Bank Soal</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>Pembahasan Lengkap</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>Update Kisi-kisi SNPMB 2026</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-4 border-t border-slate-100">
                    <Link href={`/dashboard/student/latihan-subtes/${category.id}`} className="w-full">
                      <Button
                        className={`w-full h-11 font-bold rounded-xl gap-2 shadow-sm transition-all ${
                          category.isPremium
                            ? "bg-blue-400 hover:bg-blue-500 text-white"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                      >
                        {category.isPremium ? (
                          <>
                            <Lock className="h-4 w-4" />
                            <span>Upgrade Premium</span>
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-4 w-4" />
                            <span>Mulai Latihan</span>
                          </>
                        )}
                      </Button>
                    </Link>
                  </div>
                </Card>
              </MotionCard>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* Info Banner */}
      <MotionCard className="rounded-2xl">
        <Card className="bg-blue-500 text-white p-8 rounded-2xl border-0 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold">Tingkatkan Persiapanmu dengan Premium!</h3>
              <p className="text-blue-50 text-sm max-w-2xl">
                Akses semua subtes, video pembahasan eksklusif, dan live class bersama Master Tutor alumni PTN favorit.
              </p>
            </div>
            <Link href="/pricing">
              <Button className="bg-white text-blue-500 hover:bg-blue-50 font-bold rounded-xl px-8 h-12 shadow-sm shrink-0">
                Lihat Paket Premium
              </Button>
            </Link>
          </div>
        </Card>
      </MotionCard>
    </div>
  );
}
