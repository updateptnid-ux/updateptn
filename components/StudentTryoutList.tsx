"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StaggerContainer, StaggerItem, MotionCard } from "@/components/ui/fade-in";
import { Clock, FileText, PlayCircle, Lock, Hourglass, Sparkles, CheckCircle2, BarChart2 } from "lucide-react";
import FreeAccessModal from "@/components/FreeAccessModal";
import { createClient } from "@/lib/supabase/client";

import Image from "next/image";
import { getUnivLogoUrl } from "@/lib/univ-logo";

interface Tryout {
  id: string;
  title: string;
  duration_minutes: number;
  total_questions: number;
  is_free: boolean;
  allow_free_claim?: boolean;
  mandiri_category?: string | null;
}

interface StudentTryoutListProps {
  tryouts: Tryout[];
  userId: string;
  userName: string;
  userEmail: string;
  initialSubscription: any | null;
}

export default function StudentTryoutList({
  tryouts,
  userId,
  userName,
  userEmail,
  initialSubscription
}: StudentTryoutListProps) {
  const [subStatus] = useState<string | null>(initialSubscription?.status || null);
  const [subTier] = useState<string | null>(initialSubscription?.tier || null);
  const [subExpiresAt] = useState<string | null>(initialSubscription?.expires_at || null);
  
  // Mapping tryout_id -> status request ('pending', 'approved', 'rejected', 'used')
  const [requestStatuses, setRequestStatuses] = useState<Record<string, string>>({});
  // Mapping tryout_id -> result_id terbaru
  const [completedResults, setCompletedResults] = useState<Record<string, string>>({});
  const [selectedTryout, setSelectedTryout] = useState<Tryout | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isGlobalPremium =
    subStatus === "active" &&
    (subTier === "Premium" || subTier === "Platinum" || subTier === "FreePromo") &&
    (subExpiresAt ? new Date(subExpiresAt) > new Date() : true);

  const fetchAccessRequests = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("free_access_requests")
        .select("tryout_id, status")
        .eq("user_id", userId);
      if (!error && data) {
        const mapping: Record<string, string> = {};
        data.forEach((req: any) => { mapping[req.tryout_id] = req.status; });
        setRequestStatuses(mapping);
      }
    } catch (err) {
      console.error("Gagal mengambil status pengajuan:", err);
    }
  };

  // Fetch semua hasil TO yang sudah dikerjakan user
  const fetchCompletedResults = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("results")
        .select("id, tryout_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!error && data) {
        // Ambil result_id terbaru per tryout_id
        const mapping: Record<string, string> = {};
        data.forEach((r: any) => {
          if (!mapping[r.tryout_id]) mapping[r.tryout_id] = r.id;
        });
        setCompletedResults(mapping);
      }
    } catch (err) {
      console.error("Gagal mengambil hasil TO:", err);
    }
  };

  useEffect(() => {
    fetchAccessRequests();
    fetchCompletedResults();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleActionClick = (to: Tryout) => {
    const isApproved = requestStatuses[to.id] === "approved";
    if (to.is_free || isGlobalPremium || isApproved) {
      window.location.href = `/tryout/${to.id}`;
    } else {
      setSelectedTryout(to);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg md:text-xl font-bold text-slate-900">Daftar Try Out Aktif</h2>
          <p className="text-xs md:text-sm text-slate-500">Pilih paket Try Out untuk mulai simulasi ujian bertimer</p>
        </div>
        <Badge variant="outline" className="text-[10px] md:text-xs border-slate-200 text-slate-600">
          <span>Standar Resmi BPPP</span>
        </Badge>
      </div>

      <StaggerContainer 
        key={tryouts.map(t => t.id).join("-")} 
        className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6" 
        staggerDelay={0.1}
      >
        {tryouts.map((to) => {
          const isReqStatus = requestStatuses[to.id];
          const isApproved = isReqStatus === "approved";
          const isPending = isReqStatus === "pending";
          const isUsed = isReqStatus === "used";

          // Prioritas utama: cek apakah ada hasil di tabel results
          const resultId = completedResults[to.id];
          const hasResult = !!resultId;

          const isPlayable = !isUsed && (to.is_free || isGlobalPremium || isApproved);

          return (
            <StaggerItem key={to.id}>
              <MotionCard className="h-full rounded-lg md:rounded-2xl">
                <Card className={`backdrop-blur-md shadow-xs rounded-lg md:rounded-2xl p-4 md:p-6 flex flex-col justify-between h-full hover:shadow-md transition-shadow ${
                  hasResult
                    ? "bg-emerald-50/40 border border-emerald-200"
                    : "bg-white/90 border border-slate-200/80"
                }`}>
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                        {to.is_free ? (
                          <Badge className="bg-emerald-600 text-white font-bold text-[10px] md:text-[10px] tracking-wide uppercase px-2 md:px-2 py-0.5 rounded-lg">
                            Gratis
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-400 text-white font-bold text-[10px] md:text-[10px] tracking-wide uppercase px-2 md:px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Sparkles className="h-3 w-3 md:h-3 md:w-3" />
                            <span>Premium</span>
                          </Badge>
                        )}

                        {/* Badge "Sudah Dikerjakan" — prioritas tertinggi */}
                        {hasResult && (
                          <Badge className="text-[10px] md:text-[10px] border-emerald-300 text-emerald-700 bg-emerald-100 font-bold px-2 md:px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 md:h-3 md:w-3" />
                            <span className="hidden sm:inline">Sudah Dikerjakan</span>
                            <span className="sm:hidden">Selesai</span>
                          </Badge>
                        )}
                        {!hasResult && isApproved && (
                          <Badge variant="outline" className="text-[10px] md:text-[10px] border-emerald-200 text-emerald-700 bg-emerald-50 font-bold px-2 md:px-2 py-0.5 rounded-lg">
                            <span className="hidden sm:inline">Akses Gratis Terbuka</span>
                            <span className="sm:hidden">Approved</span>
                          </Badge>
                        )}
                        {!hasResult && isUsed && (
                          <Badge variant="outline" className="text-[10px] md:text-[10px] border-slate-300 text-slate-500 bg-slate-50 font-bold px-2 md:px-2 py-0.5 rounded-lg">
                            <span className="hidden sm:inline">Akses Digunakan</span>
                            <span className="sm:hidden">Used</span>
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] md:text-xs text-slate-400 font-medium shrink-0">Sistem IRT</span>
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const logoUrl = getUnivLogoUrl(to.mandiri_category || to.title);
                          return logoUrl ? (
                            <div className="w-6 h-6 relative flex-shrink-0 bg-white rounded-full p-0.5 border border-slate-200 shadow-xs">
                              <Image
                                src={logoUrl}
                                alt={to.mandiri_category || "Logo PTN"}
                                fill
                                className="object-contain"
                                unoptimized
                              />
                            </div>
                          ) : null;
                        })()}
                        <h3 className="text-sm md:text-lg font-extrabold text-slate-900 leading-tight md:leading-snug line-clamp-2">{to.title}</h3>
                      </div>
                      <p className="text-[10px] md:text-xs text-slate-500 leading-relaxed line-clamp-2">
                        Mencakup Tes Potensi Skolastik (TPS) &amp; Literasi Bahasa Indonesia/Inggris standar resmi.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4 text-[10px] md:text-xs font-semibold text-slate-600 pt-1">
                      <div className="flex items-center gap-1.5 md:gap-1.5">
                        <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600 flex-shrink-0" />
                        <span>{to.duration_minutes} Mnt</span>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-1.5">
                        <FileText className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600 flex-shrink-0" />
                        <span>{to.total_questions || 155} Soal</span>
                      </div>
                    </div>
                  </div>

                  <div className={`pt-4 md:pt-6 border-t mt-4 md:mt-5 ${hasResult ? "border-emerald-100" : "border-slate-100"}`}>
                    {/* Prioritas 1: Sudah ada hasil → Lihat Hasil */}
                    {hasResult ? (
                      <div className="flex flex-col gap-2 md:gap-2">
                        <Link href={`/tryout/result/${resultId}`}>
                          <Button className="w-full h-10 md:h-11 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-lg md:rounded-xl gap-1.5 md:gap-2 shadow-xs transition-all touch-manipulation text-xs md:text-base">
                            <BarChart2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">Lihat Hasil &amp; Analisis</span>
                            <span className="sm:hidden">Lihat Hasil</span>
                          </Button>
                        </Link>
                        {isPlayable && (
                          <Button
                            variant="outline"
                            onClick={() => handleActionClick(to)}
                            className="w-full h-9 md:h-9 text-slate-600 border-slate-200 font-bold rounded-lg md:rounded-xl gap-1.5 md:gap-2 text-xs md:text-sm hover:bg-slate-50 touch-manipulation"
                          >
                            <PlayCircle className="h-3.5 w-3.5 md:h-3.5 md:w-3.5" />
                            <span>Kerjakan Ulang</span>
                          </Button>
                        )}
                      </div>
                    ) : isUsed ? (
                      <Button
                        disabled
                        className="w-full h-10 md:h-11 bg-slate-100 text-slate-400 border border-slate-200 font-bold rounded-lg md:rounded-xl gap-1.5 md:gap-2 cursor-not-allowed text-xs md:text-base"
                      >
                        <Lock className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400" />
                        <span className="hidden sm:inline">Akses Sudah Digunakan (1x)</span>
                        <span className="sm:hidden">Sudah Digunakan</span>
                      </Button>
                    ) : isPlayable ? (
                      <Button
                        onClick={() => handleActionClick(to)}
                        className="w-full h-10 md:h-11 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-lg md:rounded-xl gap-1.5 md:gap-2 shadow-xs transition-all touch-manipulation text-xs md:text-base"
                      >
                        <PlayCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Mulai Ujian Sekarang</span>
                        <span className="sm:hidden">Mulai Ujian</span>
                      </Button>
                    ) : isPending ? (
                      <Button
                        disabled
                        className="w-full h-10 md:h-11 bg-slate-100 text-slate-400 border border-slate-200 font-bold rounded-lg md:rounded-xl gap-1.5 md:gap-2 cursor-not-allowed text-xs md:text-base"
                      >
                        <Hourglass className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400 animate-spin" />
                        <span className="hidden sm:inline">Menunggu Persetujuan Admin</span>
                        <span className="sm:hidden">Pending</span>
                      </Button>
                    ) : to.allow_free_claim === false ? (
                      <Link href="/pricing" className="w-full">
                        <Button
                          className="w-full h-10 md:h-11 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-lg md:rounded-xl gap-1 md:gap-2 shadow-sm transition-all touch-manipulation text-[10px] sm:text-xs md:text-sm px-2"
                        >
                          <Lock className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                          <span className="hidden sm:inline">Langganan Paket Premium</span>
                          <span className="sm:hidden">Premium</span>
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        onClick={() => handleActionClick(to)}
                        className="w-full h-10 md:h-11 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold rounded-lg md:rounded-xl gap-1 md:gap-2 shadow-sm transition-all touch-manipulation text-[10px] sm:text-xs md:text-sm px-2"
                      >
                        <Lock className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                        <span className="hidden sm:inline">Buka Akses Gratis Bersyarat</span>
                        <span className="sm:hidden">Unlock</span>
                      </Button>
                    )}
                  </div>
                </Card>
              </MotionCard>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {selectedTryout && (
        <FreeAccessModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          tryoutId={selectedTryout.id}
          tryoutTitle={selectedTryout.title}
          userId={userId}
          userName={userName}
          userEmail={userEmail}
          onSuccess={fetchAccessRequests}
        />
      )}
    </div>
  );
}
