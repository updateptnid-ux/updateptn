"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUnivLogoUrl, getUnivInitials } from "@/lib/univ-logo";
import {
  Trophy, Medal, Crown, TrendingUp, Users, Loader2,
  GraduationCap, Flame, Star, RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  asal_sekolah?: string;
  target_prodi?: string;
  best_score: number;
  total_tryouts: number;
  tryout_title: string;
  tryout_id: string;
  rank: number;
}

interface TryoutOption {
  id: string;
  title: string;
}

// REMOVED: Mock leaderboard data - now using REAL data from database only

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div className="h-9 w-9 rounded-xl bg-amber-400 flex items-center justify-center shrink-0 shadow-lg shadow-amber-400/30">
      <Crown className="h-5 w-5 text-white" />
    </div>
  );
  if (rank === 2) return (
    <div className="h-9 w-9 rounded-xl bg-slate-400 flex items-center justify-center shrink-0">
      <Medal className="h-5 w-5 text-white" />
    </div>
  );
  if (rank === 3) return (
    <div className="h-9 w-9 rounded-xl bg-amber-700 flex items-center justify-center shrink-0">
      <Medal className="h-5 w-5 text-white" />
    </div>
  );
  return (
    <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
      <span className="text-sm font-black text-slate-500">#{rank}</span>
    </div>
  );
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [tryouts, setTryouts] = useState<TryoutOption[]>([]);
  const [selectedTryout, setSelectedTryout] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Auth check
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login?redirect=/leaderboard"); return; }
      setCurrentUserId(user.id);

      // Fetch tryouts for filter
      const { data: tryoutsData } = await supabase
        .from("tryouts")
        .select("id, title")
        .order("created_at", { ascending: false });
      if (tryoutsData && tryoutsData.length > 0) setTryouts(tryoutsData);

      // 1. Try to fetch from leaderboard view
      let query = supabase
        .from("leaderboard")
        .select("*")
        .order("rank", { ascending: true })
        .limit(100);

      if (selectedTryout !== "all") {
        query = query.eq("tryout_id", selectedTryout);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        setLeaderboard(data as LeaderboardEntry[]);
        const myEntry = data.find((e: LeaderboardEntry) => e.user_id === user.id);
        setMyRank(myEntry || null);
      } else {
        // 2. Fallback: Query results table directly with join
        let resQuery = supabase
          .from("results")
          .select("id, user_id, score, irt_score, tryout_id, created_at, profiles(full_name, target_prodi, asal_sekolah), tryouts(title)")
          .order("score", { ascending: false })
          .limit(50);

        if (selectedTryout !== "all") {
          resQuery = resQuery.eq("tryout_id", selectedTryout);
        }

        const { data: resData } = await resQuery;

        if (resData && resData.length > 0) {
          // Deduplikasi berdasarkan user_id, ambil skor tertinggi
          const dedupedMap = new Map<string, any>();
          
          resData.forEach((item: any) => {
            const currentScore = Math.round(Number(item.irt_score || item.score || 0));
            
            if (!dedupedMap.has(item.user_id)) {
              dedupedMap.set(item.user_id, {
                user_id: item.user_id,
                full_name: item.profiles?.full_name || item.user_name || "Siswa Pejuang PTN",
                asal_sekolah: item.profiles?.asal_sekolah || "SMA Negeri",
                target_prodi: item.profiles?.target_prodi || "Ilmu Komputer (UI)",
                best_score: currentScore,
                total_tryouts: 1,
                tryout_title: item.tryouts?.title || "Try Out SNBT 2026",
                tryout_id: item.tryout_id,
              });
            } else {
              const existing = dedupedMap.get(item.user_id);
              existing.total_tryouts += 1;
              if (currentScore > existing.best_score) {
                existing.best_score = currentScore;
              }
            }
          });

          const sorted = Array.from(dedupedMap.values()).sort((a, b) => b.best_score - a.best_score);
          
          const formatted: LeaderboardEntry[] = sorted.map((item, idx) => ({
            ...item,
            rank: idx + 1,
          }));
          
          setLeaderboard(formatted);
          const myEntry = formatted.find((e) => e.user_id === user.id);
          setMyRank(myEntry || null);
        } else {
          // 3. Benar-benar kosong — tidak ada dummy data
          setLeaderboard([]);
          setMyRank(null);
        }
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTryout]);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="max-w-2xl mx-auto space-y-5 py-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h1 className="text-xl font-extrabold text-slate-900">Live Rank SNBT</h1>
            <Badge className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 animate-pulse">LIVE</Badge>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Ranking nasional berdasarkan skor tertinggi Try Out
          </p>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="h-8 w-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-50">
          <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filter Tryout */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedTryout("all")}
          className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
            selectedTryout === "all"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Semua Try Out
        </button>
        {tryouts.map(t => (
          <button key={t.id} onClick={() => setSelectedTryout(t.id)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
              selectedTryout === t.id
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.title.length > 30 ? t.title.substring(0, 30) + "…" : t.title}
          </button>
        ))}
      </div>

      {/* My Rank Card (if logged in and have result) */}
      {myRank && (
        <Card className="bg-blue-600 text-white rounded-2xl p-4 border-0 shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-lg">
                #{myRank.rank}
              </div>
              <div>
                <p className="text-xs font-bold text-blue-100">Posisi Kamu Saat Ini</p>
                <p className="text-lg font-extrabold">{myRank.full_name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black">{Number(myRank.best_score).toFixed(1)}</p>
              <p className="text-[11px] text-blue-200 font-semibold">Skor Terbaik</p>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : leaderboard.length === 0 ? (
        /* Empty State — Belum ada peserta */
        <Card className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-xs">
          <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-base font-extrabold text-slate-700 mb-1">Belum Ada Peserta</h3>
          <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
            Ranking akan muncul otomatis setelah kamu atau peserta lain menyelesaikan Try Out pertama.
          </p>
          <div className="mt-5 p-3 rounded-xl bg-blue-50 border border-blue-100 inline-block">
            <p className="text-[11px] text-blue-700 font-bold">
              💡 Ikuti Try Out sekarang dan jadilah yang pertama di ranking!
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Top 3 Podium */}
          {top3.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {/* 2nd */}
              {top3[1] && (
                <div className="flex flex-col items-center text-center pt-4 space-y-2">
                  <Avatar className="h-12 w-12 rounded-xl border-2 border-slate-300 shadow-sm">
                    <AvatarFallback className="bg-slate-400 text-white font-black text-sm rounded-xl">
                      {(top3[1].full_name || "?").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 leading-tight line-clamp-1">{top3[1].full_name}</p>
                    <p className="text-lg font-black text-slate-700">{Number(top3[1].best_score).toFixed(0)}</p>
                    <div className="h-5 w-5 rounded-lg bg-slate-400 mx-auto flex items-center justify-center">
                      <Medal className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="w-full h-12 bg-slate-200 rounded-t-xl" />
                </div>
              )}

              {/* 1st */}
              {top3[0] && (
                <div className="flex flex-col items-center text-center space-y-2">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <Avatar className="h-14 w-14 rounded-xl border-2 border-amber-400 shadow-lg shadow-amber-400/20">
                    <AvatarFallback className="bg-amber-400 text-white font-black text-lg rounded-xl">
                      {(top3[0].full_name || "?").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 leading-tight line-clamp-1">{top3[0].full_name}</p>
                    <p className="text-xl font-black text-amber-600">{Number(top3[0].best_score).toFixed(0)}</p>
                    <div className="h-5 w-5 rounded-lg bg-amber-400 mx-auto flex items-center justify-center">
                      <Crown className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="w-full h-20 bg-amber-400/20 border-t-2 border-amber-400 rounded-t-xl" />
                </div>
              )}

              {/* 3rd */}
              {top3[2] && (
                <div className="flex flex-col items-center text-center pt-8 space-y-2">
                  <Avatar className="h-12 w-12 rounded-xl border-2 border-amber-700/50 shadow-sm">
                    <AvatarFallback className="bg-amber-700 text-white font-black text-sm rounded-xl">
                      {(top3[2].full_name || "?").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 leading-tight line-clamp-1">{top3[2].full_name}</p>
                    <p className="text-lg font-black text-amber-700">{Number(top3[2].best_score).toFixed(0)}</p>
                    <div className="h-5 w-5 rounded-lg bg-amber-700 mx-auto flex items-center justify-center">
                      <Medal className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="w-full h-8 bg-amber-700/10 border-t-2 border-amber-700/40 rounded-t-xl" />
                </div>
              )}
            </div>
          )}

          {/* Full List */}
          <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-700">
                  {leaderboard.length} Peserta
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                Diperbarui {lastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {leaderboard.map((entry) => {
                const isMe = entry.user_id === currentUserId;
                const isTop3 = entry.rank <= 3;
                return (
                  <div
                    key={`${entry.user_id}-${entry.tryout_id}`}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      isMe
                        ? "bg-blue-50 border-l-2 border-blue-500"
                        : isTop3
                        ? "bg-amber-50/50"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    <RankBadge rank={entry.rank} />

                    <Avatar className="h-9 w-9 rounded-xl border border-slate-100 shrink-0">
                      <AvatarFallback className={`font-black text-sm rounded-xl ${
                        isMe ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}>
                        {(entry.full_name || "?").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-xs font-extrabold truncate ${isMe ? "text-blue-700" : "text-slate-900"}`}>
                          {entry.full_name}
                          {isMe && <span className="ml-1 text-[10px] font-bold text-blue-600">(Kamu)</span>}
                        </p>
                        {entry.rank === 1 && <Flame className="h-3 w-3 text-amber-500 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {entry.asal_sekolah && (
                          <span className="text-[10px] text-slate-400 font-medium truncate max-w-32">
                            🏫 {entry.asal_sekolah}
                          </span>
                        )}
                        {entry.target_prodi && (
                          <span className="text-[10px] text-blue-500 font-semibold flex items-center gap-1">
                            <Avatar className="h-3.5 w-3.5 rounded-sm">
                              <AvatarImage
                                src={getUnivLogoUrl(entry.tryout_title) ?? undefined}
                                className="object-contain"
                              />
                              <AvatarFallback className="text-[6px] bg-blue-100 text-blue-600 rounded-sm">
                                PTN
                              </AvatarFallback>
                            </Avatar>
                            {entry.target_prodi}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className={`text-base font-black ${
                        entry.rank === 1 ? "text-amber-500" :
                        entry.rank === 2 ? "text-slate-500" :
                        entry.rank === 3 ? "text-amber-700" :
                        isMe ? "text-blue-600" : "text-slate-800"
                      }`}>
                        {Number(entry.best_score).toFixed(1)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">{entry.total_tryouts}x TO</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}

      <p className="text-center text-[11px] text-slate-400 font-medium pb-2">
        Ranking diperbarui otomatis setiap kamu selesai Try Out
      </p>
    </div>
  );
}
