"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/fade-in";
import { Calendar, Clock, FileText, Users, ArrowRight, Sparkles, Bell, Flame } from "lucide-react";

interface PublicTryoutItem {
  id: string;
  title: string;
  duration_minutes: number;
  total_questions: number;
  scheduled_date: string;
  is_free: boolean;
  participants_count: number | null;
}

interface ArticleItem {
  id: string;
  title: string;
  category: string;
  published_at: string;
}

// Kolom aman yang di-select — tidak ada soal, jawaban, atau data sensitif
const SAFE_COLUMNS =
  "id, title, duration_minutes, total_questions, scheduled_date, is_free, participants_count";

export default function TryoutTerbaruInlineCard() {
  const [tryout, setTryout] = useState<PublicTryoutItem | null>(null);
  const [article, setArticle] = useState<ArticleItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      try {
        // 1. Coba ambil tryout terbaru
        const { data: tryoutData } = await supabase
          .from("tryouts")
          .select(SAFE_COLUMNS)
          .gte("scheduled_date", cutoff)
          .order("scheduled_date", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (tryoutData) {
          setTryout(tryoutData as PublicTryoutItem);
          return; // Berhenti kalau tryout ketemu
        }

        // 2. Kalau gak ada tryout, coba ambil berita/artikel terbaru
        const { data: articleData } = await supabase
          .from("articles")
          .select("id, title, category, published_at")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (articleData) {
          setArticle(articleData as ArticleItem);
        }

      } catch (err) {
        // ignore error
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-xl mx-auto rounded-full bg-green-50/60 border border-green-200 h-12 animate-pulse" />
    );
  }

  // Fallback 1: Tampilkan Berita Terbaru kalau tidak ada Try Out
  if (!tryout && article) {
    return (
      <FadeIn delay={0.2} className="w-full max-w-xl mx-auto">
        <Link
          href={`/articles/${article.id}`}
          className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
        >
          <div className="relative rounded-full border-2 border-blue-500 bg-white px-5 py-2.5 flex items-center justify-center gap-3 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/20 group-hover:-translate-y-0.5 group-hover:border-blue-600">
            <Bell className="h-5 w-5 text-blue-600 shrink-0" />
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                {article.category || "Info"}
              </Badge>
              <span className="text-sm md:text-base font-bold text-slate-900 line-clamp-1">
                {article.title}
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-blue-600 shrink-0 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </FadeIn>
    );
  }

  // Fallback 2: Tampilkan Promo Flash Sale kalau Try Out & Berita kosong
  if (!tryout && !article) {
    return (
      <FadeIn delay={0.2} className="w-full max-w-xl mx-auto">
        <Link href="/pricing" className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-full">
          <div className="relative rounded-full border border-orange-200 bg-orange-50/50 px-5 py-2.5 flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-shadow group-hover:-translate-y-0.5 duration-300">
            <Flame className="h-5 w-5 text-orange-600 shrink-0" />
            <span className="text-sm md:text-base font-bold text-orange-800">
              Diskon 50% Paket Premium Terbatas! 🎫
            </span>
            <ArrowRight className="h-4 w-4 text-orange-600 shrink-0 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </FadeIn>
    );
  }

  const formattedDate = new Date(tryout.scheduled_date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <FadeIn delay={0.2} className="w-full max-w-xl mx-auto">
      <Link
        href={`/register?redirect=/tryout/${tryout.id}`}
        className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 rounded-full"
        aria-label={`Daftar Try Out: ${tryout.title}`}
      >
        <div className="relative rounded-full border-2 border-green-500 bg-white px-5 py-2.5 flex items-center justify-center gap-3 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-green-500/20 group-hover:-translate-y-0.5 group-hover:border-green-600">
          
          {/* Icon */}
          <Sparkles className="h-5 w-5 text-green-600 shrink-0" />

          {/* Text */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-sm md:text-base font-bold text-slate-900">
              {tryout.title}
            </span>
            <span className="text-sm md:text-base font-semibold text-green-600">
              - {formattedDate} 🎉
            </span>
          </div>

          {/* Arrow */}
          <ArrowRight className="h-4 w-4 text-green-600 shrink-0 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    </FadeIn>
  );
}
