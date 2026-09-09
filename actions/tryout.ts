"use server";

import { createClient } from "@/lib/supabase/server";
import { submitRateLimit } from "@/lib/rate-limit";

export async function submitTryoutAction(payload: {
  tryoutId: string;
  answers: Record<string, string>; // questionId -> selectedOption ("A" | "B" | "C" | "D" | "E")
  questionTimeSpent?: Record<string, number>; // questionId -> seconds spent
}) {
  const { tryoutId, answers, questionTimeSpent = {} } = payload;
  const supabase = await createClient();

  // Get current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { 
      success: false, 
      error: "User not authenticated. Please login first." 
    };
  }

  // Rate limit check (prevent rapid submissions/cheating)
  const rateLimitResult = await submitRateLimit.check(`tryout:${user.id}:${tryoutId}`);
  if (!rateLimitResult.success) {
    const waitSeconds = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
    return {
      success: false,
      error: `Terlalu cepat! Tunggu ${waitSeconds} detik sebelum submit lagi.`
    };
  }

  // Fetch all questions with IRT parameters for this tryout
  let { data: questions, error: qError } = await supabase
    .from("questions")
    .select("id, correct_answer, irt_discrimination, irt_difficulty, subtest")
    .eq("tryout_id", tryoutId);

  // Jika tidak ada soal untuk try-out ini, jangan lanjutkan
  if (qError || !questions || questions.length === 0) {
    return { 
      success: false, 
      error: "Paket try-out ini belum memiliki soal. Silakan hubungi admin untuk melengkapi soal try-out ini terlebih dahulu." 
    };
  }

  // Fetch tryout details to know scoring type
  let tryoutInfo: any = null;
  if (!tryoutId.startsWith("latihan-")) {
    const { data: tInfo } = await supabase
      .from("tryouts")
      .select("tryout_type, mandiri_category")
      .eq("id", tryoutId)
      .maybeSingle();
    tryoutInfo = tInfo;
  }

  let totalCorrect = 0;
  let totalQuestions = questions.length;
  let weightedScore = 0;
  let maxPossibleWeight = 0;
  
  // Custom Raw Score parameters (for SIMAK UI or special systems)
  let rawScore = 0;
  let maxRawScore = 0;

  const subtestScores: Record<string, { correct: number; total: number; weighted: number; maxWeight: number; irt_score: number; wrong: number; empty: number; raw_score?: number }> = {};

  // Initialize subtestScores
  questions.forEach((q) => {
    const sub = q.subtest || "Lainnya";
    if (!subtestScores[sub]) {
      subtestScores[sub] = { correct: 0, total: 0, weighted: 0, maxWeight: 0, irt_score: 0, wrong: 0, empty: 0 };
    }
    subtestScores[sub].total += 1;
  });

  // Calculate scores based on the specific exam rules
  const questionAnalytics: any[] = [];
  const mandiriCategory = tryoutInfo?.mandiri_category || "";

  questions.forEach((q) => {
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer && userAnswer.toUpperCase() === q.correct_answer.toUpperCase();
    const isAnswered = !!userAnswer;
    const sub = q.subtest || "Lainnya";
    
    // Store analytics for this question
    questionAnalytics.push({
      question_id: q.id,
      user_answer: userAnswer || null,
      correct_answer: q.correct_answer,
      is_correct: isCorrect,
      time_spent_seconds: questionTimeSpent[q.id] || 0,
      skipped: !isAnswered,
      subtest: sub,
    });

    if (isCorrect) {
      totalCorrect += 1;
      subtestScores[sub].correct += 1;
    } else if (isAnswered) {
      subtestScores[sub].wrong += 1;
    } else {
      subtestScores[sub].empty += 1;
    }

    // ── SPECIFIC SCORING SYSTEMS ─────────────────────────────
    if (tryoutInfo?.tryout_type === "mandiri" && mandiriCategory === "SIMAK UI") {
      // SIMAK UI SCORING SYSTEM
      // Kemampuan Dasar (Matematika Dasar, B. Indonesia, B. Inggris): Benar +4, Salah -1, Kosong 0
      // Kemampuan Skolastik (Verbal, Kuantitatif, Logika): Benar +1, Salah 0, Kosong 0
      const isKemampuanDasar = 
        sub.toLowerCase().includes("matematika dasar") || 
        sub.toLowerCase().includes("indonesia") || 
        sub.toLowerCase().includes("inggris");

      if (isKemampuanDasar) {
        maxRawScore += 4;
        const subRaw = isCorrect ? 4 : (isAnswered ? -1 : 0);
        rawScore += subRaw;
        subtestScores[sub].weighted += subRaw;
        subtestScores[sub].maxWeight += 4;
      } else {
        maxRawScore += 1;
        const subRaw = isCorrect ? 1 : 0;
        rawScore += subRaw;
        subtestScores[sub].weighted += subRaw;
        subtestScores[sub].maxWeight += 1;
      }
    } else {
      // Standard IRT Calculation (for SNBT, SMMPTN-Barat, SSU ITB, UM UGM, Bela Negara)
      // IRT Parameters (with defaults if not set)
      const discrimination = q.irt_discrimination || 1.5; 
      const difficulty = q.irt_difficulty || 0.0; 
      
      const weight = 1.0 + (Math.max(difficulty, 0) * 0.3);
      
      maxPossibleWeight += weight;
      subtestScores[sub].maxWeight += weight;
      
      if (isCorrect) {
        weightedScore += weight;
        subtestScores[sub].weighted += weight;
      }
    }
  });

  // Calculate Final Scores mapped to 200 - 1000 scale
  let finalScore = 0;

  if (tryoutInfo?.tryout_type === "mandiri" && mandiriCategory === "SIMAK UI") {
    // Map SIMAK UI raw score to standard scale (200 - 1000)
    // SIMAK UI can have negative scores, make sure to handle it safely (min raw score can be -45)
    const minPossibleRaw = -45; 
    const rawRange = maxRawScore - minPossibleRaw;
    const rawRatio = (rawScore - minPossibleRaw) / Math.max(rawRange, 1);
    finalScore = Math.round(200 + (rawRatio * 800));

    // Map subtest scores for SIMAK UI
    Object.keys(subtestScores).forEach(sub => {
      const s = subtestScores[sub];
      const isKemampuanDasar = 
        sub.toLowerCase().includes("matematika dasar") || 
        sub.toLowerCase().includes("indonesia") || 
        sub.toLowerCase().includes("inggris");
      
      const minSubRaw = isKemampuanDasar ? -(s.total) : 0;
      const maxSubRaw = isKemampuanDasar ? (s.total * 4) : s.total;
      const subRawRange = maxSubRaw - minSubRaw;
      const subRatio = (s.weighted - minSubRaw) / Math.max(subRawRange, 1);
      s.irt_score = Math.round(200 + (subRatio * 800));
      s.raw_score = s.weighted; // Store raw value
    });
  } else {
    // Standard IRT / CEEB (Scale: 200 - 1000 / 200 - 800)
    const isCeeb = tryoutInfo?.tryout_type === "mandiri" && mandiriCategory === "SMMPTN-Barat";
    const scaleMax = isCeeb ? 800 : 1000;
    const scaleRange = isCeeb ? 600 : 800;

    const weightedRatio = weightedScore / Math.max(maxPossibleWeight, 1);
    finalScore = Math.round(200 + (weightedRatio * scaleRange));

    Object.keys(subtestScores).forEach(sub => {
      const s = subtestScores[sub];
      const subRatio = s.weighted / Math.max(s.maxWeight, 1);
      s.irt_score = Math.round(200 + (subRatio * scaleRange));
    });
  }

  const irtScore = finalScore;

  // Simple ability estimate (theta) for future analysis
  const totalWrong = totalQuestions - totalCorrect;
  const abilityEstimate = totalWrong > 0 
    ? Math.log((totalCorrect + 0.5) / (totalWrong + 0.5)) 
    : 2.0; // Max ability if perfect score

  // Insert into Supabase results table
  const { data: resultData, error: insertError } = await supabase
    .from("results")
    .insert({
      user_id: user.id,
      tryout_id: tryoutId.startsWith("latihan-") ? "11111111-1111-1111-1111-111111111111" : tryoutId,
      score: irtScore,
      irt_score: irtScore,
      total_correct: totalCorrect,
      total_questions: totalQuestions,
      subtest_scores: subtestScores,
      question_analytics: questionAnalytics, // Store detailed analytics
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("Error inserting result:", insertError);
    return {
      success: false,
      error: "Failed to save result. Please try again."
    };
  }

  if (!resultData) {
    return {
      success: false,
      error: "Failed to retrieve result ID."
    };
  }

  // Jika user punya free claim 'approved' untuk tryout ini,
  // tandai sebagai 'used' supaya akses terkunci setelah 1x dikerjakan
  if (!tryoutId.startsWith("latihan-")) {
    try {
      await supabase
        .from("free_access_requests")
        .update({ status: "used", updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("tryout_id", tryoutId)
        .eq("status", "approved");
    } catch (e) {
      // Non-fatal: jangan gagalkan submit hanya karena ini
      console.warn("Gagal update free claim status:", e);
    }
  }

  return { 
    success: true, 
    resultId: resultData.id, 
    score: irtScore, 
    totalCorrect, 
    totalQuestions,
    weightedScore: Math.round(weightedScore),
    abilityEstimate: Number(abilityEstimate.toFixed(2))
  };
}

/**
 * Save try-out session progress (for pause/resume)
 */
export async function saveTryoutSession(payload: {
  tryoutId: string;
  currentQuestionIndex: number;
  activeSubtestIndex: number;
  answers: Record<string, string>;
  flaggedQuestions: Record<string, boolean>;
  questionTimeSpent: Record<string, number>;
  timeRemainingSeconds: number;
  totalDurationSeconds: number;
  selectedTargets?: any[];
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "User not authenticated",
    };
  }

  try {
    // Calculate expiry (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Check if session already exists
    const { data: existingSession } = await supabase
      .from("tryout_sessions")
      .select("id")
      .eq("user_id", user.id)
      .eq("tryout_id", payload.tryoutId)
      .eq("status", "in_progress")
      .maybeSingle();

    if (existingSession) {
      // Update existing session
      const { error: updateError } = await supabase
        .from("tryout_sessions")
        .update({
          current_question_index: payload.currentQuestionIndex,
          active_subtest_index: payload.activeSubtestIndex,
          answers: payload.answers,
          flagged_questions: payload.flaggedQuestions,
          question_time_spent: payload.questionTimeSpent,
          time_remaining_seconds: payload.timeRemainingSeconds,
          total_duration_seconds: payload.totalDurationSeconds,
          selected_targets: payload.selectedTargets || [],
          status: "paused",
          expires_at: expiresAt.toISOString(),
        })
        .eq("id", existingSession.id);

      if (updateError) {
        console.error("Error updating session:", updateError);
        return {
          success: false,
          error: "Gagal menyimpan progress",
        };
      }
    } else {
      // Create new session
      const { error: insertError } = await supabase
        .from("tryout_sessions")
        .insert({
          user_id: user.id,
          tryout_id: payload.tryoutId,
          current_question_index: payload.currentQuestionIndex,
          active_subtest_index: payload.activeSubtestIndex,
          answers: payload.answers,
          flagged_questions: payload.flaggedQuestions,
          question_time_spent: payload.questionTimeSpent,
          time_remaining_seconds: payload.timeRemainingSeconds,
          total_duration_seconds: payload.totalDurationSeconds,
          selected_targets: payload.selectedTargets || [],
          status: "paused",
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) {
        console.error("Error creating session:", insertError);
        return {
          success: false,
          error: "Gagal menyimpan progress",
        };
      }
    }

    return {
      success: true,
      message: "Progress berhasil disimpan",
    };
  } catch (error) {
    console.error("Error saving session:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat menyimpan progress",
    };
  }
}

/**
 * Get saved try-out session
 */
export async function getTryoutSession(tryoutId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "User not authenticated",
    };
  }

  try {
    const { data: session, error } = await supabase
      .from("tryout_sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("tryout_id", tryoutId)
      .in("status", ["in_progress", "paused"])
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching session:", error);
      return {
        success: false,
        error: "Gagal mengambil data session",
      };
    }

    if (!session) {
      return {
        success: true,
        data: null,
      };
    }

    // Check if session expired
    if (session.expires_at && new Date(session.expires_at) < new Date()) {
      // Mark as expired
      await supabase
        .from("tryout_sessions")
        .update({ status: "expired" })
        .eq("id", session.id);

      return {
        success: true,
        data: null,
        expired: true,
      };
    }

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error("Error getting session:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengambil session",
    };
  }
}

/**
 * Mark session as completed (after submit)
 */
export async function completeTryoutSession(tryoutId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false };
  }

  try {
    await supabase
      .from("tryout_sessions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("tryout_id", tryoutId)
      .in("status", ["in_progress", "paused"]);

    return { success: true };
  } catch (error) {
    console.error("Error completing session:", error);
    return { success: false };
  }
}

/**
 * Delete session (user wants to restart)
 */
export async function deleteTryoutSession(tryoutId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false };
  }

  try {
    await supabase
      .from("tryout_sessions")
      .delete()
      .eq("user_id", user.id)
      .eq("tryout_id", tryoutId);

    return { success: true };
  } catch (error) {
    console.error("Error deleting session:", error);
    return { success: false };
  }
}
