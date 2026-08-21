"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Calendar, Award } from "lucide-react";

interface TryoutScore {
  tryout_name: string;
  score: number;
  taken_at: string;
}

export default function ImprovementChart({ userId }: { userId?: string }) {
  const [scores, setScores] = useState<TryoutScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScores() {
      try {
        const supabase = createClient();
        
        // Get current user if userId not provided
        let targetUserId = userId;
        if (!targetUserId) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          targetUserId = user.id;
        }

        // Fetch tryout results
        const { data, error } = await supabase
          .from("results")
          .select(`
            score,
            total_score,
            created_at,
            tryouts (
              title
            )
          `)
          .eq("user_id", targetUserId)
          .not("created_at", "is", null)
          .order("created_at", { ascending: true })
          .limit(10);

        if (error) throw error;

        const formattedScores = (data || []).map((item: any) => ({
          tryout_name: item.tryouts?.title || "Try Out",
          score: item.score ?? item.total_score ?? 0,
          taken_at: new Date(item.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          }),
        }));

        setScores(formattedScores);
      } catch (err) {
        console.error("Error fetching improvement data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchScores();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-48"></div>
          <div className="h-64 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-200 p-8">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <TrendingUp className="h-12 w-12 text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Belum Ada Data Progress</h3>
          <p className="text-base text-slate-600 max-w-md mx-auto leading-relaxed">
            Selesaikan try out pertamamu untuk melihat grafik perkembangan nilai!
          </p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const latestScore = scores[scores.length - 1]?.score || 0;
  const firstScore = scores[0]?.score || 0;
  const improvement = latestScore - firstScore;
  const improvementPercent = firstScore > 0 ? ((improvement / firstScore) * 100).toFixed(1) : "0";
  const averageScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            Progress Perkembangan
          </h3>
          <p className="text-sm md:text-base text-slate-500 mt-1">
            Tracking {scores.length} Try Out terakhir
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-5 w-5 text-green-600" />
            <p className="text-xs md:text-sm font-semibold text-green-700">Nilai Terbaru</p>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-green-900">{latestScore}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <p className="text-xs md:text-sm font-semibold text-blue-700">Peningkatan</p>
          </div>
          <p className={`text-2xl md:text-3xl font-bold ${improvement >= 0 ? "text-green-900" : "text-red-900"}`}>
            {improvement >= 0 ? "+" : ""}{improvement}
          </p>
          <p className="text-xs text-slate-600 mt-1">({improvementPercent}%)</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200 col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <p className="text-xs md:text-sm font-semibold text-purple-700">Rata-rata</p>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-purple-900">{averageScore.toFixed(0)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72 md:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={scores}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="taken_at" 
              stroke="#64748b"
              style={{ fontSize: '13px', fontWeight: 500 }}
              tick={{ fill: '#475569' }}
            />
            <YAxis 
              stroke="#64748b"
              style={{ fontSize: '13px', fontWeight: 500 }}
              tick={{ fill: '#475569' }}
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '14px',
                fontWeight: 600,
              }}
              labelStyle={{ color: '#0f172a', fontWeight: 700 }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '14px', fontWeight: 600 }}
            />
            <Line
              type="monotone"
              dataKey="score"
              name="Nilai"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ fill: '#2563eb', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Motivation Message */}
      {improvement > 0 ? (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <p className="text-base font-semibold text-green-900">
            🎉 Keren! Kamu sudah meningkat <span className="text-green-700">{improvement} poin</span> dari try out pertama!
          </p>
          <p className="text-sm text-green-700 mt-1">Terus semangat latihan, PTN impianmu semakin dekat!</p>
        </div>
      ) : improvement < 0 ? (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
          <p className="text-base font-semibold text-orange-900">
            💪 Jangan menyerah! Ini adalah proses belajar.
          </p>
          <p className="text-sm text-orange-700 mt-1">Identifikasi kesalahanmu dan fokus berlatih di area yang lemah!</p>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <p className="text-base font-semibold text-blue-900">
            📈 Nilai kamu stabil! Saatnya push lebih keras!
          </p>
          <p className="text-sm text-blue-700 mt-1">Coba strategi baru dan tingkatkan kecepatan mengerjakanmu!</p>
        </div>
      )}
    </div>
  );
}
