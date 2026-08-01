"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [activeTab, setActiveTab] = useState("semua");
  const [moduls, setModuls] = useState<Modul[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModuls();
  }, []);

  const fetchModuls = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("moduls")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setModuls(data as Modul[]);
      } else {
        console.error("Error fetching moduls:", error);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredModuls = moduls.filter((modul) => {
    if (activeTab === "semua") return true;
    if (activeTab === "video") return modul.type === "video";
    if (activeTab === "pdf") return modul.type === "pdf";
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div>
          <Badge variant="outline" className="text-xs font-bold bg-purple-50 text-purple-700 border-purple-200 mb-3">
            Materi Pembelajaran
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Modul <span className="text-purple-600">Belajar</span>
          </h1>
          <p className="text-slate-600 text-base mt-2 max-w-2xl">
            Kumpulan video pembelajaran dan modul PDF dari Master Tutor alumni PTN favorit.
          </p>
        </div>
      </div>

      {/* Tabs Filter */}
      <Tabs defaultValue="semua" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl">
          <TabsTrigger value="semua" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg font-semibold">
            Semua
          </TabsTrigger>
          <TabsTrigger value="video" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg font-semibold">
            <Video className="h-4 w-4 mr-2" />
            Video
          </TabsTrigger>
          <TabsTrigger value="pdf" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg font-semibold">
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
              <p className="text-slate-600 font-semibold">Memuat modul belajar...</p>
            </div>
          ) : filteredModuls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <BookOpen className="h-16 w-16 text-slate-300 mb-4" />
              <p className="text-slate-600 font-semibold text-lg">Belum ada modul tersedia</p>
              <p className="text-slate-500 text-sm">Admin akan segera menambahkan modul pembelajaran</p>
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.08}>
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
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <Badge variant="outline" className="text-[10px] font-bold bg-slate-50 text-slate-700 border-slate-200">
                          {modul.category}
                        </Badge>
                        <h3 className="text-base font-extrabold text-slate-900 leading-snug line-clamp-2">
                          {modul.title}
                        </h3>

                        {/* Stats */}
                        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                          {modul.type === "video" ? (
                            <div className="flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5 text-slate-400" />
                              <span>{modul.views?.toLocaleString() || 0} views</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Download className="h-3.5 w-3.5 text-slate-400" />
                              <span>{modul.downloads?.toLocaleString() || 0} downloads</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                            <span>{modul.rating?.toFixed(1) || "5.0"}</span>
                          </div>
                        </div>
                      </div>

                      {/* CTA Button */}
                      {modul.content_url && modul.content_url.startsWith('http') ? (
                        <a
                          href={modul.content_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Button
                            className={`w-full h-10 font-bold rounded-xl gap-2 shadow-sm transition-all ${
                              modul.is_premium
                                ? "bg-blue-400 hover:bg-blue-500 text-white"
                                : "bg-blue-500 hover:bg-blue-600 text-white"
                            }`}
                          >
                            {modul.type === "video" ? (
                              <>
                                <PlayCircle className="h-4 w-4" />
                                <span>{modul.is_premium ? "Unlock Premium" : "Tonton Sekarang"}</span>
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4" />
                                <span>{modul.is_premium ? "Unlock Premium" : "Download PDF"}</span>
                              </>
                            )}
                          </Button>
                        </a>
                      ) : (
                        <Button
                          disabled
                          className="w-full h-10 font-bold rounded-xl gap-2 shadow-sm bg-slate-300 text-slate-500 cursor-not-allowed"
                        >
                          <FileText className="h-4 w-4" />
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
        </TabsContent>
      </Tabs>

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
