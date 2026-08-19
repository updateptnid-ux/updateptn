"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/fade-in";
import { Calendar, Clock, FileText, Users, ArrowRight, Flame } from "lucide-react";

interface PublicTryoutItem {
  id: string;
  title: string;
  duration_minutes: number;
  total_questions: number;
  scheduled_date: string;
  is_free: boolean;
  participants_count: number | null;
}

// Kolom aman yang di-select — tidak ada soal, jawaban, atau data sensitif
const SAFE_COLUMNS =
  "id, title, duration_minutes, total_questions, scheduled_date, is_free, participants_count";

export default function TryoutTerbaruInlineCard() {
  const [tryout, setTryout] = useState<PublicTryoutItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTryout = async () => {
      const supabase = createClient();
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      try {
        const { data, error } = await supabase
          .from("tryouts")
          .select(SAFE_COLUMNS)
          .gte("scheduled_date", cutoff)
          .order("scheduled_date", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (!error && data) setTryout(data as PublicTryoutItem);
      } catch (err) {
        // ignore error
      } finally {
        setLoading(false);
      }
    };
    
    fetchTryout();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto rounded-2xl bg-blue-50/60 border border-blue-100 h-[72px] animate-pulse" />
    );
  }

  // DB kosong atau belum ada tryout → tidak tampilkan apapun (no fake data)
  if (!tryout) return null;

  const daysUntil = Math.ceil(
    (new Date(tryout.scheduled_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const countdownLabel =
    daysUntil <= 0 ? "Hari ini!" : daysUntil === 1 ? "Besok!" : `${daysUntil} hari lagi`;
  const isUrgent = daysUntil <= 5;

  const formattedDate = new Date(tryout.scheduled_date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <FadeIn delay={0.2} className="w-full max-w-2xl mx-auto">
      <Link
        href={`/register?redirect=/tryout/${tryout.id}`}
        className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-2xl"
        aria-label={`Daftar Try Out: ${tryout.title}`}
      >
        <div className="relative rounded-2xl border border-blue-200/70 bg-white shadow-md shadow-blue-500/8 overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/15 group-hover:-translate-y-0.5">

          {/* Top gradient stripe */}
          <div className="h-[3px] w-full bg-blue-500" />

          <div className="px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">

            {/* Icon */}
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow shadow-blue-500/25 shrink-0">
              <Flame className="h-[18px] w-[18px] text-white" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {/* Label row */}
              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 leading-none">
                  Try Out Terbaru
                </span>
                {tryout.is_free ? (
                  <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white text-[9px] font-bold px-1.5 h-[14px] rounded-sm">
                    GRATIS
                  </Badge>
                ) : (
                  <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white text-[9px] font-bold px-1.5 h-[14px] rounded-sm">
                    PREMIUM
                  </Badge>
                )}
                {isUrgent && (
                  <span className="text-[10px] font-bold text-red-500 animate-pulse">
                    🔥 {countdownLabel}
                  </span>
                )}
              </div>

              {/* Title */}
              <p className="text-sm font-bold text-slate-900 leading-snug truncate group-hover:text-blue-700 transition-colors">
                {tryout.title}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[11px] font-medium text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-blue-400" />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-blue-400" />
                  {tryout.duration_minutes} menit
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3 text-blue-400" />
                  {tryout.total_questions} soal
                </span>
                {tryout.participants_count != null && tryout.participants_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-blue-400" />
                    {tryout.participants_count.toLocaleString("id-ID")} peserta
                  </span>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-1.5 bg-blue-600 group-hover:bg-blue-700 text-white font-bold text-[11px] rounded-xl px-3.5 py-2.5 transition-all shadow-sm shadow-blue-500/20 shrink-0 whitespace-nowrap">
              Daftar Sekarang
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>

          </div>
        </div>
      </Link>
    </FadeIn>
  );
}
