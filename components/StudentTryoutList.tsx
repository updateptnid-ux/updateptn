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

interface Tryout {
  id: string;
  title: string;
  duration_minutes: number;
  total_questions: number;
  is_free: boolean;
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Daftar Try Out Aktif</h2>
          <p className="text-xs text-slate-500">Pilih paket Try Out untuk mulai simulasi ujian bertimer</p>
        </div>
        <Badge variant="outline" className="text-xs border-slate-200 text-slate-600">
          <span>Standar Resmi BPPP</span>
        </Badge>
      </div>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6" staggerDelay={0.1}>
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
              <MotionCard className="h-full rounded-2xl">
                <Card className={`backdrop-blur-md shadow-xs rounded-2xl p-6 flex flex-col justify-between h-full hover:shadow-md transition-shadow ${
                  hasResult
                    ? "bg-emerald-50/40 border border-emerald-200"
                    : "bg-white/90 border border-slate-200/80"
                }`}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        {to.is_free ? (
                          <Badge className="bg-emerald-600 text-white font-bold text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-lg">
                            Gratis
                          </Badge>
                        ) : (
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            <span>Premium</span>
                          </Badge>
                        )}

                        {/* Badge "Sudah Dikerjakan" — prioritas tertinggi */}
                        {hasResult && (
                          <Badge className="text-[10px] border-emerald-300 text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Sudah Dikerjakan
                          </Badge>
                        )}
                        {!hasResult && isApproved && (
                          <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded-lg">
                            Akses Gratis Terbuka
                          </Badge>
                        )}
                        {!hasResult && isUsed && (
                          <Badge variant="outline" className="text-[10px] border-slate-300 text-slate-500 bg-slate-50 font-bold px-2 py-0.5 rounded-lg">
                            Akses Digunakan
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-medium shrink-0">Sistem IRT</span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-extrabold text-slate-900 leading-snug">{to.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Mencakup Tes Potensi Skolastik (TPS) &amp; Literasi Bahasa Indonesia/Inggris standar resmi.
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>{to.duration_minutes} Menit</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span>{to.total_questions || 155} Soal</span>
                      </div>
                    </div>
                  </div>

                  <div className={`pt-6 border-t mt-5 ${hasResult ? "border-emerald-100" : "border-slate-100"}`}>
                    {/* Prioritas 1: Sudah ada hasil → Lihat Hasil */}
                    {hasResult ? (
                      <div className="flex flex-col gap-2">
                        <Link href={`/tryout/result/${resultId}`}>
                          <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl gap-2 shadow-xs transition-all hover:scale-[1.01]">
                            <BarChart2 className="h-4 w-4" />
                            <span>Lihat Hasil &amp; Analisis</span>
                          </Button>
                        </Link>
                        {isPlayable && (
                          <Button
                            variant="outline"
                            onClick={() => handleActionClick(to)}
                            className="w-full h-9 text-slate-600 border-slate-200 font-bold rounded-xl gap-2 text-xs hover:bg-slate-50"
                          >
                            <PlayCircle className="h-3.5 w-3.5" />
                            <span>Kerjakan Ulang</span>
                          </Button>
                        )}
                      </div>
                    ) : isUsed ? (
                      <Button
                        disabled
                        className="w-full h-11 bg-slate-100 text-slate-400 border border-slate-200 font-bold rounded-xl gap-2 cursor-not-allowed"
                      >
                        <Lock className="h-4 w-4 text-slate-400" />
                        <span>Akses Sudah Digunakan (1x)</span>
                      </Button>
                    ) : isPlayable ? (
                      <Button
                        onClick={() => handleActionClick(to)}
                        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2 shadow-xs transition-all hover:scale-[1.01]"
                      >
                        <PlayCircle className="h-4 w-4" />
                        <span>Mulai Ujian Sekarang</span>
                      </Button>
                    ) : isPending ? (
                      <Button
                        disabled
                        className="w-full h-11 bg-slate-100 text-slate-400 border border-slate-200 font-bold rounded-xl gap-2 cursor-not-allowed"
                      >
                        <Hourglass className="h-4 w-4 text-slate-400 animate-spin" />
                        <span>Menunggu Persetujuan Admin</span>
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleActionClick(to)}
                        className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl gap-2 shadow-sm transition-all hover:scale-[1.01]"
                      >
                        <Lock className="h-4 w-4" />
                        <span>Buka Akses Gratis Bersyarat</span>
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
