"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { getUserTier } from "@/actions/subscription";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StaggerContainer, StaggerItem, MotionCard } from "@/components/ui/fade-in";
import {
  PlayCircle,
  FileText,
  Download,
  Clock,
  BookOpen,
  Video,
  CheckCircle2,
  Star,
  Eye,
  Loader2,
  Lock,
} from "lucide-react";

interface Modul {
  id: string;
  type: "video" | "pdf";
  category: string;
  title: string;
  thumbnail_url: string;
  content_url: string;
  duration?: string;
  pages?: number;
  views?: number;
  downloads?: number;
  rating?: number;
  is_premium: boolean;
  is_active: boolean;
}

export default function ModulPage() {
  const [activeTab, setActiveTab] = useState("PU");
  const [moduls, setModuls] = useState<Modul[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState<string>("Basic");

  // Kategori UTBK SNBT dengan icon dan warna
  const categories = [
    { 
      id: "PU", 
      label: "Penalaran Umum", 
      shortLabel: "PU",
      icon: BookOpen, 
      color: "purple",
      desc: "Logika & Analisis"
    },
    { 
      id: "PK", 
      label: "Pengetahuan Kuantitatif", 
      shortLabel: "PK",
      icon: BookOpen, 
      color: "emerald",
      desc: "Matematika Dasar"
    },
    { 
      id: "PM", 
      label: "Penalaran Matematika", 
      shortLabel: "PM",
      icon: BookOpen, 
      color: "amber",
      desc: "Soal Cerita & Logika"
    },
    { 
      id: "PBM", 
      label: "Literasi Bahasa Indonesia", 
      shortLabel: "LBI",
      icon: BookOpen, 
      color: "rose",
      desc: "Bahasa Indonesia"
    },
    { 
      id: "LBI", 
      label: "Literasi Bahasa Inggris", 
      shortLabel: "LBE",
      icon: BookOpen, 
      color: "sky",
      desc: "Bahasa Inggris"
    },
    { 
      id: "PPU", 
      label: "Pemahaman Bacaan", 
      shortLabel: "PB",
      icon: BookOpen, 
      color: "indigo",
      desc: "Membaca & Memahami"
    },
  ];

  useEffect(() => {
    fetchModuls();
  }, []);

  const fetchModuls = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Get user tier using the subscription action
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const tier = await getUserTier(user.id);
        setUserTier(tier);
      }

      // Fetch PDFs from moduls table
      const { data: pdfData, error: pdfError } = await supabase
        .from("moduls")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch videos from videos table
      const { data: videoData, error: videoError } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      const combinedData: Modul[] = [];

      // Map PDFs
      if (!pdfError && pdfData) {
        pdfData.forEach((pdf: any) => {
          combinedData.push({
            id: pdf.id,
            type: "pdf",
            category: pdf.category,
            title: pdf.title,
            thumbnail_url: pdf.thumbnail_url || "",
            content_url: pdf.pdf_url || "",
            pages: pdf.pages,
            downloads: pdf.downloads,
            rating: pdf.rating || 5.0,
            is_premium: pdf.is_premium || false,
            is_active: true,
          });
        });
      }

      // Map Videos
      if (!videoError && videoData) {
        videoData.forEach((video: any) => {
          combinedData.push({
            id: video.id,
            type: "video",
            category: video.category,
            title: video.title,
            thumbnail_url: video.thumbnail_url || "",
            content_url: video.url || "",
            duration: video.duration,
            views: video.views_count,
            rating: video.rating || 5.0,
            is_premium: video.is_premium || false,
            is_active: true,
          });
        });
      }

      setModuls(combinedData);

      if (pdfError) console.error("Error fetching PDFs:", pdfError);
      if (videoError) console.error("Error fetching videos:", videoError);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredModuls = moduls.filter((modul) => {
    // Exact match with category ID
    if (modul.category?.toUpperCase() === activeTab.toUpperCase()) {
      return true;
    }
    
    // Check if category contains the active tab
    const categoryUpper = modul.category?.toUpperCase() || "";
    const activeTabUpper = activeTab.toUpperCase();
    
    // Map category names to short codes
    const categoryMapping: Record<string, string[]> = {
      "PU": ["PU", "PENALARAN UMUM"],
      "PK": ["PK", "PENGETAHUAN KUANTITATIF", "KUANTITATIF"],
      "PM": ["PM", "PENALARAN MATEMATIKA", "MATEMATIKA"],
      "PBM": ["PBM", "LITERASI INDONESIA", "LITERASI BAHASA INDONESIA", "BAHASA INDONESIA"],
      "LBI": ["LBI", "LITERASI INGGRIS", "LITERASI BAHASA INGGRIS", "BAHASA INGGRIS"],
      "PPU": ["PPU", "PEMAHAMAN BACAAN", "PEMAHAMAN"],
    };
    
    // Check if modul's category matches any variation of the selected category
    const variations = categoryMapping[activeTabUpper] || [activeTabUpper];
    return variations.some(v => categoryUpper.includes(v));
  });

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="space-y-2 md:space-y-3">
        <Badge variant="outline" className="text-[10px] md:text-xs font-bold bg-blue-50 text-blue-700 border-blue-200 mb-2">
          Materi Pembelajaran SNBT
        </Badge>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Modul <span className="text-blue-600">Belajar</span>
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm md:text-base max-w-2xl">
          Pilih kategori subtes SNBT yang ingin kamu pelajari. Video pembelajaran & PDF modul dari Master Tutor alumni PTN favorit.
        </p>
      </div>

      {/* Category Cards - Responsive: Compact on mobile, larger on desktop */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {categories.map((cat) => {
          const isActive = activeTab === cat.id;
          const colorClasses = {
            blue: isActive ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
            purple: isActive ? 'bg-purple-600 text-white border-purple-600' : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
            emerald: isActive ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
            amber: isActive ? 'bg-amber-600 text-white border-amber-600' : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
            rose: isActive ? 'bg-rose-600 text-white border-rose-600' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
            sky: isActive ? 'bg-sky-600 text-white border-sky-600' : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
            indigo: isActive ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
          };
          
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`p-2 md:p-3 rounded-lg md:rounded-xl border-2 transition-all text-center ${
                colorClasses[cat.color as keyof typeof colorClasses]
              } ${isActive ? 'scale-[1.02] shadow-md' : 'shadow-sm'}`}
            >
              <div className="space-y-1 md:space-y-1.5">
                <div className="flex justify-center">
                  <div className={`h-7 w-7 md:h-10 md:w-10 rounded-lg md:rounded-xl flex items-center justify-center ${
                    isActive ? 'bg-white/20' : 'bg-white/50'
                  }`}>
                    <BookOpen className="h-3.5 w-3.5 md:h-5 md:w-5" />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-[10px] md:text-xs leading-tight">
                    {cat.shortLabel}
                  </p>
                  <p className={`text-[8px] md:text-[10px] mt-0.5 ${
                    isActive ? 'text-white/80' : 'opacity-60'
                  }`}>
                    {cat.desc}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="pt-2 md:pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
            <p className="text-slate-600 font-semibold text-sm md:text-base">Memuat modul belajar...</p>
          </div>
        ) : filteredModuls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <BookOpen className="h-16 w-16 text-slate-300 mb-4" />
            <p className="text-slate-600 font-semibold text-base md:text-lg">Belum ada modul tersedia</p>
            <p className="text-slate-500 text-xs md:text-sm">Admin akan segera menambahkan modul pembelajaran untuk kategori ini</p>
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6" staggerDelay={0.08}>
            {filteredModuls.map((modul) => (
              <StaggerItem key={modul.id}>
                <MotionCard className="h-full rounded-2xl">
                  <Card className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-xs rounded-2xl overflow-hidden flex flex-col h-full hover:shadow-xl hover:scale-[1.02] transition-all">
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-slate-100">
                      {modul.thumbnail_url && modul.thumbnail_url.startsWith('http') ? (
                        <Image
                          src={modul.thumbnail_url}
                          alt={modul.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-200">
                          {modul.type === "video" ? (
                            <Video className="h-12 w-12 text-slate-400" />
                          ) : (
                            <FileText className="h-12 w-12 text-slate-400" />
                          )}
                        </div>
                      )}
                      {modul.type === "video" && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="h-14 w-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
                            <PlayCircle className="h-7 w-7 text-purple-600" />
                          </div>
                        </div>
                      )}
                      {modul.is_premium && (
                        <Badge className="absolute top-3 right-3 bg-blue-400 text-white font-bold text-[10px] shadow-lg">
                          PREMIUM
                        </Badge>
                      )}
                      {modul.type === "video" && modul.views && modul.views > 0 && (
                        <Badge className="absolute top-3 left-3 bg-emerald-500 text-white font-bold text-[10px] shadow-lg flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {modul.views}
                        </Badge>
                      )}
                      {/* Duration or Pages Badge */}
                      <Badge className="absolute bottom-3 right-3 bg-black/70 text-white font-bold text-[10px]">
                        {modul.type === "video" ? (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            {modul.duration}
                          </>
                        ) : (
                          <>
                            <FileText className="h-3 w-3 mr-1" />
                            {modul.pages} Hal
                          </>
                        )}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="p-3 md:p-5 flex-1 flex flex-col justify-between space-y-2 md:space-y-4">
                      <div className="space-y-1.5 md:space-y-2">
                        <Badge variant="outline" className="text-[9px] md:text-[10px] font-bold bg-slate-50 text-slate-700 border-slate-200 px-1.5 py-0.5">
                          {modul.category}
                        </Badge>
                        <h3 className="text-sm md:text-base font-extrabold text-slate-900 leading-tight line-clamp-2">
                          {modul.title}
                        </h3>

                        {/* Stats */}
                        <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs font-semibold text-slate-600">
                          {modul.type === "video" ? (
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3 md:h-3.5 md:w-3.5 text-slate-400" />
                              <span className="hidden sm:inline">{modul.views?.toLocaleString() || 0} views</span>
                              <span className="sm:hidden">{modul.views?.toLocaleString() || 0}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Download className="h-3 w-3 md:h-3.5 md:w-3.5 text-slate-400" />
                              <span className="hidden sm:inline">{modul.downloads?.toLocaleString() || 0} downloads</span>
                              <span className="sm:hidden">{modul.downloads?.toLocaleString() || 0}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 md:h-3.5 md:w-3.5 text-amber-500 fill-amber-500" />
                            <span>{modul.rating?.toFixed(1) || "5.0"}</span>
                          </div>
                        </div>
                      </div>

                      {/* CTA Button */}
                      {modul.content_url && modul.content_url.startsWith('http') ? (
                        modul.is_premium && userTier === "Basic" ? (
                          <Link href="/pricing" className="block">
                            <Button
                              className="w-full h-8 md:h-10 font-bold rounded-lg md:rounded-xl gap-1.5 md:gap-2 shadow-sm transition-all bg-blue-400 hover:bg-blue-500 text-white text-[10px] md:text-sm"
                            >
                              <Lock className="h-3 w-3 md:h-4 md:w-4" />
                              <span>Unlock</span>
                            </Button>
                          </Link>
                        ) : modul.type === "video" ? (
                          <Link href={`/dashboard/student/modul/video/${modul.id}`} className="block">
                            <Button
                              className="w-full h-8 md:h-10 font-bold rounded-lg md:rounded-xl gap-1.5 md:gap-2 shadow-sm transition-all bg-blue-500 hover:bg-blue-600 text-white text-[10px] md:text-sm"
                            >
                              <PlayCircle className="h-3 w-3 md:h-4 md:w-4" />
                              <span>Tonton</span>
                            </Button>
                          </Link>
                        ) : (
                          <a
                            href={modul.content_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <Button
                              className="w-full h-8 md:h-10 font-bold rounded-lg md:rounded-xl gap-1.5 md:gap-2 shadow-sm transition-all bg-blue-500 hover:bg-blue-600 text-white text-[10px] md:text-sm"
                            >
                              <Download className="h-3 w-3 md:h-4 md:w-4" />
                              <span>Download</span>
                            </Button>
                          </a>
                        )
                      ) : (
                        <Button
                          disabled
                          className="w-full h-8 md:h-10 font-bold rounded-lg md:rounded-xl gap-1.5 md:gap-2 shadow-sm bg-slate-300 text-slate-500 cursor-not-allowed text-[10px] md:text-sm"
                        >
                          <FileText className="h-3 w-3 md:h-4 md:w-4" />
                          <span>URL Tidak Valid</span>
                        </Button>
                      )}
                    </div>
                  </Card>
                </MotionCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>

      {/* Premium Upsell Banner */}
      <MotionCard className="rounded-2xl">
        <Card className="bg-blue-500 text-white p-8 rounded-2xl border-0 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold">Akses Semua Modul Premium!</h3>
              <p className="text-blue-50 text-sm max-w-2xl">
                Dapatkan akses unlimited ke 500+ video pembelajaran dan 200+ modul PDF eksklusif dari Master Tutor.
              </p>
            </div>
            <Link href="/pricing">
              <Button className="bg-white text-blue-500 hover:bg-blue-50 font-bold rounded-xl px-8 h-12 shadow-sm shrink-0">
                Upgrade Premium
              </Button>
            </Link>
          </div>
        </Card>
      </MotionCard>
    </div>
  );
}
