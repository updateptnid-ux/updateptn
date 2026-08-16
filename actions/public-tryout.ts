"use server";

import { createClient } from "@/lib/supabase/server";

export interface PublicTryoutItem {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  total_questions: number;
  scheduled_date: string;
  is_free: boolean;
  participants_count: number | null;
}

/**
 * Fetch 1 tryout terbaru untuk ditampilkan di landing page publik.
 * Hanya ambil kolom yang aman — tidak ada soal, jawaban, atau data sensitif lain.
 */
export async function getLatestPublicTryout(): Promise<PublicTryoutItem | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("tryouts")
      .select(
        "id, title, description, duration_minutes, total_questions, scheduled_date, is_free, participants_count"
      )
      .gte("scheduled_date", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // hanya yang belum lewat 1 hari
      .order("scheduled_date", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[getLatestPublicTryout] Supabase error:", error.message);
      return null;
    }

    return data as PublicTryoutItem | null;
  } catch (err) {
    console.error("[getLatestPublicTryout] Unexpected error:", err);
    return null;
  }
}
