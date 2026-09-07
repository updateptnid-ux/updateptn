"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StaggerContainer, StaggerItem, MotionCard } from "@/components/ui/fade-in";
import { createClient } from "@/lib/supabase/client";
import { getUserTier } from "@/actions/subscription";
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
  Crown,
} from "lucide-react";

// Data struktur latihan per subtes (7 Subtes SNBT Resmi)
const subtesCategories = [
  // === TES POTENSI SKOLASTIK (TPS) ===
  {
    id: "penalaran-umum",
    title: "Penalaran Umum (PU)",
    description: "30 soal dalam 30 menit - Penalaran induktif, deduktif, dan kuantitatif",
    icon: Brain,
    color: "blue",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200",
    isPremium: false,
    totalSoal: 350,
  },
  {
    id: "pengetahuan-pemahaman-umum",
    title: "Pengetahuan & Pemahaman Umum (PPU)",
    description: "20 soal dalam 15 menit - Kemampuan bahasa dan wawasan umum",
    icon: Target,
    color: "violet",
    bgColor: "bg-violet-50",
    iconColor: "text-violet-600",
    borderColor: "border-violet-200",
    isPremium: true,
    totalSoal: 320,
  },
  {
    id: "pemahaman-bacaan-menulis",
    title: "Pemahaman Bacaan & Menulis (PBM)",
    description: "20 soal dalam 25 menit - Tata bahasa, ejaan, dan struktur teks",
    icon: BookOpen,
    color: "rose",
    bgColor: "bg-rose-50",
    iconColor: "text-rose-600",
    borderColor: "border-rose-200",
    isPremium: true,
    totalSoal: 340,
  },
  {
    id: "pengetahuan-kuantitatif",
    title: "Pengetahuan Kuantitatif (PK)",
    description: "15-20 soal dalam 20 menit - Logika matematika dasar dan aljabar",
    icon: Calculator,
    color: "purple",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    borderColor: "border-purple-200",
    isPremium: true,
    totalSoal: 420,
  },
  // === TES LITERASI ===
  {
    id: "literasi-indonesia",
    title: "Literasi B. Indonesia",
    description: "30 soal dalam 45 menit - Analisis teks dan pemahaman bacaan",
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
    description: "20 soal dalam 30 menit - Reading comprehension dan grammar",
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
    title: "Penalaran Matematika (PM)",
    description: "20 soal dalam 30-40 menit - Pemecahan masalah matematika kontekstual",
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
  const [userTier, setUserTier] = useState<"Basic" | "Premium" | "Platinum">("Basic");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserTier = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const tier = await getUserTier(user.id);
          setUserTier(tier);
        }
      } catch (error) {
        console.error("Error loading user tier:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserTier();
  }, []);

  const hasPremiumAccess = userTier === "Premium" || userTier === "Platinum";

  const filteredCategories = subtesCategories.filter((cat) => {
    if (activeFilter === "semua") return true;
    if (activeFilter === "gratis") return !cat.isPremium;
    if (activeFilter === "premium") return cat.isPremium;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-8 pb-20 overflow-y-auto overscroll-contain">
      {/* Header Section */}
      <div className="space-y-3 md:space-y-4">
        <div>
          <Badge variant="outline" className="text-[10px] md:text-xs font-bold bg-emerald-50 text-emerald-700 border-emerald-200 mb-2 md:mb-3">
            📚 Bank Soal Terstruktur
          </Badge>
          <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Latihan <span className="text-blue-600">Per Subtes</span>
          </h1>
          <p className="text-slate-600 text-xs md:text-base mt-1 md:mt-2 max-w-3xl">
            Asah kemampuanmu di setiap subtes untuk meningkatkan peluang keloloson secara signifikan.
          </p>
          
          {/* Penjelasan Kategori - NEW */}
          <div className="mt-3 md:mt-4 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg md:rounded-xl">
            <div className="flex items-start gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Brain className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs md:text-sm font-bold text-slate-900">💡 Apa itu Latihan Per Subtes?</h3>
                <p className="text-[10px] md:text-xs text-slate-700 leading-relaxed">
                  <strong>Latihan Per Subtes</strong> adalah bank soal yang <strong>terfokus per materi</strong> (contoh: hanya Penalaran Umum, hanya Literasi Bahasa Indonesia, dll).
                  <br className="hidden md:block" />
                  Cocok untuk <strong>belajar konsep</strong> dan <strong>memperdalam satu subtes</strong> tanpa batasan waktu ketat.
                </p>
                <div className="flex flex-wrap gap-1.5 md:gap-2 pt-1 md:pt-2">
                  {/* Removed badges based on user feedback */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 md:gap-3 pt-1 md:pt-2">
          <button
            onClick={() => setActiveFilter("semua")}
            className={`px-3 py-2 md:px-5 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm transition-all touch-manipulation ${
              activeFilter === "semua"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveFilter("gratis")}
            className={`px-3 py-2 md:px-5 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm transition-all touch-manipulation ${
              activeFilter === "gratis"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
            }`}
          >
            Gratis
          </button>
          <button
            onClick={() => setActiveFilter("premium")}
            className={`px-3 py-2 md:px-5 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm transition-all touch-manipulation ${
              activeFilter === "premium"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
            }`}
          >
            Premium
          </button>
        </div>
      </div>

      {/* Subtes Cards Grid - 2 kolom di mobile! */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6" staggerDelay={0.08}>
        {filteredCategories.map((category) => {
          const IconComponent = category.icon;

          return (
            <StaggerItem key={category.id}>
              <MotionCard className="h-full rounded-lg md:rounded-2xl">
                <Card
                  className={`bg-white/90 backdrop-blur-md border ${category.borderColor} shadow-xs rounded-lg md:rounded-2xl p-3 md:p-6 flex flex-col justify-between space-y-3 md:space-y-6 h-full hover:shadow-xl hover:scale-[1.02] transition-all`}
                >
                  {/* Header dengan Icon */}
                  <div className="space-y-2 md:space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`h-8 w-8 md:h-12 md:w-12 rounded-lg md:rounded-xl ${category.bgColor} ${category.iconColor} flex items-center justify-center`}>
                        <IconComponent className="h-4 w-4 md:h-6 md:w-6" />
                      </div>
                      {category.isPremium && (
                        <Badge className="bg-blue-400 text-white font-bold text-[9px] md:text-[10px] px-1.5 md:px-2 py-0.5">
                          PREMIUM
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1 md:space-y-2">
                      <h3 className="text-xs md:text-lg font-extrabold text-slate-900 leading-tight">{category.title}</h3>
                      <p className="text-[9px] md:text-xs text-slate-600 leading-relaxed line-clamp-2">{category.description}</p>
                    </div>

                  </div>

                  {/* CTA Button */}
                  <div className="pt-2 md:pt-4 border-t border-slate-100">
                    {category.isPremium && !hasPremiumAccess ? (
                      // Premium content, user belum premium - show upgrade button
                      <Link href="/pricing" className="w-full">
                        <Button
                          className="w-full h-9 md:h-11 font-bold rounded-lg md:rounded-xl gap-1 md:gap-2 shadow-sm transition-all bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-[10px] md:text-base touch-manipulation"
                        >
                          <Lock className="h-3 w-3 md:h-4 md:w-4" />
                          <span>Upgrade</span>
                        </Button>
                      </Link>
                    ) : (
                      // Free content or user already premium - show start button
                      <Link href={`/dashboard/student/latihan-subtes/${category.id}`} className="w-full">
                        <Button
                          className="w-full h-9 md:h-11 font-bold rounded-lg md:rounded-xl gap-1 md:gap-2 shadow-sm transition-all bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-[10px] md:text-base touch-manipulation"
                        >
                          <PlayCircle className="h-3 w-3 md:h-4 md:w-4" />
                          <span>Mulai Latihan</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              </MotionCard>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* Info Banner - Only show if user doesn't have premium */}
      {!hasPremiumAccess && (
        <MotionCard className="rounded-2xl">
          <Card className="bg-blue-700 text-white p-8 rounded-2xl border-0 shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Crown className="h-6 w-6 text-amber-300" />
                  <h3 className="text-2xl font-extrabold">Tingkatkan Persiapanmu dengan Premium!</h3>
                </div>
                <p className="text-blue-50 text-sm max-w-2xl">
                  Akses semua subtes, video pembahasan eksklusif, dan live class bersama Master Tutor alumni PTN favorit.
                </p>
              </div>
              <Link href="/pricing">
                <Button className="bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl px-8 h-12 shadow-sm shrink-0 gap-2">
                  <Crown className="h-4 w-4" />
                  <span>Lihat Paket Premium</span>
                </Button>
              </Link>
            </div>
          </Card>
        </MotionCard>
      )}

      {/* Premium Active Badge - Show if user has premium */}
      {hasPremiumAccess && (
        <MotionCard className="rounded-2xl">
          <Card className="bg-emerald-50 border-emerald-200 p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Status: {userTier} Member</h3>
                  <p className="text-sm text-slate-600">Kamu memiliki akses ke semua fitur premium! 🎉</p>
                </div>
              </div>
              <Badge className="bg-emerald-600 text-white font-bold px-4 py-2">
                {userTier.toUpperCase()}
              </Badge>
            </div>
          </Card>
        </MotionCard>
      )}
    </div>
  );
}
